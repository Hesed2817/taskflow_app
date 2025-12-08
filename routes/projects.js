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
const {
    projectValidator,
    projectIdValidator,
    memberValidator,    
    validate
} = require('../utils/validators');
const taskRouter = require('./tasks');

const router = express.Router({ mergeParams: true });

// protect all routes related to the projects
router.use(protect);

router.route('/')
    .get(getProjects)
    .post(projectValidator, validate, createProject);

router.route('/:projectId')
    .all(projectIdValidator, validate)
    .get(getProject)
    .put(projectValidator, validate, updateProject)
    .delete(deleteProject);

// routes for project team management
router.route('/:projectId/members')
    .get(getProjectMembers)
    .post(projectIdValidator.concat(memberValidator), validate, addProjectMember);

router.delete('/:projectId/members/:userId',projectIdValidator.concat(memberValidator), validate, removeProjectMember);

// routes related to tasks
router.use('/:projectId/tasks', taskRouter);

module.exports = router;