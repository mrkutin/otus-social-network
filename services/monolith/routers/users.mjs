import express from 'express'
const router = express.Router()
import users from '../data-layer/users.mjs'

import authenticate from '../middlewares/authenticate.mjs'
router.post('/user/authenticate', authenticate, (req, res) => {
    console.log(`Monolith service, /user/authenticate endpoint req.headers["x-request-id"]: ${req.headers["x-request-id"]}`)
    if(req.user) {
        const {password, ...user} = req.user
        return res.send(user)
    }

    return res.status(401).send('Пользователь не аутентифицирован')
})

router.post('/user/register', async (req, res) => {
    console.log(`Monolith service, /user/register endpoint req.headers["x-request-id"]: ${req.headers["x-request-id"]}`)
    if (!req.body.first_name || !req.body.second_name || !req.body.password) {
        return res.status(400).send('Невалидные данные')
    }
    try {
        const user_id = await users.create(req.body)
        res.send({user_id})
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

router.post('/login', async (req, res) => {
    console.log(`Monolith service, /login endpoint req.headers["x-request-id"]: ${req.headers["x-request-id"]}`)
    if (!req.body.id || !req.body.password) {
        return res.status(400).send('Невалидные данные')
    }
    try {
        const token = await users.authenticate(req.body.id, req.body.password)

        if (token) {
            return res.send({token})
        }
        res.status(404).send('Пользователь не найден')
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

router.get('/user/get/:id', async (req, res) => {
    console.log(`Monolith service, /user/get/:id endpoint req.headers["x-request-id"]: ${req.headers["x-request-id"]}`)
    if (!req.params.id) {
        return res.status(400).send('Невалидные данные')
    }
    try {
        const user = await users.get(req.params.id)
        if (user) {
            return res.send(user)
        }
        res.status(404).send('Анкета не найдена')
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

router.get('/user/search', async (req, res) => {
    console.log(`Monolith service, /user/search endpoint req.headers["x-request-id"]: ${req.headers["x-request-id"]}`)
    if (!req.query.first_name && !req.query.second_name) {
        return res.status(400).send('Невалидные данные')
    }
    try {
        const result = await users.search(req.query.first_name, req.query.second_name)
        return res.send(result)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

export default router