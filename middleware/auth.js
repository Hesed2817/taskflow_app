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
        // checking for cookies to authenticate the web requests
        else if (request.cookies && request.cookies.auth_token) {
            token = request.cookies.auth_token;
        }

        // checking if the token exits
        if (!token) {
            // response for the API request
            if (request.headers['content-type']?.includes('application/json') || request.headers['accept']?.includes('application/json')) {
                return response.status(401).json({
                    success: false,
                    message: 'Not authorized, no token'
                });
            }
            // response for the web request
            else {
                return response.redirect('/login?error=Please login first');
            }
        }

        try {
            // verify the token
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            // get the user associated with the verified jwt payload userId
            request.user = await User.findById(decoded.id).select('-password');

            if (!request.user) {
                if (request.headers['content-type']?.includes('application/json')) {
                    return response.status(401).json({
                        success: false,
                        message: 'Not authorized, user not found'
                    });
                } else {
                    response.clearCookie('auth_token');
                    return response.redirect('/login?error=User not found');
                }
            }

            next();

        } catch (jwtError) {
            console.error(jwtError);

            response.clearCookie('auth_token');

            if (request.headers['content-type']?.includes('application/json')) {
                return response.status(401).json({
                    success: false,
                    message: jwtError.name === 'TokenExpiredError'
                        ? 'Token expired, please login again'
                        : 'Not authorized, token failed'
                });
            } else {
                return response.redirect('/login?error=Please login again');
            }
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