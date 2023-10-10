import express from 'express'

const router = express.Router()
import dialogs from '../data-layer/redis.mjs'

//set initial count
router.get('/dialog/:user_id/count', async (req, res) => {
    if (!req.params.user_id) {
        return res.status(400).send('Невалидные данные')
    }
    try {
        const count = await dialogs.get(req.params.user_id)
        res.send(count)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

export default router