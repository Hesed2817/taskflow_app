const User = require('../models/User');
const bcrypt = require('bcrypt')
const generateToken = require('../utils/generateToken');

// Registering a user
const registerUser = async function (request, response) {
    try {
        // extract the user input from the request body
        const { username, email, password } = request.body;

        // check if the user is not already registered
        const userExists = await User.findOne({ email });
        if (userExists) {
            if (request.headers['content-type']?.includes('application/json')) {
                return response.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            } else {
                return response.redirect('/register?error=User already exists with this email');
            }

        }

        // create a new user
        const user = await User.create({ username, email, password });

        // generate a token
        const token = generateToken(user._id);

        if (!request.headers['content-type']?.includes('application/json')) {
            response.cookie('auth_token', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
        }

        if (request.headers['content-type']?.includes('application/json')) {
            response.status(201).json({
                success: true,
                data: {
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                    token: token
                }
            });
        } else {
            response.redirect('/dashboard');
        }

    } catch (error) {
        console.error('Registration error:', error);
        if (request.headers['content-type']?.includes('application/json')) {
            response.status(500).json({
                success: false,
                message: 'Server error'
            });
        } else {
            response.redirect('/register?error=Registration failed');
        }
    }
}

const loginUser = async function (request, response) {
    // logic for logging in a user
    try {
        const { email, password } = request.body;

        // check for the user and include the password (since select: false)
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {           

            // generate a jwt token
            const token = generateToken(user._id);                        

            // set cookie for web requests
            if (!request.headers['content-type']?.includes('application/json')) {                                           
                response.cookie('auth_token', token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
                });                                

            }

            if (request.headers['content-type']?.includes('application/json')) {
                // API call
                response.json({
                    success: true,
                    token,
                    data: {
                        _id: user.id,
                        username: user.username,
                        email: user.email                        
                    }
                });
            } else {
                // Page request                                              
                response.redirect('/dashboard');
            }

        } else {                
            
            if (request.headers['content-type']?.includes('application/json')) {
                response.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            } else {
                response.redirect('/login?error=Invalid email or password');
            }

        }
    } catch (error) {        

        console.error('Failed to create user:', error);
        if (request.headers['content-type']?.includes('application/json')) {
            response.status(500).json({
                success: false,
                message: 'Server error'
            });
        } else {
            response.redirect('/login?error=Login failed');
        }
    }

}

const changePassword = async function (request, response) {
    try {
        const { currentPassword, newPassword } = request.body;
        
        // Validation
        if (!currentPassword || !newPassword) {
            return response.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }
        
        if (newPassword.length < 6) {
            return response.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }
        
        // Get user with password
        const user = await User.findById(request.user.id).select('+password');
        
        if (!user) {
            return response.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return response.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        response.json({
            success: true,
            message: 'Password updated successfully'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        response.status(500).json({
            success: false,
            message: 'Server error' + error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    changePassword
};