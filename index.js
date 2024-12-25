const express = require('express');
const serverless = require('serverless-http');
const teacherRoutes = require('./routes/teacher');
const batchRoutes = require('./routes/batch');
const studentRoutes = require('./routes/student');
const messageRoutes = require('./routes/message');
const feeRecords = require('./routes/feeRecord');
const assignments = require('./routes/assignment');
const login = require('./routes/login');
const uploads = require('./routes/upload');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

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

index.get('/', (req, res) => {
    res.send('{"name":"Private tutor apis"}');
});

module.exports.handler = serverless(index);