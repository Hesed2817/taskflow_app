require('dotenv').config();
const express = require('express');
const session = require('express-session')
const path = require('path')
const cookie = require('cookie-parser')
const mongoose = require('mongoose')

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

// session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUnitialized: false,
    cookie: {
        secure: false, // set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// static files 
app.use(express.static(path.join(__dirname, 'public')));

// ejs configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// page routes
app.use('/', require('./routes/pages'));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/globalTasks'));
app.use('/api/users', require('./routes/users'));

// app.use(errorHandler);

app.use((request, response) => {
    response.send("Error 404 - Path not found. Try contacting the genius :)");
});