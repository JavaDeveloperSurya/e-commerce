const mongoose = require('mongoose');
const isIdValid = (id,model)=>{
    if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn(`invalid ${model} id`);
        throw new Error(`invalid ${model} id`,400);
    }
}

module.exports = isIdValid;