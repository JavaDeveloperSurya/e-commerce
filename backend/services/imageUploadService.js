const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
// upload image 
const uploadImage = async (file, folder = 'products') => {
    logger.info('image upload service start');
    try {
        
        if (!file) {
            throw new Error("No file provided");
        }

        const filePath = typeof file === "string"
            ? path.resolve(file)
            : path.resolve(file.path);

        // Check file exists
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found at path");
        }
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: "auto"
        });
        // Delete file from local after upload (important)
        fs.unlinkSync(filePath);
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