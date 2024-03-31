import './apexcharts.js'
import './socket.io.js'

const MODE = {
    LAST_MINUTE: 0,
    LAST_HOUR: 1,
    LAST_DAY: 2,
    LAST_WEEK: 3,
}



const socket = io()

const cpuChart = new ApexCharts(document.getElementById('cpuChart'), createOptions('cpu'))
cpuChart.render()






socket.on('connect', () => {
    console.log('Connected to server.')
})

socket.on('deviceNames', deviceNames => {
    console.log(deviceNames)
})

socket.on('metrics', data => {
    
    console.log(data)

    var options = {
        series: [
            {
                name: 'cpu temp',
                data: data.cpuLoad
            },
        ],
        // tooltip: {
        //     x: {
        //         format: "MM:ss"
        //     }
        // },
        yaxis: {
            min: 0,
            max: 100,
        },
    }

    cpuChart.updateOptions(options)



    console.log(data)
})













function setCriticalLimits() {
    // todo
    const limits = {
        cpuLoad: 0,
        cpuTemp: 0,
        gpuLoad: 0,
        gpuTemp: 0,
        memLoad: 0,
    }

    socket.emit('setCriticalLimits', limits)
}

function setLogEmail() {
    // todo
    const email = ''

    socket.emit('setLogEmail', email)
}

function setMetricsMode() {
    // todo
    const metricsMode = MODE.LAST_MINUTE

    socket.emit('setMetricsMode', metricsMode)
}



function createOptions(name) {
    return {
        series: [{
            name: name,
            data: []
        }],
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
        // tooltip: {
        //     x: {
        //         format: 'HH:mm:ss'
        //     }
        // },
        yaxis: {
            min: 0,
            max: 100
        },
    }
}