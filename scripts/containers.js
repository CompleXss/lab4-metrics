export const MODE = {
    LAST_MINUTE: 0,
    LAST_HOUR: 1,
    LAST_DAY: 2,
    LAST_WEEK: 3,
}



class Metric {
    constructor(date, value) {
        this.arr = [date, value]
        this.count = 0
    }

    date() {
        return this.arr[0]
    }

    value() {
        return this.arr[1]
    }

    setDate(date) {
        this.arr[0] = date
    }

    setValue(value) {
        this.arr[1] = value
    }
}

function getDefaults(num, step) {
    const arr = []
    let date = new Date().getTime() - step * num

    for (let i = 0; i < num; i++) {
        arr.push(new Metric(date, 0))
        date += step
    }
    
    return arr
}

class MetricsData {
    constructor(min, max) {
        this.data_m = getDefaults(60, 1000)
        this.data_h = getDefaults(60, 1000 * 60)
        this.data_d = getDefaults(24, 1000 * 60 * 60)
        this.data_w = getDefaults(7, 1000 * 60 * 60 * 24)
        this.min = min
        this.max = max
    }

    appendValue(value) {
        value = Number(value)

        const date = new Date().getTime()
        const secondMultiplier = 1000
        const minuteMultiplier = secondMultiplier * 60
        const hourMultiplier = minuteMultiplier * 60
        const dayMultiplier = hourMultiplier * 24

        const second = Math.ceil(date / secondMultiplier) * secondMultiplier
        const minute = Math.ceil(date / minuteMultiplier) * minuteMultiplier
        const hour = Math.ceil(date / hourMultiplier) * hourMultiplier
        const day = Math.ceil(date / dayMultiplier) * dayMultiplier

        this._appendTo(value, this.data_m, second, 60)
        this._appendTo(value, this.data_h, minute, 60)
        this._appendTo(value, this.data_d, hour, 24)
        this._appendTo(value, this.data_w, day, 7)
    }

    _appendTo(value, destination, date, max) {
        const lastEntry = destination.length > 0 && destination[destination.length - 1]

        if (lastEntry && lastEntry.date() === date) {
            lastEntry.setValue(Math.ceil(((lastEntry.value() * lastEntry.count++ + value) / lastEntry.count) * 100) / 100)
        }
        else {
            destination.push(new Metric(date, value))
        }

        if (destination.length > max) {
            destination.shift()
        }
    }
}

export const metricsData = {
    cpuLoad: new MetricsData(0, 100),
    cpuTemp: new MetricsData(0, 100),
    gpuLoad: new MetricsData(0, 100),
    gpuTemp: new MetricsData(0, 100),
    memLoad: new MetricsData(0, 100),
    memUnits: ' B',
}

export const criticalLimits = {
    cpuLoad: 101,
    cpuTemp: 101,
    gpuLoad: 101,
    gpuTemp: 101,
    memLoad: 101,
}

export const data = {
    logEmail: undefined,
    metricsMode: MODE.LAST_MINUTE,
}
