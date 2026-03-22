const Joi = require('joi');

const loginValidation=(data)=>{
    const schema=Joi.object({
        email:Joi.string().required().email(),
    });
    return schema.validate(data);
}

module.exports={loginValidation};