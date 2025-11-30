const mongoose = require('mongoose');
const express = require('express');
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

userSchema.pre('save', async function (){
    // conduct the hashing functionality
    
    // skip hashing if the password was not modified
    if (!this.isModified('password')){        
        return;
    }

    try {
        this.password = await bcrypt.hash(this.password, 10);                 
    } catch (error) {
        console.error("Failed to hash password:",error);        
    }


});

userSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', userSchema);