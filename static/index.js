import './apexcharts.js'
import './socket.io.js'

document.getElementById('metricsMode').onchange = e => setMetricsMode(e)
document.getElementById('updateSettingsBtn').onclick = e => {
    setCriticalLimits()
    setLogEmail()
}


const socket = io()

const cpuChart = new ApexCharts(document.getElementById('cpuChart'), createOptions(['cpu load', 'cpu temp']))
const gpuChart = new ApexCharts(document.getElementById('gpuChart'), createOptions(['gpu load', 'gpu temp']))
const memLoadChart = new ApexCharts(document.getElementById('memChart'), createOptions(['memory load']))

cpuChart.render()
gpuChart.render()
memLoadChart.render()



socket.on('connect', () => {
    console.log('Connected to server.')
})

socket.on('deviceNames', deviceNames => {
    document.getElementById('cpuName').textContent = 'Процессор (' + deviceNames.cpu + ')'
    document.getElementById('gpuName').textContent = 'Видеокарта (' + deviceNames.gpu + ')'
})

socket.on('metricsMode', mode => {
    const element = document.getElementById('metricsMode')
    element.value = mode
    element.disabled = false
})

socket.on('criticalLimits', limits => {
    document.getElementById('cpuLoadLimit').value = limits.cpuLoad
    document.getElementById('cpuTempLimit').value = limits.cpuTemp
    document.getElementById('gpuLoadLimit').value = limits.gpuLoad
    document.getElementById('gpuTempLimit').value = limits.gpuTemp
    document.getElementById('memLoadLimit').value = limits.memLoad
})

socket.on('logEmail', email => {
    document.getElementById('logEmail').value = email
})

socket.on('metrics', data => {
    document.getElementById('memName').textContent = 'Оперативная память, ' + data.memInfo.loadUnits

    const mode = document.getElementById('metricsMode')?.value ?? 0
    updateChart(mode, cpuChart, [data.cpuLoad, data.cpuTemp])
    updateChart(mode, gpuChart, [data.gpuLoad, data.gpuTemp])
    updateChart(mode, memLoadChart, [data.memLoad], data.memInfo)
})



function updateChart(mode, chart, data, info) {
    let format
    if (mode > 2) {
        format = 'dd MMM'
    }
    else {
        format = 'dd MMM HH:mm:ss'
    }

    const options = {
        series: data.map(d => {
            return {
                data: d
            }
        }),
        tooltip: {
            x: {
                format: format
            }
        },
        yaxis: {
            min: 0,
            max: 100,
        },
    }

    if (info) {
        options.yaxis = {
            min: 0,
            max: Math.round(info.maxLoad * 10) / 10
        }
    }

    chart.updateOptions(options)
}



function setCriticalLimits() {    
    const limits = {
        cpuLoad: document.getElementById('cpuLoadLimit').value,
        cpuTemp: document.getElementById('cpuTempLimit').value,
        gpuLoad: document.getElementById('gpuLoadLimit').value,
        gpuTemp: document.getElementById('gpuTempLimit').value,
        memLoad: document.getElementById('memLoadLimit').value,
    }

    socket.emit('setCriticalLimits', limits)
}

function setLogEmail() {
    const email = document.getElementById('logEmail').value
    socket.emit('setLogEmail', email)
}

function setMetricsMode(element) {
    socket.emit('setMetricsMode', element.target.value)
}



function createOptions(names) {
    return {
        series: names.map(name => {
            return {
                name: name,
                data: []
            }
        }),
        chart: {
            type: 'area',
            animations: {
                enabled: false
            },
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            type: 'datetime',
            tickAmount: 6,
            labels: {
                datetimeUTC: false
            }
        },
        tooltip: {
            x: {
                format: 'dd MMM HH:mm:ss'
            }
        },
        yaxis: {
            min: 0,
            max: 100
        },
    }
}