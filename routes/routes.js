
const { processor } = require('../processor');

const express = require('express');

const routes = express.Router();

routes.use('/objects-bot', routes);

routes.route('/create-object')
    .post(processor.processAppendObject);
routes.route('/append-object')
    .post(processor.processCreateObject);

module.exports = routes;
