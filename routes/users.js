const express = require('express');
const protect = require('../middleware/auth');
const { searchUsers, getMe } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/me', getMe);

module.exports = router;