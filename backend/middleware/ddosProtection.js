const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

const ddosProtection = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    }),
    windowMs: 1000,
    max: 10,

    handler: (req, res) => {
        logger.error(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many requests"
        });
    }
});

module.exports = ddosProtection;