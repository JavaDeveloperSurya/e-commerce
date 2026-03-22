const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

try {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    logger.info('Email transporter initialized');

} catch (error) {
    logger.error('Email transporter initialization failed', error);
}

module.exports = transporter;