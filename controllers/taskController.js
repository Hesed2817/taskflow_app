const Task = require('../models/Task');
const Project = require('../models/Project');

const getProjectTasks = async function (request, response, next) {
    try {
        const project = await Project.findById(request.params.projectId);

        if (!project) {
            return response.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // check access
        const hasAccess = project.createdBy.equals(request.user.id) || project.members.some(memberId => memberId.equals(request.user.id));

        if (!hasAccess) {
            return response.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const tasks = await Task.find({ project: request.params.projectId })
            .populate('project', 'name')
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        response.json({
            success: true,
            count: tasks.length,
            data: tasks
        });

    } catch (error) {
        console.error('Failed to get tasks:', error);
        next();
    }
}

const createTask = async function (request, response, next) {
    try {
        const { title, description, assignedTo, dueDate, status, priority } = request.body;

        if (!title) {
            return response.status(400).json({
                success: false,
                message: 'Please add a task title'
            });
        }

        const project = await Project.findById(request.params.projectId);

        if (!project) {
            return response.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const hasAccess = project.createdBy.equals(request.user.id) || project.members.some(memberId => memberId.equals(request.user.id));

        if (!hasAccess) {
            return response.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // check assignedTo is a project member if provided
        if (assignedTo) {
            const isMember = project.members.some(memberId => memberId.equals(assignedTo) || project.createdBy.equals(assignedTo));

            if (!isMember) {
                return response.status(400).json({
                    success: false,
                    message: 'Can only assign to project members'
                });
            }
        }

        const task = await Task.create({
            title,
            description,
            project: request.params.projectId,
            assignedTo,
            createdBy: request.user.id,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate) : undefined
        });

        await task.populate('assignedTo', 'username email');
        await task.populate('createdBy', 'username email');

        response.status(201).json({
            success: true,
            data: task
        });

    } catch (error) {
        console.error('Failed to create task:', error);
        next();
    }
}

const getTask = async function (request, response, next) {
    try {
        const task = await Task.findById(request.params.id)
            .populate('project', 'name')
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        if (!task) {
            return response.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const project = await Project.findById(task.project);
        const hasAccess = project.createdBy.equals(request.user.id) || project.members.some(memberId => memberId.equals(request.user.id));

        if (!hasAccess) {
            return response.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        response.json({
            success: true,
            data: task
        });

    } catch (error) {
        console.error('Failed to get task.', error);
        next();
    }
}

const updateTask = async function (request, response, next) {
    try {
        let task = await Task.findById(request.params.id);

        if (!task) {
            return response.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const project = await Project.findById(task.project);
        const hasAccess = project.createdBy.equals(request.user.id) || project.members.some(memberId => memberId.equals(request.user.id));

        if (!hasAccess) {
            return response.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // updating the task
        task = await Task.findByIdAndUpdate(
            request.params.id,
            request.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('project', 'name')
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        response.json({
            success: true,
            data: task
        });

    } catch (error) {
        console.error('Failed to create task:', error);
        next();
    }
}

const deleteTask = async function (request, response, next) {
    try {
        const task = await Task.findById(request.params.id);

        if (!task) {
            return response.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const project = await Project.findById(task.project);

        // Only projecct creator or task creator can delete
        const canDelete = project.createdBy.equals(request.user.id) || task.createdBy.equals(request.user.id);

        if (!canDelete) {
            return response.status(403).json({
                success: false,
                message: 'Not authorized to delete'
            });
        }

        await Task.findByIdAndDelete(request.params.id);

        response.json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Failed to create task:', error.message);
        next();
    }
}

module.exports = {
    getProjectTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask
};