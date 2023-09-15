const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT || 27017
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || 'topsecret'

import {MongoClient, ObjectId} from 'mongodb'

const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`
const client = new MongoClient(connectionString)

try {
    await client.connect()
    console.log('Dialogs connected to MongoDB cluster')
} catch (err) {
    console.error('error connecting: ' + err.stack)
}

const socialDb = client.db('social')
const dbMessages = socialDb.collection('messages')

const create = async (city, from_user_id, to_user_id, text) => {
    const res = await dbMessages.insertOne({
        city: city,
        from_user_id: new ObjectId(from_user_id),
        to_user_id: new ObjectId(to_user_id),
        text,
        created_at: new Date()
    })

    return res.insertedId.toString()
}

const search = async (city, from_user_id, to_user_id) => {
    const res = await dbMessages.aggregate([
        {
            $match: {
                city: city,
                from_user_id: new ObjectId(from_user_id),
                to_user_id: new ObjectId(to_user_id)
            }
        }
    ]).toArray()
    return res || null
}

export default {create, search}
