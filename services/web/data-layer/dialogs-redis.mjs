import Redis from 'ioredis'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {v4 as uuid} from 'uuid'

const redis = new Redis([{
    host: process.env.REDIS_HOST,
    port: 6379
}])

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

redis.function( 'LOAD', 'REPLACE', fs.readFileSync(__dirname + '/dialogs.lua'))

const create = async (city, from_user_id, to_user_id, text) => {
    const id = uuid()
    await redis.call('FCALL', 'message_create', 0, id, JSON.stringify({from_user_id, to_user_id, text}))
    return id
}

const search = async (city, from_user_id, to_user_id) => {
    const res = await redis.call('FCALL', 'message_search', 0, from_user_id.toString(), to_user_id.toString())
    const messages = []
    if(res[0]){
        for(let i = 2; i < res.length; i+=2){
            messages.push(JSON.parse(res[i][1]))
        }
    }

    return messages
}

export default {create, search}
