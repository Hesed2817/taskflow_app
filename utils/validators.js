const { body, query, param, validationResult } = require('express-validator');

const validate = function (request, response, next) {
    const errors = validationResult(request);

    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = [];
    errors.array().map(error => extractedErrors.push({ [error.path]: error.msg }));

    // Check if it's a web request or API request
    if (!request.headers['content-type']?.includes('application/json') && !request.headers['accept']?.includes('application/json')) {
        const firstError = errors.array()[0].msg;
        const referer = request.get('Referer') || '/';
        const url = new URL(referer, `${request.protocol}://${request.get('host')}`);
        url.searchParams.set('error', firstError);
        return response.redirect(url.toString());
    }
    
    return response.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: extractedErrors,
    });
}

// auth validators
const registerValidator = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Username must be between 2-50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be atleast 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number')
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
];

// project validators
const projectValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Project name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Project name must be 3-100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Project description cannot exceed 500 characters'),
];

const projectIdValidator = [
    param('projectId')
        .notEmpty().withMessage('Projcet ID is required')
        .isMongoId().withMessage('Invalid project ID format')
];

const memberIdValidator = [
    param('userId')
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid user ID format')
];

const memberValidator = [
    body('userId')
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid user ID format'),
];

const transferOwnershipValidator = [
    body('newOwnerId')
        .notEmpty().withMessage('New owner ID is required')
        .isMongoId().withMessage('Invalid new owner ID format'),
];

// task validators
const taskValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Task title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),

    body('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

    body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status value'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),

    body('assignedTo')
        .optional({ values: 'falsy' })
        .isMongoId().withMessage('Invalid user ID format'),

    body('dueDate')
        .optional({ values: 'falsy' })
        .isISO8601().withMessage('Invalid date format (use ISO 8601)')
        .toDate()
];

const taskUpdateValidator = [

    body('title')
        .optional({ values: 'falsy' }) // ← Make title optional for updates
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),

    body('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

    body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status value'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),

    body('assignedTo')
        .optional({ values: 'falsy' })
        .isMongoId().withMessage('Invalid user ID format'),

    body('dueDate')
        .optional({ values: 'falsy' })
        .isISO8601().withMessage('Invalid date format (use ISO 8601)')
        .toDate()
];

const taskIdValidator = [
    param('taskId')
        .notEmpty().withMessage('Task ID is required')
        .isMongoId().withMessage('Invalid task ID format')
];

// user search validator
const userSearchValidator = [
    query('email')
        .optional()
        .trim()
        .isEmail().withMessage('Invalid email format'),

    query('username')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Username must be atleast 2 characters'),

    query('search')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('Search term must be atleast 2 characters'),

    function (request, response, next) {

        if (!request.query.email && !request.query.username && !request.query.search) {
            return response.status(400).json({
                success: false,
                message: 'Please provide email, username, or search term'
            });
        }
        next();
    }
];

const deleteUserValidator = [
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be atleast 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number')
]

// task filter validators
const taskFilterValidator = [
    query('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status value'),

    query('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),

    query('project')
        .optional()
        .isMongoId().withMessage('Invalid project ID format'),

    query('assignedTo')
        .optional()
        .isMongoId().withMessage('Invalid user ID format'),

    query('search')
        .optional()
        .trim()
        .escape()
];

module.exports = {
    registerValidator,
    loginValidator,
    projectValidator,
    projectIdValidator,
    transferOwnershipValidator,
    memberValidator,
    memberIdValidator,
    taskValidator,
    taskUpdateValidator,
    taskIdValidator,
    userSearchValidator,
    deleteUserValidator,
    taskFilterValidator,
    validate
}