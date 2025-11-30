const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route POST /api/auth/register

// logic for registering a new user
const registerUser = async function (request, response) {
    try {
        // extract the user input from the request body
        const { username, email, password } = request.body;

        // validate the user input
        if (!username || !email || !password) {
            return response.status(400).json({
                success: false,
                message: 'Please fill all the fields'
            });
        }

        if (password.length < 6) {
            return response.status(400).json({
                success: false,
                message: 'Password must be atleast 6 characters'
            });
        }

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

        // validating user input
        if (!email || !password) {
            return response.status(400).json({
                success: false,
                message: 'Please add an email and password'
            });
        }

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

//@route GET /api/auth/me

// to be used for testing
const getMe = async function (request, response) {
    try {
        // get the user data using the authenticated user's creds (request.user._id)
        const user = await User.findById(request.user._id);

        // send the personalized data
        response.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    registerUser,
    loginUser,
    getMe
};