import Redis from 'ioredis'

const redis = new Redis(6379, process.env.REDIS_HOST || 'localhost')

const message = {foo: Math.random()}

const updateCount = (user_id, count) => {
    redis.publish('message:count:updated', JSON.stringify({user_id, count}))
}

export default {updateCount}
