import mysql from 'mysql2/promise'
import {v4 as uuid} from 'uuid'

const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    // port: 3306,
    database: 'social',
    user: 'root',
    password: 'topsecret'
}

let pool

try {
    pool = await mysql.createPool(config)
} catch (err) {
    console.error('error connecting: ' + err.stack)
}

const create = async user => {
    const user_id = uuid()
    const statement = `INSERT INTO users (id, password, first_name, second_name) VALUES('${user_id}', SHA2('${user.password}', 256)   , '${user.first_name || ''}', '${user.second_name || ''}');`

    const connection = await pool.getConnection()
    await connection.execute(statement)
    await pool.releaseConnection(connection)

    return user_id
}

const authenticate = async (id, password) => {
    if (!connection) {
        throw new Error('База данных недоступна')
    }
    const statement = `SELECT id FROM users WHERE id = '${id}' AND password = SHA2('${password}', 256);`

    const connection = await pool.getConnection()
    const result = await connection.execute(statement)
    await pool.releaseConnection(connection)

    if (result?.[0]?.[0]) {
        return uuid()
    }

    return null
}

const get = async id => {
    const statement = `SELECT id, first_name, second_name, age, birthdate, biography, city FROM users WHERE id = '${id}';`

    const connection = await pool.getConnection()
    const result = await connection.execute(statement)
    await pool.releaseConnection(connection)

    return result?.[0]?.[0] || null
}

const search = async (first_name, second_name) => {
    console.log('search request has been made ' + new Date())
    const like_clauses = []
    if(first_name) {
        like_clauses.push(`first_name LIKE '${first_name}%'`)
    }
    if(second_name) {
        like_clauses.push(`second_name LIKE '${second_name}%'`)
    }

    const statement = `SELECT id, first_name, second_name, age, birthdate, biography, city FROM users WHERE ${like_clauses.join(' AND ')};`

    const connection = await pool.getConnection()
    const result = await connection.execute(statement)
    await pool.releaseConnection(connection)

    return result?.[0] || []
}
export default {create, authenticate, get, search}