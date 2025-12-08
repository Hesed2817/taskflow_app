const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route POST /api/auth/register

// logic for registering a new user
const registerUser = async function (request, response) {
    try {
        // extract the user input from the request body
        const { username, email, password } = request.body;

        // check if the user is not already registered
        const userExists = await User.findOne({ email });
        if (userExists) {
            return response.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // create a new user
        const user = await User.create({ username, email, password });

        // generate a token
        const token = generateToken(user._id);

        response.status(201).json({
            success: true,
            data: {
                _id: user.id,
                username: user.username,
                email: user.email,
                token: token
            }
        });
    } catch (error) {
        console.error('Failed to create user:', error);
    }
}

const loginUser = async function (request, response) {
    // logic for logging in a user
    try {
        const { email, password } = request.body;

        // check for the user and include the password (since select: false)
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {

            // generate a jwt token
            const token = generateToken(user._id);

            response.json({
                success: true,
                data: {
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                    token: token
                }
            });
        } else {
            response.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        console.error('Failed to create user:', error);
    }

}

module.exports = {
    registerUser,
    loginUser
};