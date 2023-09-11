import {Server} from 'socket.io'
import usersDb from '../data-layer/users.mjs'
import postsDb from '../data-layer/posts.mjs'
import friendsDb from '../data-layer/friends.mjs'
import redis from '../data-layer/redis.mjs'

const server_name = `${process.env.NAME || 'single-server'}`

export default (httpServer) => {
    const io = new Server(httpServer)

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token
        socket.user = await usersDb.findByToken(token)
        if (socket.user) {
            next()
        } else {
            next(new Error('Invalid API token'))
        }
    })

    io.on('connection', async (socket) => {
        socket.on('disconnect', async () => {
            await redis.unmapUserSocket(server_name, socket.user._id.toString())
            console.log('socket id disconnected: ', socket.id)
        })
        console.log('socket id on connection: ', socket.id)
        await redis.mapUserSocket(server_name, socket.user._id.toString(), socket.id)
    })

    setInterval(async () => {
        const posts = await redis.readQueue('stream:post:created', 1)
        if (posts && posts.length) {
            for (const post of posts) {
                const postObject = await postsDb.get(post.post_id)
                const followerIds = await friendsDb.followerIds(post.author_id)
                const currentServerFollowerIds = redis.filterServerUsers(followerIds, server_name)
                for (const followerId of currentServerFollowerIds) {
                    const socketId = await redis.userToSocket(followerId)
                    if (socketId) {
                        const socket = io.sockets.sockets.get(socketId)
                        if (socket) {
                            socket.emit('friend-posted', {
                                postId: post.post_id, postText: postObject.text, userId: post.author_id
                            })
                        }
                    }
                }
            }
        }
    }, 2000)

    return io
}

