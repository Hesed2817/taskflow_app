const express = require('express');
const protect = require('../middleware/auth');
const { createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
} = require('../controllers/projectController');
const taskRouter = require('./task');

const router = express.Router();

// protect all routes related to the projects
router.use(protect);

router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getProject)
    .put(updateProject)
    .delete(deleteProject);

router.use('/:projectId/tasks', taskRouter);

module.exports = router;