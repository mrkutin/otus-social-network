const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT || 27017
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || 'topsecret'

import {MongoClient, ObjectId} from 'mongodb'
import crypto from 'crypto'
import {v4 as uuid} from 'uuid'

const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`
const client = new MongoClient(connectionString)

const connect = async () => {
    try {
        await client.connect()
        console.log('Users connected to MongoDB cluster')
    } catch (err) {
        console.error('Users connection error, reconnecting in 1000 ms')
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
const dbUsers = socialDb.collection('users')

const authenticate = async (user_id, password) => {
    const token = uuid()
    const res = await dbUsers.findOneAndUpdate(
        {
            _id: new ObjectId(user_id),
            password: crypto.createHash('sha256').update(password, 'utf8').digest()
        },
        {
            $set: {token, updated_at: new Date()}
        })
    if (res) {
        return token
    }

    return null
}

const findByToken = token => dbUsers.findOne({token})

const create = async user => {
    const res = await dbUsers.insertOne({
        password: crypto.createHash('sha256').update(user.password, 'utf8').digest(),
        first_name: user.first_name,
        second_name: user.second_name,
        age: user.age,
        city: user.city,
        birthdate: user.birthdate,
        biography: user.biography,
        created_at: new Date()
    })

    return res.insertedId.toString()
}

const update = async user => {
    const {_id, ...rest} = user
    await dbUsers.updateOne(
        {_id: new ObjectId(_id)},
        {$set: rest}
    )
}

const get = async id => {
    const res = await dbUsers.aggregate([
        {
            $match: {_id: new ObjectId(id)}
        },
        {
            $project: {
                first_name: 1, second_name: 1, age: 1, city: 1, birthdate: 1, biography: 1
            }
        }
    ]).toArray()
    return res?.[0] || null
}

const search = async (first_name, second_name) => {
    const $match = {}
    if (first_name) {
        $match.first_name = {$regex: `${first_name}*`, $options: 'i'}
    }
    if (second_name) {
        $match.second_name = {$regex: `${second_name}*`, $options: 'i'}
    }

    const res = await dbUsers.aggregate([
        {
            $match
        },
        {
            $project: {
                first_name: 1, second_name: 1, age: 1, city: 1, birthdate: 1, biography: 1
            }
        }
    ]).toArray()
    return res || null
}

export default {authenticate, findByToken, create, get, search}
