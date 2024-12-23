const express = require('express');
const serverless = require('serverless-http');
const teacherRoutes = require('./routes/teacher');
const app = express();

app.use('/', teacherRoutes);


app.get('/', (req, res) => {
    res.send('{"name":"Private tutor apis"}');
});


module.exports.handler = serverless(app);