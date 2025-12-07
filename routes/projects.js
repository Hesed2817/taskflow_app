const express = require('express');
const protect = require('../middleware/auth');
const { createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    addProjectMember,
    getProjectMembers,
    removeProjectMember
} = require('../controllers/projectController');
const taskRouter = require('./tasks');

const router = express.Router({ mergeParams: true });

// protect all routes related to the projects
router.use(protect);

router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:projectId')
    .get(getProject)
    .put(updateProject)
    .delete(deleteProject);

// routes for project team management
router.route('/:projectId/members')
    .get(getProjectMembers)
    .post(addProjectMember);

router.delete('/:projectId/members/:userId', removeProjectMember);

// routes related to tasks
router.use('/:projectId/tasks', taskRouter);

module.exports = router;