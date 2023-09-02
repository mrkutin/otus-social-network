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
const res = await connection.execute('select id, second_name, first_name from user order by id limit 101;')
await connection.end()

const firstUser = res[0].splice(0, 1)[0]
const friends = res[0]

const makeFriendsStatements = friends.map(friend => `INSERT INTO friends (user_id, friend_id) VALUES('${friend.id}', '${firstUser.id}');`)
fs.writeFileSync('./friends.sql', makeFriendsStatements.join('\n'), {encoding: 'utf8'})

const addPostsStatements = postLines.reduce((acc, post, idx) => {
    const friend = friends[idx % friends.length]
    acc.push(`INSERT INTO posts (id, user_id, text, created_at) VALUES('${uuid()}', '${friend.id}', '${post}', '${new Date(new Date() - Math.random()*(1e+12)).toISOString().substring(0, 19).replace(/T/, ' ')}');`)
    return acc
}, [])
fs.writeFileSync('./posts.sql', addPostsStatements.join('\n'), {encoding: 'utf8'})



