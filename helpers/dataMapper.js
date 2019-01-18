const { appData } = require('../constants/appData');
const { actionTypes } = require('../constants/actionTypes');
const _ = require('lodash');

const getOptions = (reqData, accData) => {
    const optionsData = {};

    optionsData.author = accData.name;
    optionsData.max_accepted_payout = '100000.000 SBD';
    optionsData.percent_steem_dollars = 0;
    optionsData.allow_votes = true;
    optionsData.allow_curation_rewards = true;
    optionsData.permlink = reqData.permlink;
    optionsData.extensions = [
        [
            0,
            {
                beneficiaries: _.orderBy(
                    [
                        { weight: 1500, account: accData.name },
                        { weight: 1500, account: appData.appAccName },
                        { weight: 7000, account: reqData.author }
                    ],
                    ['account'],
                    ['asc'],
                )
            }
        ]
    ];

    return optionsData;
};

const getPostData = (type, reqData, accData) => {
    const appendObjPostData = {};
    const metadata = {
        app: `${appData.appName}/${appData.version}`,
        community: '',
        tags: appData.appendObjectTag
    };

    appendObjPostData.title = reqData.title;
    appendObjPostData.body = reqData.body;
    appendObjPostData.permlink = reqData.permlink;
    appendObjPostData.author = accData.name;

    switch (type) {
        case actionTypes.CREATE_OBJECT:
            appendObjPostData.parent_author = '';
            appendObjPostData.parent_permlink = appData.appendObjectTag;
            metadata.wobj = {
                action: type,
                creator: reqData.author,
                is_posting_open: Boolean(reqData.isPostingOpen),
                is_extending_open: Boolean(reqData.isExtendingOpen),
                field: {
                    name: "name",
                    body: reqData.objectName,
                    locale: reqData.locale,
                },
                object_type: reqData.type,
            };
            break;
        case actionTypes.APPEND_OBJECT:
            const galleryAlbumId = (reqData.field.name === 'galleryAlbum')
                ? Math.random().toString(36).substring(2)
                : null;
            appendObjPostData.parent_author = reqData.parentAuthor;
            appendObjPostData.parent_permlink = reqData.parentPermlink;
            metadata.wobj = {
                action: type,
                creator: reqData.author,
                field: galleryAlbumId ? { ...data.field, id: galleryAlbumId } : { ...data.field },
            };
            break;
        default:
    }

    appendObjPostData.json_metadata = JSON.stringify(metadata);

    return appendObjPostData;
};

module.exports = {
    getPostData, getOptions
};
