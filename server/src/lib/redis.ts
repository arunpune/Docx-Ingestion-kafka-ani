import Redis from "ioredis"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

class RedisSingleton {
  private static client: Redis

  static getInstance(): Redis {
    if (!this.client) {
      this.client = new Redis(REDIS_URL)
    }
    return this.client
  }

  static async set(key: string, value: string, ttl?: number) {
    const client = this.getInstance()
    return ttl ? client.set(key, value, "EX", ttl) : client.set(key, value)
  }

  static async get(key: string) {
    const client = this.getInstance()
    return client.get(key)
  }

  static async del(key: string) {
    const client = this.getInstance()
    return client.del(key)
  }
}

export const redis = RedisSingleton.getInstance()
