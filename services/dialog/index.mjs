import path from 'path'
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 3001
import express from 'express'
import requestId from './middlewares/request-id.mjs'

import { createServer } from 'http'

import dialogs from './routers/dialogs.mjs'

const app = express()

const httpServer = createServer(app)

app.use(requestId)
app.use(express.json())
app.use(dialogs)

httpServer.listen(PORT, function () {
    console.log('Server listening at port %d', PORT);
});