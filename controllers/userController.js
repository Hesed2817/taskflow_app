const bcrypt = require('bcrypt');
const User = require('../models/User');

const searchUsers = async function (request, response, next) {
    try {
        const { email, username } = request.query;

        let query = {};

        if (email) {
            query.email = { $regex: email, $options: 'i' }; // case insensitive search
        }

        if (username) {
            query.username = { $regex: username, $options: 'i' };
        }

        // removing current user from results
        query._id = { $ne: request.user.id };

        const users = await User.find(query)
            .select('_id username email')
            .limit(10);

        response.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error(error);
        next();
    }
}

const deleteUser = async function (request, response, next) {
    try {
        const { password } = request.body;
        
        // Validate password
        if (!password || password.trim() === '') {
            return response.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }
        
        // Get user with password (since it's select: false by default)
        const user = await User.findById(request.user.id).select('+password');
        
        if (!user) {
            return response.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return response.status(401).json({
                success: false,
                message: 'Incorrect password. Please try again.'
            });
        }
        
        // Delete user (cascade handled in pre-hook)
        await User.findByIdAndDelete(request.user.id);
        
        // Clear auth token
        response.clearCookie('auth_token');
        
        return response.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete user error:', error);
        response.status(500).json({
            success: false,
            message: 'Server error while deleting account'
        });
    }
}

const editProfile = async function (request, response) {
    try {
        const { username, email } = request.body;

        // Update user
        const user = await User.findByIdAndUpdate(
            request.user.id,
            { username, email },
            { new: true, runValidators: true }
        ).select('-password');

        response.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        response.status(500).json({
            success: false,
            message: error.code === 11000 ? 'Email already exists' : 'Server error'
        });
    }
}

const getMe = async function (request, response, next) {
    try {
        const user = await User.findById(request.user.id).select('-password');

        response.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error(error);
        next();
    }
}

module.exports = {
    searchUsers, getMe, editProfile, deleteUser
};