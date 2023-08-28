import fs from 'fs'
import { v4 as uuid } from 'uuid'
import mysql from 'mysql2/promise'

const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: 3306,//master
    database: 'social',
    user: 'root',
    password: 'topsecret'
}

const data = fs.readFileSync('./posts.txt', {encoding: 'utf8'})
const postLines = data.split('\n')

const connection = await mysql.createConnection(config)
const res = await connection.execute('select id, second_name, first_name from users order by id limit 101;')
await connection.end()


const firstUser = res[0].splice(0, 1)[0]

const makeFriendsStatements = res[0].map(friend => `INSERT INTO friends (user_id, friend_id) VALUES('${firstUser.id}', '${friend.id}');`)
fs.writeFileSync('./friends.sql', makeFriendsStatements.join('\n'), {encoding: 'utf8'})

const addPostsStatements = res[0].reduce((acc, friend, num) => {
    for(let i = num * 80; i < num * 80 + 80; i++){
        acc.push(`INSERT INTO posts (id, user_id, text) VALUES('${uuid()}', '${friend.id}', '${postLines[i]}');`)
    }
    return acc
}, [])

fs.writeFileSync('./posts.sql', addPostsStatements.join('\n'), {encoding: 'utf8'})



