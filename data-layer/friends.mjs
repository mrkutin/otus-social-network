import mysql from 'mysql2/promise'

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

const set = async (user_id, friend_id) => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }
    const statement = `INSERT INTO friends (user_id, friend_id) VALUES ('${user_id}', '${friend_id}') ON DUPLICATE KEY UPDATE user_id = '${user_id}', friend_id = '${friend_id}', updated_at = CURRENT_TIMESTAMP;`
    await connection.execute(statement)
}

const unset = async (user_id, friend_id) => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }
    const statement = `DELETE FROM friends WHERE user_id = '${user_id}' AND friend_id = '${friend_id}';`
    await connection.execute(statement)
}

export default {set, unset}
