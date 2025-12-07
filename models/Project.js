const Task = require('./Task');
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

projectSchema.pre('deleteOne', { document: true, query: false}, async function (next){
    try{
        const projectId = this._id;

        await Task.deleteMany({ project: projectId });
        console.log('successfully deleted associated tasks');

    } catch (error){
        console.error('Error cascade deleting tasks', error);
        next();
    }
})

module.exports = mongoose.model('Project', projectSchema);