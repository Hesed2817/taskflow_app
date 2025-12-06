const Project = require('../models/Project');
const User = require('../models/User');

// creating a new project
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
        await project.populate('createdBy', 'username email');

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

// adding a member to a project
const addProjectMember = async function (request, response, next) {

    try {
        const { userId } = request.body;

        if (!userId) {
            return response.status(400).json({
                success: false,
                message: 'Please provide a user ID'
            });
        }

        const project = await Project.findById(request.params.id);

        if (!project) {
            return response.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // checking if user is the project's creator
        if (!project.createdBy.equals(request.user.id)) {
            return response.status(403).json({
                success: false,
                message: 'Only project creators can add members'
            });
        }

        const userToAdd = await User.findById(userId);
        if (!userToAdd) {
            return response.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // checking if user is already a member
        const isAlreadyMember = project.members.some(memberId => memberId.equals(userId)) || project.createdBy.equals(userId);
        if (isAlreadyMember) {
            return response.status(400).json({
                success: false,
                message: 'User is already a project member'
            });
        }

        // Adding the user to the project
        project.members.push(userId);
        await project.save();

        await project.populate('members', 'name email');

        response.json({
            success: true,            
            message: 'Member added successfully',
            data: project
        });

    } catch (error) {
        console.error(error);
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
            .populate('createdBy', 'username email')
            .populate('members', 'username email')
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
            .populate('createdBy', 'username email')
            .populate('members', 'username email');

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
        ).populate('createdBy', 'username email')
            .populate('members', 'username email')

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

// get project members
const getProjectMembers = async function (request, response, next){
    try {
        const project = await Project.findById(request.params.id)
        .populate('createdBy', 'name email')
        .populate('members', 'name email');

        if (!project) {
            return response.status(404).json({
                success: false,
                message: 'Project not found'
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
            count: project.members.length,
            data: project.members
        })

    } catch (error){
        console.error(error);
        next();
    }
}

// removing a member from a project
const removeProjectMember = async function (request, response, next) {
    try {
        const project = await Project.findById(request.params.id);
        const { userId } = request.params;
        
        if (!project) {
            return response.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }


        if (!project.createdBy.equals(request.user.id)) {
            return response.status(403).json({
                success: false,
                message: 'Only project creators can remove members'
            });
        }

        if (project.createdBy.equals(userId)) {
            return response.status(400).json({
                success: false,
                message: 'Cannot remove project creator'
            });
        }

        if (!project.members.includes(userId)) {
            return response.status(400).json({
                success: false,
                message: 'Member not found'
            });
        }

        // removing user from members
        project.members = project.members.pull(userId);

        await project.save();
        await project.populate('members', 'name email');

        response.json({
            success: true,
            message: 'Member removed successfully',
            data: project
        });

    } catch (error) {
        console.error(error);
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
    addProjectMember,
    getProjects,
    getProject,
    getProjectMembers,
    updateProject,
    removeProjectMember,
    deleteProject
}