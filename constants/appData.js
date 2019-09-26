const appData = {
    appName: process.env.APP_NAME || 'waiviodev',
    version: process.env.APP_VERSION || '1.0.0',
    appAccName: process.env.APP_ACC_NAME || 'waivio',
    appendObjectTag: process.env.APPEND_OBJECT_TAG || 'waivio-object',
    objectTypeTag: process.env.OBJECT_TYPE_TAG || 'waivio-object-type',
};

module.exports = {
    appData: appData
};
