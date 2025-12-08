require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI;


mongoose.connect(dbURI)
    .then(() => {
        require('./models/User');
        require('./models/Project');

        app.listen(PORT, () => {
            console.log(`Listening on http://localhost:${PORT}`);
        });
    })
    .catch((error) => console.error('Failed to connect to database: ', error));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// routes
app.use('/auth', require('./routes/auth'));
app.use('/projects', require('./routes/projects'));
app.use('/tasks', require('./routes/globalTasks'));
app.use('/users', require('./routes/users'));
app.use((request, response) => {
    response.send("Error 404 - Path not found. Try contacting the genius :)");
});