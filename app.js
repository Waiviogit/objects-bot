const express = require( 'express' );
const logger = require( 'morgan' );
const cors = require( 'cors' );
const { routes } = require( './routes' );
const app = express();
const { createNamespace } = require( 'cls-hooked' );
const session = createNamespace( 'request-session' );


app.use( logger( 'dev' ) );
app.use( express.json() );
app.use( cors() );
app.use( express.urlencoded( { extended: true } ) );
app.use( ( req, res, next ) => {
    session.run( () => next() );
} );
app.use( ( req, res, next ) => {
    session.set( 'access-token', req.headers[ 'access-token' ] );
    session.set( 'waivio-auth', Boolean( req.headers[ 'waivio-auth' ] ) );
    next();
} );
app.use( '/', routes );

app.use( ( req, res, next ) => {
    res.status( res.result.status || 200 ).json( res.result.json );
} );

app.use( ( err, req, res, next ) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get( 'env' ) === 'development' ? err : {};
    // render the error page
    res.status( err.status || 500 ).json( { message: err.message } );
} );

module.exports = app;
