const PORT = 3000

import express from 'express'
import {create, authenticate, get} from "./users.mjs";

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Добро пожаловать в социальную сеть OTUS!')
})

app.post('/user/register', async (req, res) => {
    if (!req.body.first_name || !req.body.second_name || !req.body.password) {
        return res.status(400).send('Невалидные данные')
    }
    try {
        const user_id = await create(req.body)
        res.send({user_id})
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

app.post('/login', async (req, res) => {
    if (!req.body.id || !req.body.password) {
        return res.status(400).send('Невалидные данные')
    }
    try {
        const token = await authenticate(req.body.id, req.body.password)
        if(token){
            return res.send({token})
        }
        res.status(404).send('Пользователь не найден')
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

app.get('/user/get/:id', async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send('Невалидные данные')
    }
    try {
        const user = await get(req.params.id)
        if(user){
            return res.send({user})
        }
        res.status(404).send('Анкета не найдена')
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

app.listen(PORT, () => {
    console.log(`OTUS social network app listening on port ${PORT}`)
})