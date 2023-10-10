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

import events from '../data-layer/events.mjs'

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

const search = async (from_user_id, to_user_id) => {
    const res = await dbMessages.aggregate([
        {
            $match: {
                from_user_id: new ObjectId(from_user_id),
                to_user_id: new ObjectId(to_user_id)
            }
        }
    ]).toArray()
    return res || null
}

const countUnread = async () => {
    const res = await dbMessages.aggregate([
            {
                $match: {
                    read: {$ne: true}
                }
            },
            {
                $group: {
                    _id: {user_id: '$to_user_id'},
                    count: {$count: {}}
                }
            },
            {
                $project: {
                    _id: 0,
                    user_id: '$_id.user_id',
                    count: '$count'
                }
            }
        ]).toArray()
    return res || null
}

const markAsRead = message_id => {
    return dbMessages.updateOne(
        {_id: new ObjectId(message_id)},
        {
            $set: {
                read: true,
                updated_at: new Date()
            }
        })
}

const markAsUnread = message_id => {
    return dbMessages.updateOne(
        {_id: new ObjectId(message_id)},
        {
            $set: {
                read: false,
                updated_at: new Date()
            }
        })
}

const warmUpCache = async () => {
    const messageCounts = await countUnread()
    for (const record of messageCounts){
        await events.updateCount(record.user_id, record.count)
    }
}

await warmUpCache()

export default {create, search, markAsRead, markAsUnread, countUnread}
