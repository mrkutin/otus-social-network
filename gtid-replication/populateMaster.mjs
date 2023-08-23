import mysql from 'mysql2/promise'
import fr from 'fs'
import fs from "fs";

const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: 3306,//master
    database: 'social',
    user: 'root',
    password: 'topsecret'
}

try {
    const connection = await mysql.createConnection(config)
    console.log('connection successful')

    let data = fs.readFileSync('../data/people-one.sql', {encoding: 'utf8'})
    let statements = data.split('\n')
    for(let i = 1; i < statements.length - 1; i++) {
        await connection.execute(statements[i])
        console.log(i)
    }

    // data = fs.readFileSync('../data/people-two.sql', {encoding: 'utf8'})
    // statements = data.split('\n')
    // for(let i = 1; i < statements.length - 1; i++) {
    //     await connection.execute(statements[i])
    //     console.log(500000 + i)
    // }

    connection.end()
} catch (err) {
    console.error('error connecting: ' + err.stack)
}


