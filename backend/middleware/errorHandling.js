const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {

    const statusCode = err.status || err.statusCode || 500;

    // structured logging
    logger.error("Application Error", {
        message: err.message,
        status: statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        stack: err.stack
    });

    const response = {
        success: false,
        message: err.message || "Internal Server Error"
    };

    // hide stack in production
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;