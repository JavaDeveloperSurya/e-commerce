const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient;

if (process.env.NODE_ENV === 'production') {

    // Cloud Redis
    redisClient = new Redis({
        host: process.env.REDIS_CLOUD_HOST,
        port: process.env.REDIS_CLOUD_PORT,
        username: process.env.REDIS_CLOUD_USERNAME,
        password: process.env.REDIS_CLOUD_PASSWORD,
        maxRetriesPerRequest: null,
        enableReadyCheck: true
    });

    logger.info("Using Cloud Redis");

} else {

    // Local Redis
    redisClient = new Redis({
        host: process.env.REDIS_LOCAL_HOST || '127.0.0.1',
        port: process.env.REDIS_LOCAL_PORT || 6379
    });

    logger.info("Using Local Redis");
}


// connection events
redisClient.on('connect', () => {
    logger.info('Redis connected');
});

redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
});

module.exports = redisClient;