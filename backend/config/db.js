const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`MongoDB connected successfully: ${conn.connection.host}`);
        // connection events
        mongoose.connection.on('connected', () => {
            logger.info('Mongoose connected to database');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('Mongoose connection error', {
                error: err.message
            });
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('Mongoose disconnected');
        });

    } catch (error) {

        logger.error('MongoDB connection failed', {
            error: error.message
        });

        process.exit(1);
    }
};

module.exports = connectDb;