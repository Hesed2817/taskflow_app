const express = require('express');
const protect = require('../middleware/auth');
const { searchUsers, getMe } = require('../controllers/userController');
const { userSearchValidator, validate } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.get('/search', userSearchValidator, validate, searchUsers);
router.get('/me', getMe);
router.put('/me', async function (request, response) {
    try {
        const { username, email } = request.body;
        const User = require('../models/User');
        
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
});

module.exports = router;