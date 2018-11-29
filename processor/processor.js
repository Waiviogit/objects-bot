const { api } = require('../api');
const { validator } = require('../validator');
const { PrivateKey } = require('dsteem');
const { accountsData } = require('../constants/accountsData');
const { appData } = require('../constants/appData');
const _ = require('lodash');

let index = 0;

const getAccount = () => {
    const currentIndex = index;
    if((accountsData.length -1) <= index) {
        index = 0
    } else {
        index++
    }
    return accountsData[currentIndex];
};

const processCreateObject = async (req, res) => {
    try {
        const data = req.body;
        if(validator.validateCreateObject(data)) {

            const appendObjPostData = {};
            const optionsData = {};
            const botAcc = getAccount();
            const permlink = data.permlink;

            appendObjPostData.parent_author = '';
            appendObjPostData.parent_permlink = appData.appendObjectTag;
            appendObjPostData.author = botAcc.name;
            appendObjPostData.permlink = permlink;
            appendObjPostData.body = data.body;
            appendObjPostData.title = data.title;
            appendObjPostData.json_metadata = JSON.stringify({
                app:`${appData.appName}/${appData.version}`,
                community: '',
                tags: appData.appendObjectTag,
                wobj: {
                    action: "createObject",
                    field: {
                        name: "name",
                        body: data.objectName,
                        locale: data.locale,
                    },
                    object_type: data.type,
                }});
            optionsData.author = botAcc.name;
            optionsData.max_accepted_payout = '100000.000 SBD';
            optionsData.percent_steem_dollars = 0;
            optionsData.allow_votes = true;
            optionsData.allow_curation_rewards = true;
            optionsData.permlink = permlink;
            optionsData.extensions = [
                [
                    0,
                    {
                         beneficiaries: _.orderBy(
                            [
                                {weight: 1500, account: botAcc.name},
                                {weight: 1500, account: appData.appAccName},
                                {weight: 7000, account: data.author}
                            ],
                            ['account'],
                            ['asc'],
                        )
                    }
                ]
            ];
            const transactionStatus = await api.createPost(appendObjPostData, optionsData, PrivateKey.fromString(botAcc.postingKey));
            if(!transactionStatus){
                    res.status(422).json({error: 'Data is incorrect'})
            } else {
                res.status(200).json({ transactionId: transactionStatus.id, objectPermlink: permlink, objectAuthor: botAcc.name });
            }
        }
        else {
            res.status(422).json({error: 'Not enough data', body: req.body})
        }
    }
    catch (e) {
        res.status(422).json({error: e.message})
    }
};

const processAppendObject = async (req, res) => {
    try {
        const data = req.body;
        if(validator.validateAppendObject(data)) {

            const appendObjPostData = {};
            const optionsData = {};
            const botAcc = getAccount();
            const permlink = `${data.author}-append-object-${Math.random().toString(36).substring(2)}`;

            appendObjPostData.author = botAcc.name;
            appendObjPostData.body = data.body;
            appendObjPostData.title = data.title;
            appendObjPostData.parent_author = '';
            appendObjPostData.parent_permlink = appData.appendObjectTag;
            appendObjPostData.permlink = permlink;
            appendObjPostData.json_metadata = `{"tags":["${appData.appendObjectTag}"],"app":"${appData.appName}/${appData.version}","action":"appendObject"}`;

            optionsData.author = botAcc.name;
            optionsData.max_accepted_payout = '100000.000 SBD';
            optionsData.percent_steem_dollars = 0;
            optionsData.allow_votes = true;
            optionsData.allow_curation_rewards = true;
            optionsData.permlink = permlink;

            optionsData.extensions = [
                [
                    0,
                    {
                        beneficiaries: _.orderBy(
                            [
                                {weight: 1500, account: botAcc.name},
                                {weight: 1500, account: appData.appAccName},
                                {weight: 7000, account: data.author}
                            ],
                            ['account'],
                            ['asc'],
                        )
                    }
                ]
            ];
            const transactionStatus = await api.createPost(appendObjPostData, optionsData, PrivateKey.fromString(botAcc.postingKey));
            if(!transactionStatus){
                res.status(422).json({error: 'Data is incorrect'})
            } else {
                res.status(200).json({ transactionId: transactionStatus.id, permlink });
            }
        }
        else {
            res.status(422).json({error: 'Not enough data', body: req.body})
        }
    }
    catch (e) {
        res.status(422).json({error: e.message})
    }
};

module.exports = {
    processAppendObject, processCreateObject
};
