// routes/pages.js - SIMPLE & SAFE
const express = require('express');
const router = express.Router();

// Helper: Check if user is logged in
const isLoggedIn = (request) => {
    return request.session && request.session.user;
};

// Helper: Protect route middleware
const requireAuth = (request, response, next) => {
    if (isLoggedIn(request)) {
        return next();
    }
    response.redirect('/login?error=Please login first');
};

// ========== PUBLIC ROUTES ==========

// Home page
router.get('/', (request, response) => {
    if (isLoggedIn(request)) {
        return response.redirect('/dashboard');
    }
    response.redirect('/login');
});

// Login page
router.get('/login', (request, response) => {
    if (isLoggedIn(request)) {
        return response.redirect('/dashboard');
    }
    
    response.render('auth/login', {
        title: 'Login',
        user: null,  // Always pass user, even if null
        error: request.query.error || null,
        success: request.query.success || null
    });
});

// Register page
router.get('/register', (request, response) => {
    if (isLoggedIn(request)) {
        return response.redirect('/dashboard');
    }
    
    response.render('auth/register', {
        title: 'Register',
        user: null,
        error: request.query.error || null,
        success: request.query.success || null
    });
});

// ========== PROTECTED ROUTES ==========

// Dashboard
router.get('/dashboard', requireAuth, async (request, response) => {
    try {
        // SIMPLE TEST DATA - we'll replace with real data later
        const mockProjects = [
            { _id: '1', name: 'My First Project', description: 'Getting started' },
            { _id: '2', name: 'Website Redesign', description: 'Client project' }
        ];
        
        const mockTasks = [
            { _id: '1', title: 'Plan project', status: 'done', project: { name: 'My First Project' } },
            { _id: '2', title: 'Design homepage', status: 'in-progress', project: { name: 'Website Redesign' } }
        ];
        
        response.render('dashboard', {
            title: 'Dashboard',
            user: request.session.user,  // User from session
            projects: mockProjects,
            tasks: mockTasks,
            error: null
        });
    } catch (error) {
        response.render('dashboard', {
            title: 'Dashboard',
            user: request.session.user,
            projects: [],
            tasks: [],
            error: 'Failed to load dashboard'
        });
    }
});

// ========== AUTH ACTIONS ==========

// Logout
router.get('/logout', (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        response.redirect('/login?success=Logged out successfully');
    });
});

module.exports = router;