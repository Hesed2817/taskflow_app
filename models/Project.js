const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a project name"],
        trim: true,
        maxlength: [100, "Project name cannot be more than 100 characters"]
    },
    description: {
        type: String,
        maxlength: [500, "Project name cannot be more than 500 characters"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
}, {
    timestamps: true,
    collection: 'projects'
});

module.exports = mongoose.model('Project', projectSchema);