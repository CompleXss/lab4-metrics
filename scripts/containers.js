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

class MetricsData {
    constructor(min, max) {
        this.data_m = []
        this.data_h = []
        this.data_d = []
        this.data_w = []
        this.min = min
        this.max = max
    }

    appendValue(value) {
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
            lastEntry.setValue((lastEntry.value() * lastEntry.count++ + value) / lastEntry.count)
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
    memLoad: new MetricsData(0, 100), // subject to change
    memUnits: ' B',
}

export const criticalLimits = {
    cpuLoad: 80,
    cpuTemp: 80,
    gpuLoad: 80,
    gpuTemp: 80,
    memLoad: 80,
}

export var logEmail = undefined;
export var metricsMode = MODE.LAST_MINUTE;
