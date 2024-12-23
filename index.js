const express = require('express');
const serverless = require('serverless-http');
const index = express();

index.get('/teachers', (req, res) => {
    res.send('{"name":"Santhosh"}');
});


index.get('/', (req, res) => {
    res.send('{"name":"Private tutor apis"}');
});


module.exports.handler = serverless(index);