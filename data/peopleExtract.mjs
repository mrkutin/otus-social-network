import fs from 'fs'
import mysql from 'mysql2/promise'

const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: 3306,//master
    database: 'social',
    user: 'root',
    password: 'topsecret'
}

const connection = await mysql.createConnection(config)
const res = await connection.execute('select * from users order by id limit 101;')
await connection.end()

const statements = res[0].map(user => {
    return `INSERT INTO users (id, password, first_name, second_name, age, city) VALUES('${user.id}', SHA2('12345', 256), '${user.first_name}', '${user.second_name}', ${user.age}, '${user.city}');`
})


fs.writeFileSync('./101-people-sample.sql', statements.join('\n'), {encoding: 'utf8'})
