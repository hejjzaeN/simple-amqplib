const { json } = require('express');
const express = require('express');
const registerOrder = require('./order-register');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(json());

app.post('/create-order', registerOrder);

app.listen(PORT, () => console.log('Server is up and running'));
