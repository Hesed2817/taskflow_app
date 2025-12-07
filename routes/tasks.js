const express = require('express');
const protect = require('../middleware/auth');
const {
    getProjectTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });

// Protecting all routes
router.use(protect);

// api /projects/:projectId/tasks
router.route('/')
    .get(getProjectTasks)
    .post(createTask);

//    /projects/:projectId/tasks/:taskId
router.route('/:taskId')
    .get(getTask)
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;