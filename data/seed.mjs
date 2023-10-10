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
console.log('Connected to MongoDB cluster')

//set chunksize = 4MB
const configDb = client.db('config')
const settings = configDb.collection('settings')
await settings.updateOne({_id: "chunksize"}, {$set: {_id: "chunksize", value: 1}}, {upsert: true})

const socialDb = client.db('social')
const dbUsers = socialDb.collection('users')
const dbMessages = socialDb.collection('messages')
const dbFriends = socialDb.collection('friends')
const dbPosts = socialDb.collection('posts')

// seed users
console.time('users loaded successfully')

const chunk_size = 10000

const peopleData = fs.readFileSync('../data/people.txt', {encoding: 'utf8'})
const peopleLines = peopleData.split('\n')

await dbUsers.drop()
// for (let i = 0; i < peopleLines.length; i += chunk_size) {
for (let i = 0; i < chunk_size; i += chunk_size) {
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

console.timeEnd('users loaded successfully')

const messageData = fs.readFileSync('../data/posts.txt', {encoding: 'utf8'})
const messageLines = messageData.split('\n')

const [firstUser, ...users100] = await dbUsers.find({}).limit(101).toArray()

//seed messages
console.time('messages loaded successfully')

const messages = messageLines.reduce((acc, post, idx) => {
    const user = users100[idx % users100.length]
    acc.push({
        city: user.city,
        from_user_id: user._id,
        to_user_id: firstUser._id,
        text: `Сообщение от ${user.first_name} ${user.second_name}, ${user.city} для ${firstUser.first_name} ${firstUser.second_name}, ${firstUser.city}: ${post}`,
        created_at: new Date(),
        updated_at: new Date()
    })
    acc.push({
        city: firstUser.city,
        from_user_id: firstUser._id,
        to_user_id: user._id,
        text: `Сообщение от ${firstUser.first_name} ${firstUser.second_name}, ${firstUser.city} для ${user.first_name} ${user.second_name}, ${user.city}: ${post}`,
        created_at: new Date(),
        updated_at: new Date()
    })
    return acc
}, [])

await dbMessages.drop()
await dbMessages.insertMany(messages)
await dbMessages.createIndex({city: 1, from_user_id: 1, to_user_id: 1})

console.timeEnd('messages loaded successfully')


//friends seed
console.time('friends loaded successfully')

const friends = users100.reduce((acc, user) => {
    acc.push({
        city: firstUser.city,
        user_id: firstUser._id,
        friend_id: user._id,
        created_at: new Date(),
        updated_at: new Date()
    })
    acc.push({
        city: user.city,
        user_id: user._id,
        friend_id: firstUser._id,
        created_at: new Date(),
        updated_at: new Date()
    })
    return acc
}, [])

await dbFriends.drop()
await dbFriends.insertMany(friends)
await dbFriends.createIndex({city: 1})
await dbFriends.createIndex({user_id: 1})
await dbFriends.createIndex({friend_id: 1})

console.timeEnd('friends loaded successfully')


//posts seed
console.time('posts loaded successfully')

const posts = messageLines.reduce((acc, post, idx) => {
// const posts = messageLines.slice(0, 10).reduce((acc, post, idx) => {
    const user = users100[idx % users100.length]
    acc.push({
        city: firstUser.city,
        user_id: firstUser._id,
        text: post,
        created_at: new Date(),
        updated_at: new Date()
    })
    acc.push({
        city: user.city,
        user_id: user._id,
        text: post,
        created_at: new Date(),
        updated_at: new Date()
    })
    return acc
}, [])

await dbPosts.drop()
await dbPosts.insertMany(posts)
await dbPosts.createIndex({city: 1})
await dbPosts.createIndex({user_id: 1})

console.timeEnd('posts loaded successfully')


await client.close()
console.log('Connection to MongoDB cluster closed')

console.log('========== EVERYTHING IS DONE!!! ==========')


// const adminDb = client.db('admin')
// const res = await adminDb.command(
//     {
//         shardCollection: "social.messages",
//         key: {fromUserCity: 1}
//     }
// )
