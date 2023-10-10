import Redis from 'ioredis'
const redis = new Redis(6379, process.env.REDIS_HOST || 'localhost')
const subscriber = redis.duplicate()
await subscriber.subscribe('update:message:count', 'increase:message:count', 'decrease:message:count')

subscriber.on('message', async (channel, message) => {
    console.log(`Received ${message} from ${channel}`)
    const messageObj = JSON.parse(message)
    switch (channel) {
        case 'update:message:count':
            await redis.set(messageObj.user_id, messageObj.count)
            break
        case 'increase:message:count':
            try {
                await redis.incr(messageObj.user_id)
            } catch (e) {
                await redis.publish('message:count:not:increased', JSON.stringify(messageObj))
            }
            await redis.publish('message:count:increased', JSON.stringify(messageObj))
            break
        case 'decrease:message:count':
            try {
                await redis.decr(messageObj.user_id)
            } catch (e) {
                await redis.publish('message:count:not:decreased', JSON.stringify(messageObj))
            }
            await redis.publish('message:count:decreased', JSON.stringify(messageObj))
            break
    }
})

const get = async (user_id) => {
    return redis.get(user_id)
}

export default {get}
