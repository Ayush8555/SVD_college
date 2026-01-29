import { createClient } from 'redis';

let redisClient;
let isConnected = false;

// Initialize Redis
export const initRedis = async () => {
    try {
        if (!process.env.REDIS_URL) {
            console.log('⚠️ REDIS_URL not found, skipping Redis init.');
            return;
        }

        redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 5) {
                        console.log('❌ Redis: Max retries exhausted. Disabling cache.');
                        return new Error('Max retries exhausted');
                    }
                    return Math.min(retries * 50, 2000);
                }
            }
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis Client Error', err);
            isConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis Connected');
            isConnected = true;
        });

        await redisClient.connect();
    } catch (error) {
        console.error('❌ Redis Init Error:', error);
        isConnected = false;
    }
};

// Get from cache
export const getCache = async (key) => {
    if (!isConnected || !redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis Get Error:', error);
        return null;
    }
};

// Set cache (TTL in seconds)
export const setCache = async (key, value, ttl = 300) => {
    if (!isConnected || !redisClient) return;
    try {
        await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    } catch (error) {
        console.error('Redis Set Error:', error);
    }
};

export const clearCache = async (pattern) => {
    // Simple implementation for specific key clearing if needed
    // For now, we rely on TTL
};
