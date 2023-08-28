import mysql from 'mysql2/promise'
import {v4 as uuid} from 'uuid'

const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    database: 'social',
    user: 'root',
    password: 'topsecret'
}

let connection

try {
    connection = await mysql.createConnection(config)
} catch (err) {
    console.error('error connecting: ' + err.stack)
}

const create = async (user_id, text) => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }
    const id = uuid()
    const statement = `INSERT INTO posts (id, user_id, text) VALUES ('${id}', '${user_id}', '${text}');`
    await connection.execute(statement)
    return id
}

const update = async (id, text) => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }
    const statement = `UPDATE posts SET text = '${text}' WHERE id = '${id}';`
    await connection.execute(statement)
}

const get = async id => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }
    const statement = `SELECT id, text FROM posts WHERE id = '${id}';`
    const res = await connection.execute(statement)
    return res?.[0]?.[0] || null
}

// const friendStatuses = async user_id => {
//     if (!connection) {
//         throw new Error('База данных не доступна')
//     }
//todo exists join for one user's friends only!!!

//     const statement = `SELECT id, user_id, text FROM posts ORDER BY created_at desc limit 1000;`
//     const res = await connection.execute(statement)
//     return res?.[0]?.[0] || null
// }

const remove = async id => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }
    const statement = `DELETE FROM posts WHERE id = '${id}';`
    await connection.execute(statement)
}

export default {create, update, get, remove}
