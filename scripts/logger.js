import { criticalLimits, logEmail } from './containers.js'
import { getProcesses } from './metrics.js'
import { getDate } from './utils.js'
import Queue from 'queue'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import nodemailer from 'nodemailer'

const emailUser = 'mp.maksim30@gmail.com'
const emailPass = 'uigi bxio gayn toyt'

const dbLogQueue = new Queue({ results: [] })
dbLogQueue.concurrency = 1
dbLogQueue.autostart = true

const emailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: emailUser,
        pass: emailPass,
    }
})

function openConnection() {
    return open({
        filename: './logs.db',
        driver: sqlite3.Database
    })
}



export function logIfAboveCriticalLimits(info) {
    let message = ''

    message += append('Загрузка ЦП', info.cpu.load, criticalLimits.cpuLoad)
    message += append('Температура ЦП', info.cpu.temp, criticalLimits.cpuTemp)
    message += append('Загрузка видеокарты', info.gpu.load, criticalLimits.gpuLoad)
    message += append('Температура видеокарты', info.gpu.temp, criticalLimits.gpuTemp)
    message += append('Загрузка ОЗУ', info.mem.load, criticalLimits.memLoad)

    if (message !== '') {
        logToDB(message)
        sendEmail(message, logEmail)
    }
}

function append(param, value, limit) {
    if (value < limit) return ''
    return param + ' превысила ' + value + '%\n'
}

async function logToDB(message) {
    const date = getDate()
    const processes = await getProcesses()

    dbLogQueue.push(async callback => {
        console.log('Started logging to DB')

        try {
            var db = await openConnection()

            const result = await db.run('insert into LimitsExceededLogs values(?, ?, ?)', [null, message, date])
            if (!result?.lastID) {
                throw 'error'
            }

            const stmt = await db.prepare('insert into Processes values(?, ?, ?, ?, ?, ?, ?)')

            for (let i = 0; i < processes.length; i++) {
                const p = processes[i]
                await stmt.run(result.lastID, p.pid, p.parentPid, p.name, p.cpu, p.mem, p.started)
            }
            await stmt.finalize()

            console.log('Successfully logged to DB')
        }
        catch (e) {
            console.log('Error writing to DB:')
            console.log(e)
        }
        finally {
            db?.close()
            callback()
        }
    })

    console.log('Added new DB log entry to queue')
}

async function sendEmail(message, email) {
    if (!email || email === '') {
        return
    }

    try {
        await emailTransporter.sendMail({
            from: emailUser,
            to: email,
            subject: 'Server warning',
            text: message,
        })

        console.log('Email log sent')
    }
    catch (e) {
        console.log('Error sending email to: ' + email)
        console.log(e)
    }
}
