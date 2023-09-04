const DB_HOST = 'localhost'
const DB_PORT = 27017
const DB_USER = 'root'
const DB_PASS = 'topsecret'

import {MongoClient} from 'mongodb'
import fs from 'fs'
import crypto from 'crypto'

const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`
const client = new MongoClient(connectionString)

await client.connect()
console.log("MONGO CONNECTED!")

//set chunksize = 4MB
const configDb = client.db('config')
const settings = configDb.collection('settings')
await settings.updateOne({_id: "chunksize"}, {$set: {_id: "chunksize", value: 4}}, {upsert: true})

const socialDb = client.db('social')
const dbUsers = socialDb.collection('users')
const dbMessages = socialDb.collection('messages')
const dbFriends = socialDb.collection('friends')
const dbPosts = socialDb.collection('posts')

//seed users
console.time('users seed')

const chunk_size = 10000

const peopleData = fs.readFileSync('../data/people.txt', {encoding: 'utf8'})
const peopleLines = peopleData.split('\n')

await dbUsers.drop()
for (let i = 0; i < peopleLines.length; i += chunk_size) {
    const chunk = peopleLines.slice(i, i + chunk_size)
    const userObjects = chunk.map(line => {
        const [name, age, city] = line.split(',')
        const [second_name, first_name] = name.split(' ')
        return {
            password: crypto.createHash('sha256').update('12345', 'utf8').digest(),
            second_name,
            first_name,
            age,
            city
        }
    })

    await dbUsers.insertMany(userObjects)
    console.log(i)
}

await dbUsers.createIndex({city: 1})

console.timeEnd('users seed')

const messageData = fs.readFileSync('../data/posts.txt', {encoding: 'utf8'})
const messageLines = messageData.split('\n')

const [firstUser, ...users100] = await dbUsers.find({}).limit(101).toArray()

//seed messages
console.time('messages seed')

const messages = messageLines.reduce((acc, post, idx) => {
    const user = users100[idx % users100.length]
    acc.push({
        city: user.city,
        fromUserId: user._id,
        toUserId: firstUser._id,
        text: post,
        created_at: new Date(),
        updated_at: new Date()
    })
    acc.push({
        city: firstUser.city,
        fromUserId: firstUser._id,
        toUserId: user._id,
        text: post,
        created_at: new Date(),
        updated_at: new Date()
    })
    return acc
}, [])

await dbMessages.drop()
await dbMessages.insertMany(messages)
await dbMessages.createIndex({city: 1})

console.timeEnd('messages seed')


//friends seed
console.time('friends seed')

const friends = users100.reduce((acc, user) => {
    acc.push({
        city: user.city,
        userId: user._id,
        friendId: firstUser._id,
        created_at: new Date(),
        updated_at: new Date()
    })
    acc.push({
        city: firstUser.city,
        userId: firstUser._id,
        friendId: user._id,
        created_at: new Date(),
        updated_at: new Date()
    })
    return acc
}, [])

await dbFriends.drop()
await dbFriends.insertMany(friends)
await dbFriends.createIndex({city: 1})

console.timeEnd('friends seed')


//posts seed
console.time('posts seed')

const posts = messageLines.reduce((acc, post, idx) => {
    const user = users100[idx % users100.length]
    acc.push({
        city: user.city,
        userId: user._id,
        text: post,
        created_at: new Date(),
        updated_at: new Date()
    })
    acc.push({
        city: firstUser.city,
        userId: firstUser._id,
        text: post,
        created_at: new Date(),
        updated_at: new Date()
    })
    return acc
}, [])

await dbPosts.drop()
await dbPosts.insertMany(posts)
await dbPosts.createIndex({city: 1})

console.timeEnd('posts seed')


await client.close()


// const adminDb = client.db('admin')
// const res = await adminDb.command(
//     {
//         shardCollection: "social.messages",
//         key: {fromUserCity: 1}
//     }
// )
