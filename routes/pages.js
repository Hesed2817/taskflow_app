const express = require('express');
const protect = require('../middleware/auth');
const { homePage, login, register, dashboard, search, getProjects, createProject, getProject,
    editProject,
    projectSettings,
    getTasks,
    getTask,
    editTask,
    getProjectTasks,
    profile,
    editProfile,
    changePassword,
    logout} = require('../controllers/pageController');
const router = express.Router();


//============= Public routes =============

// Home page
router.get('/', homePage);

// Login page
router.get('/login', login);

// Register page
router.get('/register', register);

// ========== PROTECTED ROUTES ==========

// Dashboard
router.get('/dashboard', protect, dashboard);

// Search page
router.get('/search', protect, search);

// All Projects
router.get('/projects', protect, getProjects);

// Create project
router.get('/projects/new', protect, createProject);

// Project details
router.get('/projects/:id', protect, getProject);

// Edit project
router.get('/projects/:id/edit', protect, editProject);

// Project settings
router.get('/projects/:id/settings', protect, projectSettings);

// All Tasks
router.get('/tasks', protect, getTasks);

// Task details
router.get('/tasks/:id', protect, getTask);

// Task edit page
router.get('/tasks/:id/edit', protect, editTask);

// All tasks for a specific project
router.get('/projects/:id/tasks', protect, getProjectTasks);

// Profile
router.get('/profile', protect, profile);

// Edit profile
router.get('/profile/edit', protect, editProfile);

// Change password
router.get('/profile/change-password', protect, changePassword);

// Profile delete page
router.get('/profile/delete', protect, function (request, response) {
    response.render('profile/delete', {
        title: 'Delete Account',
        cssFile: 'profile',
        user: request.user,
        error: request.query.error || null,
        success: request.query.success || null
    });
});

// ========== AUTH ACTIONS ==========

// Logout
router.get('/logout', protect, logout);

module.exports = router;