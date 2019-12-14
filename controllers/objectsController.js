const { objectOperations } = require( '../utilities' );
const validators = require( './validators' );

const processCreateObjectType = async ( req, res, next ) => {
    if ( !req.body.objectType ) {
        console.error( `ERR[CreateObjectType] Invalid request data: ${JSON.stringify( req.body )}` );
        return next( { status: 422, message: 'Not enough data' } );
    }
    const { error, result } = await objectOperations.createObjectTypeOp( req.body );

    if( error ) return next( error );
    res.result = result;
    next();
};

const processCreateObject = async ( req, res, next ) => {
    const value = validators.validate( req.body, validators.object.Schema, next );

    if( !value ) return;
    const { error, result } = await objectOperations.createObjectOp( req.body );

    if( error ) return next( error );
    res.result = result;
    next();
};

const processAppendObject = async( req, res, next ) => {
    const value = validators.validate( req.body, validators.appendObject.Schema, next );

    if( !value ) return;
    const { error, result } = await objectOperations.AppendObjectOp( req.body );

    if( error ) return next( error );
    res.result = result;
    next();
};

module.exports = {
    processCreateObjectType,
    processCreateObject,
    processAppendObject
};
