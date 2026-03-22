const {v4:uuidv4}=require('uuid');
const redisClient=require('../config/redis');

const generateOTP = async()=>{
    const token=uuidv4();
    const otp = (Math.floor(100000 + Math.random()*900000)).toString(); //6 digit 
    const key=`otp:${token}`;

    await redisClient.set(
        key,
        JSON.stringify({
            email,
            otp,
            attemptsLeft: 5
        }),
        'EX', // keyword
        300   // TTL in seconds
    );
    return {token,otp};
}

module.exports =generateOTP;