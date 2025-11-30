require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async function (request, response, next) {
    try {
        let token;

        if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
            // getting the token from the header
            token = request.headers.authorization.split(' ')[1];
        }

        // checking if the token exits
        if (!token) {
            return response.status(401).json({
                success: false,
                message: 'Not authorized, no token'
            });
        }

        try {
            // verify the token
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            // get the user associated with the verified jwt payload userId
            request.user = await User.findById(decoded.id).select('-password');

            if (!request.user) {
                return response.status(401).json({
                    success: false,
                    message: 'Not authorized, user not found'
                });
            }

            next();
            
        } catch (jwtError) {
            return response.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }

    } catch (error) {
        console.error('Auth middleware error', error);
        return response.status(500).json({
            success: false,
            message: 'Server error in authorization'
        });
    }
}

module.exports = protect;