import express from 'express'
const router = express.Router()
import friends from "../data-layer/friends.mjs";

router.put('/friend/set/:user_id', async (req, res) => {
    if (!req.params.user_id) {
        return res.status(400).send('Невалидные данные')
    }

    if (!req.user) {
        return res.status(401).send('Пользователь не аутентифицирован')
    }

    try {
        await friends.set(req.user.id, req.params.user_id)
        return res.status(200).send('OK')
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

router.put('/friend/delete/:user_id', async (req, res) => {
    if (!req.params.user_id) {
        return res.status(400).send('Невалидные данные')
    }

    if (!req.user) {
        return res.status(401).send('Пользователь не аутентифицирован')
    }

    try {
        await friends.unset(req.user.id, req.params.user_id)
        return res.status(200).send('OK')
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

export default router
