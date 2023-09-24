import path from 'path'
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 3000
import express from 'express'
import requestId from './middlewares/request-id.mjs'

import { createServer } from 'http'

import users from './routers/users.mjs'
import friends from './routers/friends.mjs'
import posts from './routers/posts.mjs'

const app = express()

const httpServer = createServer(app)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(__dirname + '/public'))
app.use(express.json())

app.use(requestId)
app.use(users)
app.use(friends)
app.use(posts)

httpServer.listen(PORT, function () {
    console.log('Server listening at port %d', PORT);
});