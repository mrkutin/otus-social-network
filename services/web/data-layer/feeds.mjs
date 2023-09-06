const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT || 27017
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || 'topsecret'
const USER_FEED_SIZE = process.env.USER_FEED_SIZE || 1000
const REDIS_CONNECTION_STRING = `redis://${process.env.REDIS_HOST || 'localhost'}:6379`

import Redis from 'ioredis'

const redis = new Redis(REDIS_CONNECTION_STRING)

import {MongoClient, ObjectId} from 'mongodb'

const connectionString = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}`
const client = new MongoClient(connectionString)

try {
    await client.connect()
    console.log('Feeds connected to MongoDB cluster')
} catch (err) {
    console.error('error connecting: ' + err.stack)
}

const socialDb = client.db('social')
const dbFriends = socialDb.collection('friends')


//find which followers are affected by all posts and return up to getUserFeedSize most recent posts for each follower
const feedAffectedByAllAuthorsPosts = async getUserFeedSize => {
    const res = await dbFriends.aggregate([
        {$limit: 2},
        {
            $lookup: {
                from: 'posts',
                localField: 'friend_id',
                foreignField: 'user_id',
                as: 'friends_posts'
            }
        },
        {
            $unwind: {
                path: '$friends_posts',
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $project: {
                _id: 0,
                user_id: 1,
                post_id: '$friends_posts._id',
                author_id: '$friends_posts.user_id',
                created_at: '$friends_posts.created_at',
                text: '$friends_posts.text'
            }
        },
        {
            $setWindowFields: {
                partitionBy: '$user_id',
                sortBy: { 'friends_posts.created_at': -1 },
                output: {
                    count_number: {
                        $documentNumber: {}
                    }
                }
            }
        },
        {
            $match: {
                count_number: {$lte: getUserFeedSize}
            }
        }
    ]).toArray()
    return res?.[0] || null

    // const statement = `SELECT * FROM
    //     (SELECT friends.user_id, posts.id AS post_id, posts.user_id AS author_id, posts.created_at, posts.text,
    //     ROW_NUMBER() OVER (PARTITION BY friends.user_id ORDER BY posts.created_at DESC) AS count_number
    //     FROM friends
    //     INNER JOIN posts
    //     ON friends.friend_id = posts.user_id) AS all_posts
    //     WHERE count_number <= ${getUserFeedSize}
    //     ;`

    // const res = await connection.execute(statement)
    // return res?.[0] || null
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
        //clean up old post ids from the web's feed
        const oldUserPostIds = await redis.smembers(`USER-FEED-${user_id}`)
        const oldUserPostIdsToBeDeleted = oldUserPostIds.filter(x => !postIds.includes(x));
        await Promise.all(oldUserPostIdsToBeDeleted.map(oldPostId => redis.srem(`USER-FEED-${user_id}`, oldPostId)))

        //build up new cache for the web
        for (const post of postsByUserId[user_id]) {
            //add post id to web feed list
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

const getUserFeed = async (user_id, offset = 0, limit = -1) => {
    const postIds = await redis.smembers(`USER-FEED-${user_id}`)

    const feed = await Promise.all(postIds.map(async postId => {
        const post = await redis.call('JSON.GET', `POST-${postId}`)
        return JSON.parse(post)
    }))

    const sortedFeed = feed.sort((a, b) => {
        if (a.created_at < b.created_at) {
            return 1
        } else if (a.created_at > b.created_at) {
            return -1
        }
        return 0
    })

    return sortedFeed.slice(offset, offset + (limit === -1 ? sortedFeed.length : limit))
}

export default {rebuildCache, getUserFeed}
