import mysql from 'mysql2/promise'
import { v4 as uuid } from 'uuid'

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

const create = async user => {
    if(!connection){
        throw new Error('База данных не доступна')
    }
    const user_id = uuid()
    const statement = `INSERT INTO users (id, password, first_name, second_name) VALUES('${user_id}', SHA2('${user.password}', 256)   , '${user.first_name || ''}', '${user.second_name || ''}');`
    await connection.execute(statement)
    return user_id
}

const authenticate = async (id, password) => {
    if(!connection){
        throw new Error('База данных не доступна')
    }
    const statement = `SELECT id FROM users WHERE id = '${id}' AND password = SHA2('${password}', 256);`
    const result = await connection.execute(statement)

    if(result?.[0]?.[0]){
        return uuid()
    }

    return null
}

const get = async id => {
    if(!connection){
        throw new Error('База данных не доступна')
    }
    const statement = `SELECT id, first_name, second_name, age, birthdate, biography, city FROM users WHERE id = '${id}';`
    const result = await connection.execute(statement)

    return result?.[0]?.[0] || null
}

export {create, authenticate, get}
