const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

const endpointRateLimit = rateLimit({

    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    }),

    handler: (req, res) => {

        logger.warn("Endpoint rate limit exceeded", {
            ip: req.ip,
            method: req.method,
            url: req.originalUrl
        });

        res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        });
    }

});

module.exports = endpointRateLimit;