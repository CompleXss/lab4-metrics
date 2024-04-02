import path from 'path'
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import { getCpuName, getGpuName, getMetrics, updateMetrics } from './scripts/metrics.js'
import { MODE, criticalLimits, data } from './scripts/containers.js'
import { sleep } from './scripts/utils.js'
import dotenv from 'dotenv'
import { generateToken, isTokenValid } from './scripts/auth.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

const server = http.createServer(app)
const socket = new Server(server)



app.use('/static', express.static(path.resolve('static')))
app.use(express.json())
app.use(cookieParser())

app.get('/login', (req, res) => {
    res.sendFile(path.resolve('templates/login.html'))
})



app.post('/login', (req, res) => {
    const user = req.body

    if (user.login === process.env.USER_LOGIN && user.password === process.env.USER_PASSWORD) {
        const token = generateToken()
        res.cookie('token', token)
        res.redirect('/')

        console.log('token cookie sent')
    }
})

app.get('/', (req, res) => {
    const token = req.cookies.token

    if (isTokenValid(token)) {   
        res.sendFile(path.resolve('templates/index.html'))
    }
    else {
        res.redirect('/login')
    }
})



socket.on('connection', async (localSocket) => {
    localSocket.on('setCriticalLimits', data => {
        criticalLimits.cpuLoad = data.cpuLoad
        criticalLimits.cpuTemp = data.cpuTemp
        criticalLimits.gpuLoad = data.gpuLoad
        criticalLimits.gpuTemp = data.gpuTemp
        criticalLimits.memLoad = data.memLoad

        socket.emit('criticalLimits', criticalLimits)
    })

    localSocket.on('setLogEmail', email => {
        data.logEmail = email.toString()
        socket.emit('logEmail', data.logEmail)
    })

    localSocket.on('setMetricsMode', mode => {
        mode = Number(mode)

        if (mode >= MODE.LAST_MINUTE && mode <= MODE.LAST_WEEK) {
            data.metricsMode = mode
            socket.emit('metricsMode', data.metricsMode)

            const metrics = getMetrics(data.metricsMode)
            if (metrics) socket.emit('metrics', metrics)
        }
    })



    localSocket.emit('metricsMode', data.metricsMode)
    localSocket.emit('criticalLimits', criticalLimits)
    localSocket.emit('logEmail', data.logEmail)

    const metrics = getMetrics(data.metricsMode)
    if (metrics) socket.emit('metrics', metrics)

    localSocket.emit('deviceNames', {
        cpu: await getCpuName(),
        gpu: await getGpuName(),
    })
})



new Promise(async () => {
    while (true) {
        const task = new Promise(async resolve => {
            await updateMetrics()
            const metrics = getMetrics(data.metricsMode)

            if (metrics) {
                socket.emit('metrics', metrics)
            }
            resolve()
        })

        await Promise.all([sleep(1000), task])
    }
})



server.listen(port, () => {
    console.log('Server started on port: ' + port)
})
