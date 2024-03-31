export function sleep(durationMs) {
    return new Promise(r => setTimeout(r, durationMs))
}

export function getDate() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
}