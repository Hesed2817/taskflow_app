require('dotenv').config();
const jwt = require('jsonwebtoken');
const generateToken = (userId) => {
    
    const userPayload = {
        id: userId
    };
    
    return jwt.sign(
        userPayload,
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRE
        }
    );
}

module.exports = generateToken;