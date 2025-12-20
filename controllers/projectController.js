const Project = require('../models/Project');
const User = require('../models/User');

// creating a new project
const createProject = async function (request, response, next) {

    try {
        const { name, description } = request.body;

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
        const project = await Project.findById(request.params.projectId)
            .populate('createdBy', 'username email')
            .populate('members', 'username email');

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
        let project = await Project.findById(request.params.projectId);

        // check if user is the project creator
        if (!project.createdBy.equals(request.user.id)) {
            return response.status(403).json({
                success: false,
                message: "Not authorized to update this project"
            });
        }

        // update project
        project = await Project.findByIdAndUpdate(
            request.params.projectId,
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
// adding a member to a project
const addProjectMember = async function (request, response, next) {

    try {
        const { userId } = request.body;
        const project = await Project.findById(request.params.projectId);

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
// get project members
const getProjectMembers = async function (request, response, next) {
    try {
        const project = await Project.findById(request.params.projectId)
            .populate('createdBy', 'username email')
            .populate('members', 'username email');

        // check if user has access to this project
        const hasAccess = project.createdBy._id.equals(request.user.id) ||
            project.members.some(member => member._id.equals(request.user.id));

        if (!hasAccess) {
            return response.status(403).json({
                success: false,
                message: "Not authorized to access this project"
            });
        }

        // Filter out owner from members array
        const teamMembers = project.members.filter(member => 
            !member._id.equals(project.createdBy._id)
        );

        response.json({
            success: true,
            count: teamMembers.length,
            data: teamMembers
        });

    } catch (error) {
        console.error(error);
        next();
    }
}

// transfer project ownership
const transferProjectOwnership = async function (request, response) {
    try {
        const { projectId } = request.params;
        const { newOwnerId } = request.body;
        
        console.log('Transfer ownership:', { projectId, newOwnerId, currentOwnerId: request.user.id });
        
        // Find the project with populated members
        const project = await Project.findById(projectId)
            .populate('members', '_id');
        
        if (!project) {
            return response.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        // Verify current user is the owner
        if (project.createdBy.toString() !== request.user.id) {
            return response.status(403).json({
                success: false,
                message: 'Only project owner can transfer ownership'
            });
        }
        
        // Check if new owner is a team member (not the current owner)
        // Filter out owner first to get real team members
        const teamMembers = project.members.filter(member => 
            !member._id.equals(project.createdBy)
        );
        
        const isTeamMember = teamMembers.some(member => 
            member._id.toString() === newOwnerId
        );
        
        if (!isTeamMember) {
            return response.status(400).json({
                success: false,
                message: 'New owner must be a project team member'
            });
        }
        
        // Check if new owner is the same as current owner
        if (newOwnerId === request.user.id) {
            return response.status(400).json({
                success: false,
                message: 'You already own this project'
            });
        }
        
        // Store old owner ID
        const oldOwnerId = project.createdBy;
        
        // Set new owner
        project.createdBy = newOwnerId;
        
        // Remove new owner from members array (they're now the owner)
        project.members = project.members.pull(newOwnerId);        
        
        // Add old owner to members array (they're now a regular member)
        // First check if old owner is already in members (shouldn't be)
        const isOldOwnerInMembers = project.members.some(memberId => 
            memberId.equals(oldOwnerId)
        );
        
        if (!isOldOwnerInMembers) {
            project.members.push(oldOwnerId);
        }
        
        await project.save();
        
        console.log('Ownership transferred successfully');
        
        response.json({
            success: true,
            message: 'Project ownership transferred successfully'
        });
        
    } catch (error) {
        console.error('Transfer ownership error:', error);
        response.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// removing a member from a project
const removeProjectMember = async function (request, response) {
    try {
        const { projectId, userId } = request.params;            
        
        // Find the project
        const project = await Project.findById(projectId);
        
        if (!project) {
            return response.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        // Check if user is the project owner
        if (project.createdBy.toString() === userId) {
            return response.status(400).json({
                success: false,
                message: 'Cannot remove project owner. Transfer ownership first.'
            });
        }
        
        // Check if the user is even a member of the project
        const isMember = project.members.some(memberId => 
            memberId.toString() === userId
        );
        
        if (!isMember) {
            return response.status(400).json({
                success: false,
                message: 'User is not a member of this project'
            });
        }
        
        // ✅ Check if user is assigned to any tasks in this project
        const Task = require('../models/Task');
        const assignedTasksCount = await Task.countDocuments({
            project: projectId,
            assignedTo: userId
        });
        
        if (assignedTasksCount > 0) {
            return response.status(400).json({
                success: false,
                message: `Cannot remove member. ${assignedTasksCount} task(s) are assigned to this user. Please unassign or reassign the tasks first.`
            });
        }
        
        // Remove the member from the project
        project.members = project.members.filter(
            memberId => memberId.toString() !== userId
        );
        
        await project.save();
        
        response.json({
            success: true,
            message: 'Member removed successfully'
        });
        
    } catch (error) {
        console.error('Remove member error:', error);
        response.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// delete project
const deleteProject = async function (request, response, next) {

    try {
        const project = await Project.findById(request.params.projectId);

        // check if user is the project creator
        if (!project.createdBy.equals(request.user.id)) {
            return response.status(403).json({
                success: false,
                message: "Not authorized to delete this project"
            });
        }

        // delete the project
        await Project.findByIdAndDelete(request.params.projectId);

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
    transferProjectOwnership,
    removeProjectMember,
    deleteProject
}