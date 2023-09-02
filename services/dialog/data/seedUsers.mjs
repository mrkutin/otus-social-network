const DB_HOST = 'localhost'
const DB_PORT = 27017
const DB_USER = 'root'
const DB_PASS = 'topsecret'
const DB_NAME = 'social'

import {MongoClient} from 'mongodb'
import crypto from 'crypto'
import fs from 'fs'


const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`
const client = new MongoClient(connectionString)

await client.connect()
console.log("MONGO CONNECTED!")

const db = client.db(DB_NAME)
const users = db.collection('users')

console.time('time elapsed')


const data = fs.readFileSync('./data/people.txt', {encoding: 'utf8'})
const lines = data.split('\n')

const chunk_size = 10000

await users.drop()
for (let i = 0; i < lines.length; i += chunk_size) {
    const chunk = lines.slice(i, i + chunk_size)
    const userObjects = chunk.map(line => {
        const [name, age, city] = line.split(',')
        const [second_name, first_name] = name.split(' ')
        return {
            password: crypto.createHash('sha256').update('12345', 'utf8').digest(),
            second_name,
            first_name,
            age,
            city
        }
    })

    await users.insertMany(userObjects)

    console.log(i)
}

console.timeEnd('time elapsed')

await client.close()
