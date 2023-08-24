import express from 'express'
const router = express.Router()
import posts from "../data-layer/posts.mjs";

router.post('/post/create', async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Пользователь не аутентифицирован')
    }

    if (!req.body.text) {
        return res.status(400).send('Невалидные данные')
    }

    try {
        const id = await posts.create(req.user.id, req.body.text)
        return res.status(200).send(id)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})
router.put('/post/update', async (req, res) => {
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
router.put('/post/delete/:id', async (req, res) => {
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
router.get('/post/:id', async (req, res) => {
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
