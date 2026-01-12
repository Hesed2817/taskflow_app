const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            minlength: 6,
            required: true,
            select: false
        }
    },
    {
        timestamps: true,
        collection: 'users'
    }
);

userSchema.pre('save', async function () {

    // skip hashing if the password was not modified
    if (!this.isModified('password')) {
        return;
    }

    try {
        this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
        console.error("Failed to hash password:", error);
    }


});

// user pre-delete hook
userSchema.pre('deleteOne', { document: true, query: false }, async function () {
    try {
        const mongoose = require('mongoose');
        const userId = this._id;
        const session = this.$session();

        // Delete all projects owned by this user (cascade delete will handle tasks)
        const Project = mongoose.model('Project');
        const ownedProjects = await Project.find({ createdBy: userId }, null, { session });

        // Delete each project (this triggers project's pre-delete hook)
        for (const project of ownedProjects) {
            await project.deleteOne({ session });
        }

        // Unassign all tasks assigned to this user (in projects they don't own)
        const Task = mongoose.model('Task');
        await Task.updateMany(
            { assignedTo: userId },
            { $unset: { assignedTo: "" } },
            { session }
        );

        // Remove user from all project member lists
        await Project.updateMany(
            { members: userId },
            { $pull: { members: userId } },
            { session }
        );

    } catch (error) {
        console.error('Error in user cascade delete:', error);
        throw error;
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', userSchema);