const express = require('express');

const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const router = require('../routes/router');

const app = express();

// Settings

// eslint-disable-next-line global-require
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

// middlewars
app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(`${__dirname}/../public/`));
app.use(fileUpload());
app.use(cors());
app.use(helmet());
app.disable('x-powered-by');

// Routers
app.use(router);

module.exports = app;
