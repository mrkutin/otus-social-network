const CACHE_UPDATE_INTERVAL_MS = process.env.CACHE_UPDATE_INTERVAL_MS || 3000

import express from 'express'

const router = express.Router()
import feeds from "../data-layer/feeds.mjs"

router.get('/post/feed', async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Пользователь не аутентифицирован')
    }

    try {
        const feed = await feeds.getUserFeed(req.user.id, req.params.offset, req.params.limit)
        return res.status(200).send(feed)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Ошибка сервера')
    }
})

//rebuild all cache every CACHE_UPDATE_INTERVAL_MS
setInterval(async () => {
    await feeds.rebuildCache()
}, CACHE_UPDATE_INTERVAL_MS)

export default router
