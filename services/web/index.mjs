import path from 'path'
import { fileURLToPath } from 'url'

const PORT = 3000
import express from 'express'

import { createServer } from 'http'
import useSockets from './routers/sockets.mjs'

import users from './routers/users.mjs'
import friends from './routers/friends.mjs'
// todo import feeds from './routers/feeds.mjs'
import posts from './routers/posts.mjs'
import dialogs from './routers/dialogs.mjs'

import authenticate from './middlewares/authenticate.mjs'

const app = express()

const httpServer = createServer(app)
useSockets(httpServer)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(__dirname + '/public'))
app.use(express.json())

app.use(users)
app.use(authenticate, friends)
// todo app.use(authenticate, feeds)
app.use(authenticate, posts)
app.use(authenticate, dialogs)

httpServer.listen(PORT, function () {
    console.log('Server listening at port %d', PORT);
});