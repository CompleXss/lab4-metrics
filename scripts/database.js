import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export function openConnection() {
    return open({
        filename: './storage.db',
        driver: sqlite3.Database
    })
}