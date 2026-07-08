import { Redis } from 'ioredis'
import { env } from './env.js'

const redisUrl = env.REDIS_URL

export const redis = new Redis(redisUrl)
