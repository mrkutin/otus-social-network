import Redis from 'ioredis'
import fs from 'fs'
import {v4 as uuid} from 'uuid'
const DB_HOST = 'localhost'
const DB_PORT = 27017
const DB_USER = 'root'
const DB_PASS = 'topsecret'
import {MongoClient} from 'mongodb'

const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`
const client = new MongoClient(connectionString)

const socialDb = client.db('social')
const dbUsers = socialDb.collection('users')

const redis = new Redis([{
    host: process.env.REDIS_HOST,
    port: 6379
}])

const messageData = fs.readFileSync('../data/posts.txt', {encoding: 'utf8'})
const messageLines = messageData.split('\n')

const [firstUser, ...users100] = await dbUsers.find({}).limit(101).toArray()

//seed messages
console.time('messages loaded successfully')

const messages = messageLines.reduce((acc, post, idx) => {
    const user = users100[idx % users100.length]
    acc.push(
        redis.call('JSON.SET', `message:${uuid()}`, '$', JSON.stringify({
            from_user_id: user._id,
            to_user_id: firstUser._id,
            text: `Сообщение от ${user.first_name} ${user.second_name}, ${user.city} для ${firstUser.first_name} ${firstUser.second_name}, ${firstUser.city}: ${post}`
        }))
    )
    acc.push(
        redis.call('JSON.SET', `message:${uuid()}`, '$', JSON.stringify({
            from_user_id: firstUser._id,
            to_user_id: user._id,
            text: `Сообщение от ${firstUser.first_name} ${firstUser.second_name}, ${firstUser.city} для ${user.first_name} ${user.second_name}, ${user.city}: ${post}`
        }))
    )
    return acc
}, [])

//await redis.call('FT.CREATE', 'messageIdx', 'ON', 'JSON', 'PREFIX', '1', 'message:', 'SCHEMA', '$.from_user_id', 'AS', 'from_user_id', 'TEXT', '$.to_user_id', 'as', 'to_user_id', 'TEXT')


 await Promise.all(messages)
console.timeEnd('messages loaded successfully')