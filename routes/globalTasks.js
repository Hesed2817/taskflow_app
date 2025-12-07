const express = require('express');
const protect = require('../middleware/auth');
const {
    filterTasks
} = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });

// Protecting all routes
router.use(protect);

router.get('/', filterTasks);

module.exports = router;