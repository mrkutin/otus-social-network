import Redis from 'ioredis'

const redis = new Redis(6379, process.env.REDIS_HOST || 'localhost')

try {
    await redis.xgroup('CREATE', 'stream:post:created', process.env.SERVER_NAME, '$', 'MKSTREAM')
} catch (e) {
    console.log(`Group "${process.env.SERVER_NAME}" already exists in stream:post:created, skipping`)
}

const userToSocket = user_id => {
    return redis.get(`user-socket:${user_id}`)
}

const mapUserSocket = async (server_name, user_id, socket) => {
    await redis.set(`user-socket:${user_id}`, socket)
    return redis.sadd(`${server_name}-users`, user_id)
}

const unmapUserSocket = async (server_name, user_id) => {
    await redis.del(`user-socket:${user_id}`)
    return redis.srem(`${server_name}-users`, user_id)
}

const filterServerUsers = async (user_ids, server_name) => {
    const res = []
    for(const user_id of user_ids){
        const is_member = await redis.sismember(`${server_name}-users`, user_id)
        if(is_member){
            res.push(user_id)
        }
    }
    return res
}

const addToQueue = (stream, author_id, post_id) => {
    return redis.xadd(stream, '*', 'author_id', author_id, 'post_id', post_id)
}

const readQueue = async (stream, count) => {
    const results = await redis.xreadgroup(
        'GROUP',
        process.env.SERVER_NAME,
        '1',
        'COUNT',
        count,
        'STREAMS',
        stream,
        '>'
    )

    if (results?.length) {
        const flatMessages = results.reduce((acc, result) => {
            const keyValues = result[1][0][1]
            const payload = {}
            for (let i = 0; i < keyValues.length; i += 2) {
                payload[keyValues[i]] = keyValues[i + 1]
            }
            acc.push({entry_id: result[1][0][0], payload})//messages
            return acc
        }, [])

        //clean up consumed messages
        // await Promise.all(flatMessages.map(message => redis.xdel(stream, message.entry_id)))

        return flatMessages.map(message => message.payload)
    }

    return null
}

export default {addToQueue, readQueue, mapUserSocket, unmapUserSocket, filterServerUsers, userToSocket}