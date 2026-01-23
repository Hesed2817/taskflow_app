const homePage = function (request, response) {
    // checking if the user is logged in with token
    if (request.cookies.auth_token) {
        return response.redirect('/dashboard');
    }
    response.redirect('/login');
}

const login = function (request, response) {
    if (request.cookies.auth_token) {
        return response.redirect('/dashboard');
    }

    response.render('auth/login', {
        title: 'Login',
        user: null,
        error: request.query.error || null,
        success: request.query.success || null,
        cssFile: 'auth'
    });
}

const register = function (request, response) {
    if (request.cookies.auth_token) {
        return response.redirect('/dashboard');
    }

    response.render('auth/register', {
        title: 'Register',
        user: null,
        error: request.query.error || null,
        success: request.query.success || null,
        cssFile: 'auth'
    });
}

const dashboard = async function (request, response) {
    try {
        const Project = require('../models/Project');
        const Task = require('../models/Task');

        // Get user's projects (real data from database)
        const projects = await Project.find({
            $or: [
                { createdBy: request.user.id },
                { members: request.user.id }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent tasks from user's projects
        const tasks = await Task.find({
            project: { $in: projects.map(p => p._id) }
        })
            .populate('project', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Render dashboard with REAL data
        response.render('dashboard', {
            title: 'Dashboard',
            cssFile: 'dashboard',
            user: request.user,
            projects: projects,
            tasks: tasks,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        response.render('dashboard', {
            title: 'Dashboard',
            user: request.user,
            projects: [],
            tasks: [],
            error: 'Failed to load dashboard data'
        });
    }
}

const search = async function (request, response) {
    try {
        const Project = require('../models/Project');
        const Task = require('../models/Task');
        const { q: searchQuery } = request.query; // Use 'q' for query parameter

        let projects = [];
        let tasks = [];
        let hasResults = false;

        // Only search if query is provided
        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.trim();
            const searchRegex = new RegExp(query, 'i');

            // Search projects
            projects = await Project.find({
                $or: [
                    { createdBy: request.user.id },
                    { members: request.user.id }
                ],
                $or: [
                    { name: searchRegex },
                    { description: searchRegex }
                ]
            })
                .populate('createdBy', 'username')
                .sort({ createdAt: -1 })
                .limit(10);

            // Search tasks
            // First get projects user has access to
            const accessibleProjects = await Project.find({
                $or: [
                    { createdBy: request.user.id },
                    { members: request.user.id }
                ]
            }).distinct('_id');

            if (accessibleProjects.length > 0) {
                tasks = await Task.find({
                    project: { $in: accessibleProjects },
                    $or: [
                        { title: searchRegex },
                        { description: searchRegex }
                    ]
                })
                    .populate('project', 'name')
                    .populate('assignedTo', 'username')
                    .sort({ createdAt: -1 })
                    .limit(10);
            }

            hasResults = projects.length > 0 || tasks.length > 0;
        }

        response.render('search/index', {
            title: 'Search',
            cssFile: 'search',
            user: request.user,
            searchQuery: searchQuery || '',
            projects: projects,
            tasks: tasks,
            hasResults: hasResults,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Search error:', error);
        response.render('search/index', {
            title: 'Search',
            user: request.user,
            searchQuery: '',
            projects: [],
            tasks: [],
            hasResults: false,
            error: 'Search failed. Please try again.'
        });
    }
}

const getProjects = async function (request, response) {
    try {
        const Project = require('../models/Project');
        const Task = require('../models/Task');

        const projects = await Project.find({
            $or: [
                { createdBy: request.user.id },
                { members: request.user.id }
            ]
        })
            .populate('createdBy', 'username')
            .populate('members', 'username email')
            .sort({ createdAt: -1 });

        // Get all tasks for these projects to pass to the view
        const tasks = await Task.find({
            project: { $in: projects.map(p => p._id) }
        });

        response.render('projects/list', {
            title: 'My Projects',
            cssFile: 'projects',
            user: request.user,
            projects: projects,
            tasks: tasks,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Projects list error:', error);
        response.render('projects/list', {
            title: 'My Projects',
            user: request.user,
            projects: [],
            error: 'Failed to load projects'
        });
    }
}

const createProject = function (request, response) {
    response.render('projects/create', {
        title: 'Create Project',
        cssFile: 'projects',
        user: request.user,
        error: request.query.error || null,
        success: request.query.success || null
    });
}

const getProject = async function (request, response) {
    try {
        const Project = require('../models/Project');
        const Task = require('../models/Task');

        const project = await Project.findById(request.params.id)
            .populate('createdBy', 'username email')
            .populate('members', 'username email');

        if (!project) {
            return response.redirect('/projects?error=Project not found');
        }

        // Check if user has access
        const isOwner = project.createdBy && project.createdBy._id && project.createdBy._id.toString() === request.user.id;
        const isMember = project.members.some(member =>
            member._id && member._id.toString() === request.user.id
        );

        if (!isOwner && !isMember) {
            return response.redirect('/projects?error=You do not have access to this project');
        }

        // Get project tasks
        const tasks = await Task.find({ project: request.params.id })
            .populate('assignedTo', 'username')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        response.render('projects/detail', {
            title: project.name,
            cssFile: 'projects',
            user: request.user,
            project: project,
            tasks: tasks,
            isOwner: isOwner,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Project detail error:', error);
        response.redirect('/projects?error=Failed to load project');
    }
}

const editProject = async function (request, response) {
    try {
        const Project = require('../models/Project');

        const project = await Project.findById(request.params.id);

        if (!project) {
            return response.redirect('/projects?error=Project not found');
        }

        // Check if user is the owner
        if (project.createdBy.toString() !== request.user.id) {
            return response.redirect('/projects/' + request.params.id + '?error=Only project owner can edit');
        }

        response.render('projects/edit', {
            title: 'Edit Project: ' + project.name,
            cssFile: 'projects',
            user: request.user,
            project: project,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Project edit error:', error);
        res.redirect('/projects?error=Failed to load project');
    }
}

const projectSettings = async function (request, response) {
    try {
        const Project = require('../models/Project');

        const project = await Project.findById(request.params.id)
            .populate('createdBy', 'username email')
            .populate('members', 'username email');

        if (!project) {
            return response.redirect('/projects?error=Project not found');
        }

        // Check if user is the owner
        if (project.createdBy._id.toString() !== request.user.id) {
            return response.redirect(`/projects/${request.params.id}?error=Only project owner can access settings`);
        }

        response.render('projects/settings', {
            title: `Settings - ${project.name}`,
            user: request.user,
            cssFile: 'projects',
            project: project,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Project settings error:', error);
        response.redirect(`/projects/${request.params.id}?error=Failed to load settings`);
    }
}

const getTasks = async function (request, response) {
    try {
        const Task = require('../models/Task');
        const Project = require('../models/Project');

        // Get all projects for filter dropdown
        const projects = await Project.find({
            $or: [
                { createdBy: request.user.id },
                { members: request.user.id }
            ]
        }).select('name _id');

        // Build filter query - get project IDs user has access to
        const accessibleProjects = await Project.find({
            $or: [
                { createdBy: request.user.id },
                { members: request.user.id }
            ]
        }).distinct('_id');

        // Build filter query
        const filter = { project: { $in: accessibleProjects } };

        // Apply filters from query params
        if (request.query.status && request.query.status !== '') {
            filter.status = request.query.status;
        }

        if (request.query.priority && request.query.priority !== '') {
            filter.priority = request.query.priority;
        }

        if (request.query.project && request.query.project !== '') {
            filter.project = request.query.project;
        }

        if (request.query.assignedTo === 'me') {
            filter.assignedTo = request.user.id;
        } else if (request.query.assignedTo === 'unassigned') {
            filter.assignedTo = null;
        }

        // Get tasks with filters - fix the population
        const tasks = await Task.find(filter)
            .populate({
                path: 'project',
                select: 'name createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'username _id'
                }
            })
            .populate('assignedTo', 'username _id')
            .populate('createdBy', 'username _id')
            .sort({ createdAt: -1 });

        response.render('tasks/index', {
            title: 'All Tasks',
            cssFile: 'tasks',
            user: request.user,
            tasks: tasks,
            projects: projects,
            filters: request.query,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Tasks page error:', error);
        response.render('tasks/index', {
            title: 'All Tasks',
            user: request.user,
            tasks: [],
            projects: [],
            filters: request.query,
            error: 'Failed to load tasks: ' + error.message
        });
    }
}

const getTask = async function (request, response) {
    try {
        const Task = require('../models/Task');
        const Project = require('../models/Project');

        const task = await Task.findById(request.params.id)
            .populate('project', 'name createdBy members')
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username');

        if (!task) {
            return response.redirect('/tasks?error=Task not found');
        }

        // Check if user has access to this task's project
        const project = await Project.findById(task.project._id);
        const isOwner = project.createdBy.toString() === request.user.id;
        const isMember = project.members.some(member =>
            member.toString() === request.user.id
        );

        if (!isOwner && !isMember) {
            return response.redirect('/tasks?error=You do not have access to this task');
        }

        response.render('tasks/detail', {
            title: task.title,
            cssFile: 'tasks',
            user: request.user,
            task: task,
            isOwner: isOwner || task.createdBy._id.toString() === request.user.id,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Task detail error:', error);
        response.redirect('/tasks?error=Failed to load task');
    }
}

const editTask = async function (request, response) {
    try {
        const Task = require('../models/Task');
        const Project = require('../models/Project');

        const task = await Task.findById(request.params.id)
            .populate('project', 'name createdBy members')
            .populate('assignedTo', 'username')
            .populate('createdBy', 'username');

        if (!task) {
            return response.redirect('/tasks?error=Task not found');
        }

        // Get project details
        const project = await Project.findById(task.project._id)
            .populate('createdBy', 'username')
            .populate('members', 'username');

        // Check access
        const isOwner = project.createdBy._id.toString() === request.user.id;
        const isMember = project.members.some(member =>
            member._id.toString() === request.user.id
        );

        if (!isOwner && !isMember && task.createdBy._id.toString() !== request.user.id) {
            return response.redirect(`/tasks/${task._id}?error=You don't have permission to edit this task`);
        }

        // Get all members for assignee dropdown
        const allMembers = [
            { _id: project.createdBy._id, username: project.createdBy.username, isOwner: true },
            ...project.members.map(member => ({
                _id: member._id,
                username: member.username,
                isOwner: false
            }))
        ];

        response.render('tasks/edit', {
            title: `Edit: ${task.title}`,
            cssFile: 'tasks',
            user: request.user,
            task: task,
            allMembers: allMembers,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Task edit page error:', error);
        response.redirect('/tasks?error=Failed to load task');
    }
}

const getProjectTasks = async function (request, response) {
    try {
        const Project = require('../models/Project');
        const Task = require('../models/Task');

        // Get the project
        const project = await Project.findById(request.params.id)
            .populate('createdBy', 'username')
            .populate('members', 'username email');

        if (!project) {
            return response.redirect('/projects?error=Project not found');
        }

        // Check if user has access
        const isOwner = project.createdBy._id.toString() === request.user.id;
        const isMember = project.members.some(member =>
            member._id.toString() === request.user.id
        );

        if (!isOwner && !isMember) {
            return response.redirect('/projects?error=You do not have access to this project');
        }

        // Get all tasks for this project with filters
        const filter = { project: request.params.id };

        // Apply filters from query params
        if (request.query.status && request.query.status !== '') {
            filter.status = request.query.status;
        }

        if (request.query.priority && request.query.priority !== '') {
            filter.priority = request.query.priority;
        }

        if (request.query.assignedTo === 'me') {
            filter.assignedTo = request.user.id;
        } else if (request.query.assignedTo === 'unassigned') {
            filter.assignedTo = null;
        } else if (request.query.assignedTo && request.query.assignedTo !== '') {
            filter.assignedTo = request.query.assignedTo;
        }

        // Get tasks
        const tasks = await Task.find(filter)
            .populate('assignedTo', 'username')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        // Get all members for assignee filter
        const allMembers = [
            { _id: project.createdBy._id, username: project.createdBy.username, isOwner: true },
            ...project.members.map(member => ({
                _id: member._id,
                username: member.username,
                isOwner: false
            }))
        ];

        // Get task statistics
        const totalTasks = tasks.length;
        const todoTasks = tasks.filter(t => t.status === 'todo').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
        const doneTasks = tasks.filter(t => t.status === 'done').length;

        response.render('projects/tasks', {
            title: `Tasks - ${project.name}`,
            cssFile: 'projects',
            user: request.user,
            project: project,
            tasks: tasks,
            allMembers: allMembers,
            totalTasks: totalTasks,
            todoTasks: todoTasks,
            inProgressTasks: inProgressTasks,
            doneTasks: doneTasks,
            isOwner: isOwner,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Project tasks page error:', error);
        response.redirect(`/projects/${request.params.id}?error=Failed to load tasks`);
    }
}

const profile = async function (request, response) {
    try {
        const Project = require('../models/Project');
        const Task = require('../models/Task');

        // Get user statistics
        const projectsCount = await Project.countDocuments({
            $or: [
                { createdBy: request.user.id },
                { members: request.user.id }
            ]
        });

        const tasksCount = await Task.countDocuments({
            project: {
                $in: await Project.find({
                    $or: [
                        { createdBy: request.user.id },
                        { members: request.user.id }
                    ]
                }).distinct('_id')
            }
        });

        const tasksAssignedCount = await Task.countDocuments({
            assignedTo: request.user.id
        });

        response.render('profile/index', {
            title: 'My Profile',
            cssFile: 'profile',
            user: request.user,
            projectsCount: projectsCount,
            tasksCount: tasksCount,
            tasksAssignedCount: tasksAssignedCount,
            error: request.query.error || null,
            success: request.query.success || null
        });

    } catch (error) {
        console.error('Profile page error:', error);
        response.render('profile/index', {
            title: 'My Profile',
            user: request.user,
            projectsCount: 0,
            tasksCount: 0,
            tasksAssignedCount: 0,
            error: 'Failed to load profile data'
        });
    }
}

const editProfile = function (request, response) {
    response.render('profile/edit', {
        title: 'Edit Profile',
        cssFile: 'profile',
        user: request.user,
        error: request.query.error || null,
        success: request.query.success || null
    });
}

const changePassword = function (request, response) {
    response.render('profile/change-password', {
        title: 'Change Password',
        cssFile: 'profile',
        user: request.user,
        error: request.query.error || null,
        success: request.query.success || null
    });
}

const logout = function (request, response) {

    // clear the cookie
    response.clearCookie('auth_token');

    // if it is an API call
    if (request.headers['content-type']?.includes('application/json')) {
        return response.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    // else if it is a web request
    response.redirect('/login?success=Logged out successfully');

}

module.exports = {
    homePage,
    login,
    register,
    dashboard,
    search,
    getProjects,
    createProject,
    getProject,
    editProject,
    projectSettings,
    getTasks,
    getTask,
    editTask,
    getProjectTasks,
    profile,
    editProfile,
    changePassword,
    logout
};