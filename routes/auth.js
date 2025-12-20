const express = require('express');
const { registerUser, loginUser, changePassword } = require('../controllers/authController');
const { registerValidator,
    loginValidator,
    validate
} = require('../utils/validators');
const protect = require('../middleware/auth')
const router = express.Router();

router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);
router.put('/change-password', protect, changePassword);

module.exports = router;