import { randomUUID } from 'crypto'
const tokens = []

export function generateToken() {
    const token = randomUUID()
    tokens.push(token)

    return token
}

export function isTokenValid(token) {
    return tokens.includes(token)
}
