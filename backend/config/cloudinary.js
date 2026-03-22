const logger = require('../utils/logger');
const cloudinary = require('cloudinary').v2;

const cloudinaryConfig = () => {
    try {

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        logger.info("Cloudinary configured successfully");

    } catch (error) {

        logger.error("Cloudinary configuration failed", {
            error: error.message
        });

        throw error;
    }
};

module.exports = cloudinaryConfig;