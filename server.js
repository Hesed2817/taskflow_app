require('dotenv').config();
const express = require('express');
const session = require('express-session')
const path = require('path')
const cookieParser = require('cookie-parser')
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
app.use(cookieParser());

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

app.use((request, response) => {
    response.status(404).render('404', {
        title: 'Page Not Found',
        user: request.user || null,
        cssFile: '404'
    });
});