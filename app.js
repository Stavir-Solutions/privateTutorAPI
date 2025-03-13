const express = require('express');
require('dotenv').config();

const teacherRoutes = require('./src/main/routes/teacher');
const batchRoutes = require('./src/main/routes/batch');
const studentRoutes = require('./src/main/routes/student');
const messageRoutes = require('./src/main/routes/message');
const feeRecords = require('./src/main/routes/feeRecord');
const assignments = require('./src/main/routes/assignment');
const login = require('./src/main/routes/login');
const uploads = require('./src/main/routes/upload');
const notes = require('./src/main/routes/notes');
const test = require('./src/main/routes/test');
const testResult =require('./src/main/routes/testResult');
const notifications = require('./src/main/routes/notification');
const signup = require('./src/main/routes/signup');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { required } = require('joi');

const app = express();

const swaggerOptions = {
    definition: {
        openapi: '3.0.0', info: {
            title: 'Private Teacher API', version: '1.0.0', description: 'API documentation for the Teacher API',
        },
    }, apis: ['./routes/teacher.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serveWithOptions({redirect: false}), swaggerUi.setup(swaggerDocs));
app.use('/teachers', teacherRoutes);
app.use('/batches', batchRoutes);
app.use('/students', studentRoutes);
app.use('/messages', messageRoutes);
app.use('/fee-records', feeRecords);
app.use('/assignments', assignments);
app.use('/login', login)
app.use('/uploads', uploads)
app.use('/notes',notes)
app.use('/tests',test)
app.use('/test-results',testResult)
app.use('/notifications', notifications)
app.use('/signup', signup)
app.get('/', (req, res) => {
    res.send('{"name":"Private tutor apis"}');
});

module.exports = app;