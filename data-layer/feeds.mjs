const USER_FEED_SIZE = 1000;

const REDIS_HOST = process.env.REDIS_HOST || 'redis://0.0.0.0:6379'
import Redis from 'ioredis'
const redis = new Redis(REDIS_HOST)

import mysql from 'mysql2/promise'
const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    database: 'social',
    user: 'root',
    password: 'topsecret'
}
let connection
try {
    connection = await mysql.createConnection(config)
} catch (err) {
    console.error('error connecting: ' + err.stack)
}

//find which followers are affected by all posts and return up to getUserFeedSize most recent posts for each follower
const feedAffectedByAllUsersPosts = async getUserFeedSize => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }

    const statement = `SELECT * FROM 
        (SELECT friends.user_id, posts.id AS post_id, posts.user_id AS author_id, posts.created_at, posts.text,
        ROW_NUMBER() OVER (PARTITION BY friends.user_id ORDER BY posts.id) AS count_number
        FROM friends
        INNER JOIN posts  
        ON friends.friend_id = posts.user_id
        ORDER BY user_id ASC, created_at DESC) AS all_posts
        WHERE count_number <= ${getUserFeedSize};`

    const res = await connection.execute(statement)
    return res?.[0] || null
}

//find which followers are affected by one user posts only and return up to getUserFeedSize most recent posts for each follower
const feedAffectedByOneUserPosts = async (getUserFeedSize, user_id) => {
    if (!connection) {
        throw new Error('База данных не доступна')
    }

    const statement = `SELECT * FROM 
        (SELECT friends.user_id, posts.id AS post_id, posts.user_id AS author_id, posts.created_at, posts.text,
        ROW_NUMBER() OVER (PARTITION BY friends.user_id ORDER BY posts.id) AS count_number
        FROM friends
        INNER JOIN posts  
        ON friends.friend_id = posts.user_id
        AND friends.friend_id = '${user_id}'
        ORDER BY user_id ASC, created_at DESC) AS all_posts
        WHERE count_number <= ${getUserFeedSize};`

    const res = await connection.execute(statement)
    return res?.[0] || null
}

const cleanUpCache = async () => {
    //clean up existing lists
    let keys = await redis.keys('USER-FEED-*')
    for (const key of keys) {
        await redis.del(key)
    }

    //clean up existing posts
    keys = await redis.keys('POST-*')
    for (const key of keys) {
        await redis.del(key)
    }
}

const updateCache = async feed => {
    for(const post of feed){
        //add post id to user feed list
        await redis.rpush(`USER-FEED-${post.user_id}`, post.post_id)
        //add post for faster read
        const {user_id, count_number, ...rest} = post
        await redis.call('JSON.SET', `POST-${post.post_id}`, '$', JSON.stringify(rest))
    }
}

const warmUpCache = async () => {
    await cleanUpCache()
    const feed = await feedAffectedByAllUsersPosts(USER_FEED_SIZE)
    await updateCache(feed)
}

const updateFeed = async (user_id) => {
    const feed = await feedAffectedByOneUserPosts(USER_FEED_SIZE, user_id)
    await updateCache(feed)
}

const getUserFeed = async (user_id, offset = 0, limit) => {
    const feed = []

    const postIds = await redis.lrange(`USER-FEED-${user_id}`, 0, -1)
    const postIdsLimited = postIds.slice(offset, offset + (limit || postIds.length))

    for (const postId of postIdsLimited) {
        const post = await redis.call('JSON.GET', `POST-${postId}`)
        feed.push(JSON.parse(post))
    }
    return feed
}

await warmUpCache()

export default {warmUpCache, getUserFeed, updateFeed}
