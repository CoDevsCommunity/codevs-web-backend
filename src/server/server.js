const express = require('express');

const app = express();
const router = require('../routes/router');

// middlewars

// eslint-disable-next-line global-require
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

// Settings
app.set('port', process.env.PORT || 3000);
app.use(express.json());

// Routers
app.use(router);

module.exports = app;
