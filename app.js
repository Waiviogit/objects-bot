const express = require('express');
const logger = require('morgan');
const { routes } = require('./routes');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', routes);

module.exports = app;
