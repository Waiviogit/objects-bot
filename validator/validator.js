const _ = require('lodash');

const requiredFieldsCreate = 'author,title,body,permlink'.split(',');

const validateCreateObject = (postData) => {
    let isValid = true;
    requiredFieldsCreate.forEach(field => {
        if (postData[field] === undefined || postData[field] === null) isValid = false
    });
    return isValid;
};

const requiredFieldsAppend = 'author,body,parentAuthor,parentPermlink'.split(',');

const validateAppendObject = (postData) => {
    let isValid = true;
    requiredFieldsAppend.forEach(field => {
        if (postData[field] === undefined || postData[field] === null) isValid = false
    });
    return isValid;
};

module.exports = {
    validateAppendObject, validateCreateObject,
};