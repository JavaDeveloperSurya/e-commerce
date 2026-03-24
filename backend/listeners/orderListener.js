const logger = require('../utils/logger');
const orderEvents = require("../events/orderEvents");
const sendMail = require('../services/emailService');
const orderStatusMail = require("../templates/orderStatusOptions");

orderEvents.on("order.status.changed", async (data) => {
    try {
        const { email, name, orderId, status } = data;
        const info = await sendMail(orderStatusMail(email, name, orderId, status));
        logger.info('Order status email sent:', info.response);
    } catch (error) {
        logger.error('Error sending order email:', error.message);
    }
});