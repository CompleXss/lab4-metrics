import path from 'path'
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import { getCpuName, getGpuName, getMetrics, updateMetrics } from './scripts/metrics.js'
import { criticalLimits, logEmail, metricsMode } from './scripts/containers.js'
import { sleep } from './scripts/utils.js'

const app = express()
const port = 3000

const server = http.createServer(app)
const socket = new Server(server)

app.use('/static', express.static('static'))

app.get('/', (req, res) => {
    res.sendFile(path.resolve('templates/index.html'))
})



socket.on('connection', async (socket) => {
    socket.emit('deviceNames', {
        cpu: await getCpuName(),
        gpu: await getGpuName(),
    })

    socket.on('setCriticalLimits', data => {
        criticalLimits.cpuLoad = data.cpuLoad
        criticalLimits.cpuTemp = data.cpuTemp
        criticalLimits.gpuLoad = data.gpuLoad
        criticalLimits.gpuTemp = data.gpuTemp
        criticalLimits.memLoad = data.memLoad
    })

    socket.on('setLogEmail', email => {
        logEmail = email.toString()
    })

    socket.on('setMetricsMode', mode => {
        metricsMode = mode
    })
})



new Promise(async () => {
    while (true) {
        const task = new Promise(async resolve => {
            await updateMetrics()
            const metrics = getMetrics(metricsMode)

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
