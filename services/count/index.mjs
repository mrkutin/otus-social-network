const PORT = 3001
import express from 'express'

import dialogs from './routers/dialogs.mjs'

const app = express()

app.use(express.json())

app.use(dialogs)

app.get('/', (req, res) => {
    res.send('Добро пожаловать в модуль диалогов!')
})

app.listen(PORT, () => {
    console.log(`Dialog app listening on port ${PORT}`)
})