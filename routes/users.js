const express = require('express');
const protect = require('../middleware/auth');
const { searchUsers, getMe, editProfile, deleteUser } = require('../controllers/userController');
const { userSearchValidator, validate, deleteUserValidator } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.get('/search', userSearchValidator, validate, searchUsers);
router.get('/me', getMe);
router.put('/me', editProfile);
router.delete('/delete-profile',deleteUserValidator, validate, deleteUser);

module.exports = router;