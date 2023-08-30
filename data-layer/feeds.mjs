const USER_FEED_SIZE = 1000;
const REDIS_CONNECTION_STRING = `redis://${process.env.REDIS_HOST || 'localhost'}:6379`

import Redis from 'ioredis'

const redis = new Redis(REDIS_CONNECTION_STRING)

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
const feedAffectedByAllAuthorsPosts = async getUserFeedSize => {
    if (!connection) {
        throw new Error('База данных недоступна')
    }

    const statement = `SELECT * FROM 
        (SELECT friends.user_id, posts.id AS post_id, posts.user_id AS author_id, posts.created_at, posts.text,
        ROW_NUMBER() OVER (PARTITION BY friends.user_id ORDER BY posts.created_at DESC) AS count_number
        FROM friends
        INNER JOIN posts  
        ON friends.friend_id = posts.user_id) AS all_posts
        WHERE count_number <= ${getUserFeedSize}
        ;`

    const res = await connection.execute(statement)
    return res?.[0] || null
}

const updateCache = async feed => {
    //new posts to be cached
    let postIds = Object.keys(feed.reduce((acc, post) => {
        acc[post.post_id] = true
        return acc
    }, {}))

    //group posts by user_id
    const postsByUserId = feed.reduce((acc, post) => {
        if (!acc[post.user_id]) {
            acc[post.user_id] = []
        }
        acc[post.user_id].push(post)
        return acc
    }, {})

    for (const user_id in postsByUserId) {
        //clean up old post ids from the user's feed
        const oldUserPostIds = await redis.smembers(`USER-FEED-${user_id}`)
        const oldUserPostIdsToBeDeleted = oldUserPostIds.filter(x => !postIds.includes(x));
        await Promise.all(oldUserPostIdsToBeDeleted.map(oldPostId => redis.srem(`USER-FEED-${user_id}`, oldPostId)))

        //build up new cache for the user
        for (const post of postsByUserId[user_id]) {
            //add post id to user feed list
            await redis.sadd(`USER-FEED-${post.user_id}`, post.post_id)
            //add post too for faster read
            const {user_id, count_number, ...rest} = post
            await redis.call('JSON.SET', `POST-${post.post_id}`, '$', JSON.stringify(rest))
        }
    }

    //clean up unused posts
    //posts already cached
    const oldPostIds = (await redis.keys(`POST-*`)).map(id => id.substring(5))

    //old posts missing among new ones
    const oldPostsToBeDeleted = oldPostIds.filter(x => !postIds.includes(x));
    await Promise.all(oldPostsToBeDeleted.map(oldPostId => redis.del(`POST-${oldPostId}`)))
}

const rebuildCache = async () => {
    // await cleanUpAllUsersFeed()
    const feed = await feedAffectedByAllAuthorsPosts(USER_FEED_SIZE)
    await updateCache(feed)
    console.log('=== CACHE SUCCESSFULLY UPDATED === ' + new Date())
}

const getUserFeed = async (user_id, offset = 0, limit) => {
    const feed = []

    const postIds = await redis.smembers(`USER-FEED-${user_id}`)
    const postIdsLimited = postIds.slice(offset, offset + (limit || postIds.length))

    for (const postId of postIdsLimited) {
        const post = await redis.call('JSON.GET', `POST-${postId}`)
        feed.push(JSON.parse(post))
    }

    return feed.sort((a, b) => {
        if (a.created_at < b.created_at) {
            return 1
        } else if (a.created_at > b.created_at) {
            return -1
        }
        return 0
    } )
}

export default {rebuildCache, getUserFeed}
