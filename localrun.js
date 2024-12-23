const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/teachers', (req, res) => {
    res.send('{"name":"Santhosh"}');
});


app.get('/', (req, res) => {
    res.send('{"name":"Private tutor apis"}');
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
