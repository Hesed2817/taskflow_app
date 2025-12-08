const express = require('express');
const protect = require('../middleware/auth');
const {
    filterTasks
} = require('../controllers/taskController');
const { taskFilterValidator, validate } = require('../utils/validators');

const router = express.Router({ mergeParams: true });

// Protecting all routes
router.use(protect);

router.get('/', taskFilterValidator, validate, filterTasks);

module.exports = router;