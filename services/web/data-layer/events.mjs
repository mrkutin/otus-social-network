import Redis from 'ioredis'
import {ObjectId} from "mongodb";

const redis = new Redis(6379, process.env.REDIS_HOST || 'localhost')
const subscriber = redis.duplicate()
await subscriber.subscribe('message:count:increased', 'message:count:decreased')

import dialogs from './dialogs.mjs'

subscriber.on('message', async (channel, message) => {
    console.log(`Received ${message} from ${channel}`)
    const messageObj = JSON.parse(message)
    switch (channel) {
        case 'message:count:increased':
            await dialogs.markAsUnread(messageObj.message_id)
            break
        case 'message:count:decreased':
            await dialogs.markAsRead(messageObj.message_id)
            break
    }
})

const markAsRead = async (user_id, message_id) => {
    await redis.publish('decrease:message:count', JSON.stringify({user_id, message_id}))
}

const markAsUnread = async (user_id, message_id) => {
    await redis.publish('increase:message:count', JSON.stringify({user_id, message_id}))
}

const updateCount = (user_id, count) => {
    redis.publish('update:message:count', JSON.stringify({user_id, count}))
}

export default {updateCount, markAsRead, markAsUnread}
