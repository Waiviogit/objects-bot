const express = require('express');
const { guestRequests, forecast, object } = require('controllers');


const routes = express.Router();

routes.use('/objects-bot', routes);

routes.route('/create-object-type').post(object.processCreateObjectType);
routes.route('/create-object').post(object.processCreateObject);
routes.route('/append-object').post(object.processAppendObject);
routes.route('/set-expired').post(forecast.markForecastAsExpired);
routes.route('/guest-create-comment').post(guestRequests.proxyPosting);
routes.route('/guest-custom-json').post(guestRequests.proxyCustomJson);

module.exports = routes;
