const config = require('config');
const jsonDocFile = require('swagger/swagger.json');

jsonDocFile.host = config.swaggerHost;
