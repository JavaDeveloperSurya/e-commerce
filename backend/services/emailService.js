const transporter = require('../config/nodeMailer');
const logger = require('../utils/logger');

const sendEmail = async (options) => {
    try {

        const info = await transporter.sendMail({
            from: `"${process.env.NAME}" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        });

        logger.info(`Email sent successfully to ${options.to}`, {
            messageId: info.messageId
        });

        return info;

    } catch (error) {

        logger.error('Email sending failed', {
            to: options.to,
            subject: options.subject,
            error: error.message
        });

        throw error;
    }
};

module.exports = sendEmail;