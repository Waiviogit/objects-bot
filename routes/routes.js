const express = require('express');
const {
  guestRequests, forecast, object, sitesController,
} = require('controllers');

const routes = express.Router();

routes.use('/objects-bot', routes);

routes.route('/create-object-type').post(object.processCreateObjectType);
routes.route('/create-object').post(object.processCreateObject);
routes.route('/append-object').post(object.processAppendObject);
routes.route('/set-expired').post(forecast.markForecastAsExpired);
routes.route('/guest-create-comment').post(guestRequests.proxyPosting);
routes.route('/guest-custom-json').post(guestRequests.proxyCustomJson);
routes.route('/create-site').post(sitesController.sendCreateSite);
routes.route('/delete-site').post(sitesController.sendRemoveSite);

module.exports = routes;
