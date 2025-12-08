const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { registerValidator,
    loginValidator,
    validate
} = require('../utils/validators');
const router = express.Router();

router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);

module.exports = router;