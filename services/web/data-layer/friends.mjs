const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT || 27017
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || 'topsecret'

import {MongoClient, ObjectId} from 'mongodb'

const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`
const client = new MongoClient(connectionString)

try {
    await client.connect()
    console.log('Friends connected to MongoDB cluster')
} catch (err) {
    console.error('error connecting: ' + err.stack)
}

const socialDb = client.db('social')
const dbFriends = socialDb.collection('friends')

const followerIds = async user_id => {
    const res = await dbFriends.aggregate([
        {$match: {friend_id: new ObjectId(user_id)}},
        {$project: {user_id: 1}}
    ]).toArray()
    return res.map(follower => follower.user_id.toString())
}

const set = (user_id, friend_id) => {
    dbFriends.findOneAndUpdate(
        {
            user_id: new Object(user_id),
            friend_id: new Object(friend_id),
        },
        {
            $set: {updated_at: new Date()},
            $setOnInsert: {created_at: new Date()}
        })
}

const unset = (user_id, friend_id) => {
    dbFriends.deleteOne({
        user_id: new Object(user_id),
        friend_id: new Object(friend_id),
    })
}

export default {set, unset, followerIds}
