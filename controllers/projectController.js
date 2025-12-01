const Project = require('../models/Project');

// route for creating a new project
const createProject = async function (request, response, next) {

    try {
        const { name, description } = request.body;

        // validation
        if (!name) {
            return response.status(400).json({
                success: false,
                message: "Please add a project name"
            });
        }

        // create project
        const project = await Project.create({
            name,
            description,
            createdBy: request.user.id,
            members: [request.user.id]
        });

        // populate the createdBy field to return user details
        await project.populate('createdBy', 'name email');

        response.status(201).json({
            success: true,
            data: project
        });

        next();

    } catch (error) {
        console.error('Failed to create project:', error);
        next();
    }
}

// get all projects for the logged in user
const getProjects = async function (request, response, next) {

    try {
        // get projects where user is creator OR member
        const projects = await Project.find({
            $or: [
                { createdBy: request.user.id },
                { members: request.user.id }
            ]
        })
            .populate('createdBy', 'name email')
            .populate('members', 'name email')
            .sort({ createdAt: -1 }); // newest first

        response.json({
            success: true,
            count: projects.length,
            data: projects
        });

        next();

    } catch (error) {
        console.error('Failed to get projects:', error);
        next();
    }
}

// get a single project 
const getProject = async function (request, response, next) {

    try {
        const project = await Project.findById(request.params.id)
            .populate('createdBy', 'name email')
            .populate('members', 'name email');

        if (!project) {
            return response.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // check if user has access to this project
        const hasAccess = project.createdBy._id.equals(request.user.id) ||
            project.members.some(member => member._id.equals(request.user.id));

        if (!hasAccess) {
            return response.status(403).json({
                success: false,
                message: "Not authorized to access this project"
            });
        }

        response.json({
            success: true,
            data: project
        });

        next();

    } catch (error) {
        console.error('Failed to get project:', error);
        next();
    }
}

// update a project
const updateProject = async function (request, response, next) {

    try {
        let project = await Project.findById(request.params.id);

        if (!project) {
            return response.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // check if user is the project creator
        if (!project.createdBy.equals(request.user.id)) {
            return response.status(403).json({
                success: false,
                message: "Not authorized to update this project"
            });
        }

        // update project
        project = await Project.findByIdAndUpdate(
            request.params.id,
            request.body,
            {
                new: true,  // return updated document
                runValidators: true
            }
        ).populate('createdBy', 'name email')
            .populate('members', 'name email')

        response.json({
            success: true,
            data: project
        });

        next();

    } catch (error) {
        console.error('Failed to update project:', error);
        next();
    }
}

// delete project
const deleteProject = async function (request, response, next) {

    try {
        const project = await Project.findById(request.params.id);

        if (!project) {
            return response.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // check if user is the project creator
        if (!project.createdBy.equals(request.user.id)) {
            return response.status(403).json({
                success: false,
                message: "Not authorized to delete this project"
            });
        }

        // delete the project
        await Project.findByIdAndDelete(request.params.id);

        response.json({
            success: true,
            message: "Project deleted successfully"
        });

        next();

    } catch (error) {
        console.error('Failed to delete project:', error);
        next();
    }
}

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
}