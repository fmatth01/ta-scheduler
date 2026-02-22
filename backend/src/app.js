/*
 * app.js
 * This file is used to initialize the backend
 * To add a new route file, add it to the routes folder and update the code
 * under the Routes section
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');


/* Initializing Express */
const app = express();
app.use(cors());
app.use(express.json());


/* Routes */
const ta_routes = require('./routes/ta');
const schedule_routes = require('./routes/schedule')

app.use('/schedule', schedule_routes)
app.use('/ta', ta_routes);
app.get('/', (req, res) => {
    res.json({ message: 'BACKEND is working!' });
});

module.exports = app;
