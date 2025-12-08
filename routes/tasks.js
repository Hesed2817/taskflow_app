const express = require('express');
const protect = require('../middleware/auth');
const {
    getProjectTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const {
    projectIdValidator,
    taskValidator,
    taskIdValidator,
    taskFilterValidator,
    validate
} = require('../utils/validators');
const router = express.Router({ mergeParams: true });

// Protecting all routes
router.use(protect);

// api /projects/:projectId/tasks
router.route('/')
    .get(projectIdValidator.concat(taskFilterValidator),
        validate, getProjectTasks)
    .post(projectIdValidator.concat(taskValidator),
        validate, createTask);

//    /projects/:projectId/tasks/:taskId
router.get('/:taskId',
    projectIdValidator,
    taskIdValidator,
    validate,
    getTask
);

// PUT /projects/:taskId  
router.put('/:taskId',
    projectIdValidator,
    taskIdValidator,
    taskValidator,
    validate,
    updateTask
);

// DELETE /projects/:taskId
router.delete('/:taskId',
    projectIdValidator,
    taskIdValidator,
    validate,
    deleteTask
);

module.exports = router;