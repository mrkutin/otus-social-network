const REDIS_HOST = process.env.REDIS_HOST || 'redis://0.0.0.0:6379'

import Redis from 'ioredis'
const redis = new Redis(REDIS_HOST)

