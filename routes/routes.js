
const { processor } = require( '../processor' );
const routeConfig = process.env.ROUTE_CONFIG ? JSON.parse( process.env.ROUTE_CONFIG ) : {
    CREATE_POST: '/create-post',
    CREATE_COMMENT: '/create-comment',
    BASE: '/objects-bot',
    CREATE_OBJECT_TYPE: '/create-object-type',
    CREATE_OBJECT: '/create-object',
    APPEND_OBJECT: '/append-object',
    FORECAST_EXPIRED: '/set-expired'

};

const express = require( 'express' );

const routes = express.Router();

routes.use( routeConfig.BASE, routes );

routes.route( routeConfig.CREATE_OBJECT_TYPE )
    .post( processor.processCreateObjectType );
routes.route( routeConfig.CREATE_OBJECT )
    .post( processor.processCreateObject );
routes.route( routeConfig.APPEND_OBJECT )
    .post( processor.processAppendObject );
routes.route( routeConfig.FORECAST_EXPIRED )
    .post( processor.markForecastAsExpired );
routes.route( routeConfig.CREATE_COMMENT )
    .post( processor.processComment );
routes.route( routeConfig.CREATE_POST )
    .post( processor.processPost );
module.exports = routes;
