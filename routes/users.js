const express = require('express');
const protect = require('../middleware/auth');
const { searchUsers, getMe } = require('../controllers/userController');
const { userSearchValidator, validate } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.get('/search', userSearchValidator, validate, searchUsers);
router.get('/me', getMe);

module.exports = router;