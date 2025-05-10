const express = require('express');
require('dotenv').config();
const serverless = require('serverless-http');
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
const testResult = require('./src/main/routes/testResult');
const notifications = require('./src/main/routes/notification');
const signup = require('./src/main/routes/signup');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const {required} = require('joi');

const index = express();

const swaggerOptions = {
    definition: {
        openapi: '3.0.0', info: {
            title: 'Private Teacher API', version: '1.0.0', description: 'API documentation for the Teacher API',
        },
    }, apis: ['./routes/teacher.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

index.use('/api-docs', swaggerUi.serveWithOptions({redirect: false}), swaggerUi.setup(swaggerDocs));
index.use('/teachers', teacherRoutes);
index.use('/batches', batchRoutes);
index.use('/students', studentRoutes);
index.use('/messages', messageRoutes);
index.use('/fee-records', feeRecords);
index.use('/assignments', assignments);
index.use('/login', login)
index.use('/uploads', uploads)
index.use('/notes', notes)
index.use('/tests', test)
index.use('/test-results', testResult)
index.use('/notifications', notifications)
index.use('/signup', signup)
index.get('/', (req, res) => {
    res.send('{"name":"Private tutor apis"}');
});

module.exports.handler = serverless(index);