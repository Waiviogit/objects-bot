
const { processor } = require('../processor');

const express = require('express');

const routes = express.Router();

routes.use('/objects-bot', routes);

routes.route('/append-object')
    .post(processor.processAppendObject);

module.exports = routes;
