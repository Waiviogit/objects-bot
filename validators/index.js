module.exports = {
    validator: require( './validator' ),
    comment: require( './commentValidator' ),
    post: require( './postValidation' ),
    validate: ( data, schema ) => {
        const result = schema.validate( data, { abortEarly: false } );

        if( result.error ) {
            return { error: result.error };
        }
        return { params: result.value };

    }
};
