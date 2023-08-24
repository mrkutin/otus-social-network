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

const findByToken = async token => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }
    const statement = `SELECT id, first_name, second_name, age, birthdate, biography, city FROM users WHERE EXISTS (SELECT 1 FROM tokens WHERE tokens.id = '${token}' AND users.id = tokens.user_id);`
    const result = await connection.execute(statement)
    return result?.[0]?.[0] || null
}

const create = async user => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }
    const user_id = uuid()
    const statement = `INSERT INTO users (id, password, first_name, second_name) VALUES('${user_id}', SHA2('${user.password}', 256), '${user.first_name || ''}', '${user.second_name || ''}');`
    await connection.execute(statement)
    return user_id
}

const authenticate = async (user_id, password) => {
    if (!connection) {
        throw new Error('База данных недоступна')
    }
    const usersResult = await connection.execute(`SELECT id FROM users WHERE id = '${user_id}' AND password = SHA2('${password}', 256);`)

    if (usersResult?.[0]?.[0]) {
        const token = uuid()
        const statement = `INSERT INTO tokens (user_id, id) VALUES ('${user_id}', '${token}') ON DUPLICATE KEY UPDATE id = '${token}';`
        await connection.execute(statement)
        return token
    }

    return null
}

const get = async id => {
    if (!connection) {
        throw new Error('База данных недоступна')
    }
    const statement = `SELECT id, first_name, second_name, age, birthdate, biography, city FROM users WHERE id = '${id}';`
    const result = await connection.execute(statement)

    return result?.[0]?.[0] || null
}

const search = async (first_name, second_name) => {
    if (!connection) {
        throw new Error('База данных недоступна')
    }

    const like_clauses = []
    if(first_name) {
        like_clauses.push(`first_name LIKE '${first_name}%'`)
    }
    if(second_name) {
        like_clauses.push(`second_name LIKE '${second_name}%'`)
    }

    const statement = `SELECT id, first_name, second_name, age, birthdate, biography, city FROM users WHERE ${like_clauses.join(' AND ')};`
    const result = await connection.execute(statement)

    return result?.[0] || []
}
export default {create, authenticate, get, search, findByToken}
