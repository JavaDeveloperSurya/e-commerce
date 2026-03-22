const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// upload image 
const uploadImage = async (file, folder = process.env.NAME) => {
    try {

        if (!file) {
            throw new Error("No file provided");
        }

        const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
            resource_type: "auto"
        });

        logger.info("Image uploaded successfully", {
            public_id: result.public_id,
            url: result.secure_url
        });

        return {
            url: result.secure_url,
            public_id: result.public_id
        };

    } catch (error) {

        logger.error("Image upload failed", {
            error: error.message
        });

        throw error;
    }
};

// delete image

module.exports = { uploadImage };