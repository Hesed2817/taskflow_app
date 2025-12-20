const Task = require('../models/Task');
const Project = require('../models/Project');

const getProjectTasks = async function (request, response, next) {
    try {
        const project = await Project.findById(request.params.projectId);

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
        const project = await Project.findById(request.params.projectId);
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
        const task = await Task.findById(request.params.taskId)
            .populate('project', 'name')
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

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
        console.log('Update Task - Params:', request.params);
        console.log('Update Task - Body:', request.body);
        console.log('Update Task - User ID:', request.user.id);

        // First find the task
        let task = await Task.findById(request.params.taskId);
        
        if (!task) {
            return response.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Find the project
        const project = await Project.findById(task.project);
        
        if (!project) {
            return response.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check access - project owner, task creator, or assigned user can update
        const isProjectOwner = project.createdBy.equals(request.user.id);
        const isTaskCreator = task.createdBy.equals(request.user.id);
        const isAssignedUser = task.assignedTo && task.assignedTo.equals(request.user.id);
        
        if (!isProjectOwner && !isTaskCreator && !isAssignedUser) {
            return response.status(403).json({
                success: false,
                message: 'Not authorized to update this task'
            });
        }

        // If assigning to someone, verify they're a project member
        if (request.body.assignedTo && request.body.assignedTo !== '') {
            const isMember = project.members.some(memberId => 
                memberId.equals(request.body.assignedTo) || 
                project.createdBy.equals(request.body.assignedTo)
            );

            if (!isMember && request.body.assignedTo !== null) {
                return response.status(400).json({
                    success: false,
                    message: 'Can only assign to project members'
                });
            }
        }

        // Prepare update data
        const updateData = { ...request.body };
        
        // Convert empty string to null for assignedTo
        if (updateData.assignedTo === '') {
            updateData.assignedTo = null;
        }
        
        // Format dueDate if provided
        if (updateData.dueDate) {
            updateData.dueDate = new Date(updateData.dueDate);
        }

        console.log('Update data:', updateData);

        // Update the task
        task = await Task.findByIdAndUpdate(
            request.params.taskId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        )
        .populate('project', 'name')
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email');

        response.json({
            success: true,
            data: task
        });

    } catch (error) {
        console.error('Update task error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return response.status(400).json({
                success: false,
                message: 'Validation error: ' + messages.join(', ')
            });
        }
        
        if (error.name === 'CastError') {
            return response.status(400).json({
                success: false,
                message: 'Invalid data format'
            });
        }
        
        response.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
}

const filterTasks = async function (request, response, next) {
    try {
        const { title, status, priority, project, assignedTo, search } = request.query;

        // getting user's accessible projects first
        const userProjects = await Project.find({
            $or: [
                { createdBy: request.user.id },
                { members: request.user.id }
            ]
        }).select('_id');

        const projectIds = userProjects.map(project => project._id);

        // if user has no projects, return empty
        if (projectIds.length === 0) {
            return response.json({
                success: true,
                count: 0,
                data: []
            });
        }

        let query = { project: { $in: projectIds } };

        if (status && ['todo', 'in-progress', 'done'].includes(status)) {
            query.status = status;
        }

        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            query.priority = priority;
        }

        if (project && mongoose.Types.ObjectId.isValid(project)) {
            if (projectIds.some(pid => pid.equals(project))) {
                query.project = project;
            }
        }

        if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
            query.assignedTo = assignedTo;
        }

        if (search && typeof search === 'string') {
            const safeSearch = search.trim().substring(0, 100);
            query.title = { $regex: safeSearch, $options: 'i' };
        }

        const tasks = await Task.find(query)
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);

        response.json({
            success: true,
            count: tasks.length,
            data: tasks
        });

    } catch (error) {
        console.error(error);
        next();
    }
}
const deleteTask = async function (request, response, next) {
    try {
        const task = await Task.findById(request.params.taskId);
        const project = await Project.findById(task.project);

        // Only project creator or task creator can delete
        const canDelete = project.createdBy.equals(request.user.id) || task.createdBy.equals(request.user.id);

        if (!canDelete) {
            return response.status(403).json({
                success: false,
                message: 'Not authorized to delete'
            });
        }

        await Task.findByIdAndDelete(request.params.taskId);

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
    deleteTask,
    filterTasks
};