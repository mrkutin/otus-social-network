import express from 'express'

const router = express.Router()
import posts from '../data-layer/posts.mjs'
import redis from '../data-layer/redis.mjs'

import authenticate from '../middlewares/authenticate.mjs'

router.post('/post/create', authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Пользователь не аутентифицирован')
    }

    if (!req.body.text) {
        return res.status(400).send('Невалидные данные')
    }

    try {
        const post_id = await posts.create(req.user._id, req.body.text)
        await redis.addToQueue('stream:post:created', req.user._id.toString(), post_id)
        return res.status(200).send(post_id)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})
router.put('/post/update', authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Пользователь не аутентифицирован')
    }

    if (!req.body.id || !req.body.text) {
        return res.status(400).send('Невалидные данные')
    }

    try {
        await posts.update(req.body.id, req.body.text)
        return res.status(200).send('OK')
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})
router.put('/post/delete/:id', authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Пользователь не аутентифицирован')
    }

    if (!req.params.id) {
        return res.status(400).send('Невалидные данные')
    }

    try {
        await posts.remove(req.params.id)
        return res.status(200).send('OK')
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})
router.get('/post/:id', authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Пользователь не аутентифицирован')
    }

    if (!req.params.id) {
        return res.status(400).send('Невалидные данные')
    }

    try {
        const post = await posts.get(req.params.id)
        return res.status(200).send(post)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

export default router
