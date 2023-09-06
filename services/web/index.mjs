const PORT = 3000
import express from 'express'

import users from './routers/users.mjs'
import friends from './routers/friends.mjs'
// todo import feeds from './routers/feeds.mjs'
import posts from './routers/posts.mjs'
import dialogs from './routers/dialogs.mjs'

import authenticate from './middlewares/authenticate.mjs'

const app = express()

app.use(express.json())

app.use(users)
app.use(authenticate, friends)
// todo app.use(authenticate, feeds)
app.use(authenticate, posts)
app.use(authenticate, dialogs)

app.get('/', (req, res) => {
    res.send('Добро пожаловать в социальную сеть OTUS!')
})

app.listen(PORT, () => {
    console.log(`OTUS social network app listening on port ${PORT}`)
})