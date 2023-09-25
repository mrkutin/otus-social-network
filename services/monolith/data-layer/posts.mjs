const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT || 27017
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || 'topsecret'

import {MongoClient, ObjectId} from 'mongodb'

const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`
const client = new MongoClient(connectionString)

const connect = async () => {
    try {
        await client.connect()
        console.log('Posts connected to MongoDB cluster')
    } catch (err) {
        console.error('Posts connection error, reconnecting in 1000 ms')
        await new Promise(resolve => {
            setTimeout(() => {
                return resolve()
            }, 1000)
        })
        return connect()
    }
}
await connect()

const socialDb = client.db('social')
const dbPosts = socialDb.collection('posts')



const create = async (user_id, text) => {
    const res = await dbPosts.insertOne({
        user_id: new Object(user_id),
        text,
        created_at: new Date()
    })

    return res.insertedId.toString()
}

const update = (id, text) => {
    dbPosts.findOneAndUpdate(
        {
            _id: new ObjectId(id)
        },
        {
            $set: {text, updated_at: new Date()}
        })
}

const get = async id => {
    const res = await dbPosts.aggregate([
        {
            $match: {_id: new ObjectId(id)}
        },
        {
            $project: {text: 1}
        }
    ]).toArray()
    return res?.[0] || null
}

const remove = id => {
    dbPosts.deleteOne({_id: new ObjectId(id)})
}

const getMany = async ids => {
    const res = await dbPosts.aggregate([
        {
            $match: {_id: {$in: ids.map(id => new ObjectId(id))}}
        },
        {
            $project: {user_id: 1, text: 1}
        }
    ]).toArray()
    return res?.[0] || null
}


export default {create, update, get, remove, getMany}
