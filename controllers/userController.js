const User = require('../models/User');

const searchUsers = async function (request, response, next) {
    try {
        const { email, username } = request.query;

        if (!email && !username) {
            return response.status(400).json({
                success: false,
                message: 'Please provide an email or username to search'
            });
        }

        let query = {};

        if (email) {
            query.email = { $regex: email, $options: 'i' }; // case insensitive search
        }

        if (username) {
            query.username = { $regex: username, $options: 'i' };
        }

        // removing current user from results
        query._id = { $ne: request.user.id };

        const users = await User.find(query)
            .select('_id username email')
            .limit(10);

        response.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error(error);
        next();
    }
}

const getMe = async function (request, response, next) {
    try {
        const user = await User.findById(request.user.id).select('-password');

        response.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error(error);
        next();
    }
}

module.exports = {
    searchUsers, getMe
};