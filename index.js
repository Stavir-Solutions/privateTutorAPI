const express = require('express');
const serverless = require('serverless-http');
const teacherRoutes = require('./routes/teacher');
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

index.use('/api-docs', swaggerUi.serveWithOptions({ redirect: false }), swaggerUi.setup(swaggerDocs));
index.use('/', teacherRoutes);

index.get('/', (req, res) => {
    res.send('{"name":"Private tutor apis"}');
});

module.exports.handler = serverless(index);