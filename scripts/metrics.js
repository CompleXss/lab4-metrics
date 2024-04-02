import si from 'systeminformation'
import { MODE, metricsData } from './containers.js'
import { logIfAboveCriticalLimits } from './logger.js'

export async function getCpuName() {
    const info = await si.cpu()
    const name = info.manufacturer + ' ' + info.brand
    return name
}

export async function getGpuName() {
    const GPUs = (await si.graphics()).controllers

    let name
    for (let i = 0; i < GPUs.length; i++) {
        name = name || GPUs[i].model

        if (GPUs[i].temperatureGpu) {
            name = GPUs[i].model
            break
        }
    }

    name ??= 'GPU'
    return name
}

export async function getProcesses() {
    const info = await si.processes()
    const processes = info.list.map(x => {
        return {
            pid: x.pid,
            parentPid: x.parentPid,
            name: x.name,
            cpu: x.cpu,
            mem: x.mem,
            started: x.started,
        }
    })

    return processes
}

export function getMetrics(mode) {
    switch (mode) {
        case MODE.LAST_MINUTE: return {
            cpuLoad: metricsData.cpuLoad.data_m.map(x => x.arr),
            cpuTemp: metricsData.cpuTemp.data_m.map(x => x.arr),
            gpuLoad: metricsData.gpuLoad.data_m.map(x => x.arr),
            gpuTemp: metricsData.gpuTemp.data_m.map(x => x.arr),
            memLoad: metricsData.memLoad.data_m.map(x => x.arr),
            memInfo: {
                maxLoad: metricsData.memLoad.max,
                loadUnits: metricsData.memUnits,
            },
        }

        case MODE.LAST_HOUR: return {
            cpuLoad: metricsData.cpuLoad.data_h.map(x => x.arr),
            cpuTemp: metricsData.cpuTemp.data_h.map(x => x.arr),
            gpuLoad: metricsData.gpuLoad.data_h.map(x => x.arr),
            gpuTemp: metricsData.gpuTemp.data_h.map(x => x.arr),
            memLoad: metricsData.memLoad.data_h.map(x => x.arr),
            memInfo: {
                maxLoad: metricsData.memLoad.max,
                loadUnits: metricsData.memUnits,
            },
        }

        case MODE.LAST_DAY: return {
            cpuLoad: metricsData.cpuLoad.data_d.map(x => x.arr),
            cpuTemp: metricsData.cpuTemp.data_d.map(x => x.arr),
            gpuLoad: metricsData.gpuLoad.data_d.map(x => x.arr),
            gpuTemp: metricsData.gpuTemp.data_d.map(x => x.arr),
            memLoad: metricsData.memLoad.data_d.map(x => x.arr),
            memInfo: {
                maxLoad: metricsData.memLoad.max,
                loadUnits: metricsData.memUnits,
            },
        }

        case MODE.LAST_WEEK: return {
            cpuLoad: metricsData.cpuLoad.data_w.map(x => x.arr),
            cpuTemp: metricsData.cpuTemp.data_w.map(x => x.arr),
            gpuLoad: metricsData.gpuLoad.data_w.map(x => x.arr),
            gpuTemp: metricsData.gpuTemp.data_w.map(x => x.arr),
            memLoad: metricsData.memLoad.data_w.map(x => x.arr),
            memInfo: {
                maxLoad: metricsData.memLoad.max,
                loadUnits: metricsData.memUnits,
            },
        }

        default: return undefined
    }
}

export async function updateMetrics() {
    const cpuInfo = await getCpuInfo()
    const gpuInfo = await getGpuInfo()
    const memInfo = await getMemoryInfo()

    metricsData.cpuLoad.appendValue(cpuInfo.load)
    metricsData.cpuTemp.appendValue(cpuInfo.temp)

    metricsData.gpuLoad.appendValue(gpuInfo.load)
    metricsData.gpuTemp.appendValue(gpuInfo.temp)

    const [memTotal, memUnits] = formatBytesCount(memInfo.total)
    metricsData.memLoad.appendValue(formatBytesCount(memInfo.used)[0])
    metricsData.memLoad.max = memTotal
    metricsData.memUnits = memUnits

    logIfAboveCriticalLimits({
        cpu: cpuInfo,
        gpu: gpuInfo,
        mem: memInfo
    })
}



async function getCpuInfo() {
    const temp = await getCpuTemperature()
    const load = Math.round((await si.currentLoad()).currentLoad)

    return {
        temp,
        load,
    }
}

async function getGpuInfo() {
    const GPUs = (await si.graphics()).controllers

    let temp
    let load

    for (let i = 0; i < GPUs.length; i++) {
        if (GPUs[i].temperatureGpu) {
            temp = GPUs[i].temperatureGpu
            load = GPUs[i].utilizationGpu
            break
        }
    }

    // todo
    if (!temp) console.log('can not get gpu temp')
    if (!load) console.log('can not get gpu load')

    // windows "fix"
    temp ??= await getCpuTemperature()
    load ??= Math.round(tryAgain(10, 20))

    return {
        temp,
        load,
    }
}

async function getMemoryInfo() {
    const info = await si.mem()
    const used = info.used
    const total = info.total
    const load = (used / total) * 100

    return {
        load,
        used,
        total,
    }
}

async function getCpuTemperature() {
    let temp = (await si.cpuTemperature()).main

    // windows "fix"
    temp ??= tryAgain(40, 50)

    return temp
}

function tryAgain(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

function formatBytesCount(bytes) {
    const kiloBytes = 1024
    const megaBytes = kiloBytes * 1024
    const gigaBytes = megaBytes * 1024
    const teraBytes = gigaBytes * 1024

    if (bytes > teraBytes) {
        return [(bytes / teraBytes).toFixed(2), ' TB']
    }

    if (bytes > gigaBytes) {
        return [(bytes / gigaBytes).toFixed(2), ' GB']
    }

    if (bytes > megaBytes) {
        return [(bytes / megaBytes).toFixed(2), ' MB']
    }
    
    if (bytes > kiloBytes) {
        return [(bytes / kiloBytes).toFixed(2), ' KB']
    }
    
    return [bytes, ' B']
}