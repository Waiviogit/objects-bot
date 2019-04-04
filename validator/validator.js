const requiredFieldsCreate = [
    'author',
    'title',
    'body',
    'permlink',
    'objectName',
    'locale',
    'isExtendingOpen',
    'isPostingOpen',
    'parentAuthor',
    'parentPermlink',
];

const validateCreateObject = (postData) => {
    let isValid = true;
    requiredFieldsCreate.forEach(field => {
        if (postData[field] === undefined || postData[field] === null) isValid = false
    });
    return isValid;
};

const requiredFieldsAppend = [
    'author',
    'body',
    'permlink',
    'parentAuthor',
    'parentPermlink',
];

const validateAppendObject = (postData) => {
    let isValid = true;
    requiredFieldsAppend.forEach(field => {
        if (postData[field] === undefined || postData[field] === null) isValid = false
    });
    return isValid;
};

const validateCreateObjectType = (postData) => (Boolean(postData.objectType));

module.exports = {
    validateAppendObject, validateCreateObject, validateCreateObjectType
};
