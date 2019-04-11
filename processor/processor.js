const { api } = require('../api');
const { get } = require('lodash');
const { validator } = require('../validator');
const { PrivateKey } = require('dsteem');
const { accountsData } = require('../constants/accountsData');
const { actionTypes } = require('../constants/actionTypes');
const { appData } = require('../constants/appData');
const { getPostData, getOptions, getAppendRequestBody } = require('../helpers/dataMapper');
const { getPermlink } = require('../helpers/permlinkGenerator');

let index = 0;

const getAccount = () => {
    const currentIndex = index;
    if (++index === accountsData.length) {
        index = 0;
    }
    return accountsData[currentIndex];
};

async function processCreateObjectType(req, res) {
    this.attempts = this.attempts < appData.maxAttempts ? this.attempts + 1 : 1;
    try {
        const data = {
            ...req.body,
            permlink: getPermlink(req.body.objectType),
        };
        if (validator.validateCreateObjectType(data)) {
            const botAcc = getAccount();
            const transactionStatus = await api.createPost(
                getPostData(data, botAcc, actionTypes.CREATE_OBJECT_TYPE),
                getOptions(data, botAcc, actionTypes.CREATE_OBJECT_TYPE),
                PrivateKey.fromString(botAcc.postingKey)
            );
            if (!transactionStatus) {
                res.status(422).json({ error: 'Data is incorrect' })
            } else {
                res.status(200).json({
                    transactionId: transactionStatus.id,
                    author: botAcc.name,
                    permlink: data.permlink,
                });
            }
        }
        else {
            res.status(422).json({ error: 'Not enough data', body: req.body })
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < appData.maxAttempts) {
            const errorCode = get(e, 'jse_info.code');
            if (errorCode === 10 || errorCode === 4100000) { // STEEM_MIN_ROOT_COMMENT_INTERVAL or Not enough RC
                res.status(503).json({ error: e.message })
            } else {
                await processCreateObjectType.call(this ,req, res);
            }
        } else {
            res.status(422).json(e)
        }
    }
}

async function processCreateObject(req, res) {
    this.attempts = this.attempts < appData.maxAttempts ? this.attempts + 1 : 1;
    try {
        const data = req.body;
        if (validator.validateCreateObject(data)) {
            const botAcc = getAccount();
            const transactionStatus = await api.createPost(
                getPostData(data, botAcc, actionTypes.CREATE_OBJECT),
                getOptions(data, botAcc),
                PrivateKey.fromString(botAcc.postingKey)
            );
            if (!transactionStatus) {
                res.status(422).json({ error: 'Data is incorrect' })
            } else {
                await processAppendObject(getAppendRequestBody(data, botAcc), res);
            }
        }
        else {
            res.status(422).json({ error: 'Not enough data', body: req.body })
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < appData.maxAttempts) {
            const errorCode = get(e, 'jse_info.code');
            if (errorCode === 10 || errorCode === 4100000) { // STEEM_MIN_ROOT_COMMENT_INTERVAL or Not enough RC
                res.status(503).json({ error: e.message })
            } else {
                await processCreateObject.call(this ,req, res);
            }
        } else {
            res.status(422).json(e)
        }
    }
}

async function processAppendObject(req, res) {
    this.attempts = this.attempts < appData.maxAttempts ? this.attempts + 1 : 1;
    try {
        const data = req.body;
        if (validator.validateAppendObject(data)) {
            const botAcc = getAccount();
            const transactionStatus = await api.createPost(
                getPostData(data, botAcc, actionTypes.APPEND_OBJECT),
                getOptions(data, botAcc),
                PrivateKey.fromString(botAcc.postingKey)
            );
            if (!transactionStatus) {
                res.status(422).json({ error: 'Data is incorrect' })
            } else {
                res.status(200).json({
                    transactionId: transactionStatus.id,
                    author: botAcc.name,
                    permlink: data.permlink,
                    parentAuthor: data.parentAuthor,
                    parentPermlink: data.parentPermlink,
                });
            }
        }
        else {
            res.status(422).json({ error: 'Not enough data', body: req.body })
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < appData.maxAttempts) {
            const errorCode = get(e, 'jse_info.code');
            if (errorCode === 4100000) { // check Not enough RC errCode
                res.status(503).json({ error: e.message })
            } else {
                await processAppendObject.call(this ,req, res);
            }
        } else {
            res.status(422).json(e)
        }
    }
}

async function markForecastAsExpired(req, res) {
    this.attempts = this.attempts < appData.maxAttempts ? this.attempts + 1 : 1;
    try {
        const data = {
            ...req.body,
            title: '',
            body: `Forecast has expired with profitability ${req.body.expForecast.profitability}`,
            permlink: `exp-${Number(new Date(req.body.expForecast.expiredAt))}`,
        };

        const botAcc = getAccount();
        const transactionStatus = await api.createPost(
            getPostData(data, botAcc, actionTypes.FORECAST_EXPIRED),
            getOptions(data, botAcc),
            PrivateKey.fromString(botAcc.postingKey)
        );
        if (!transactionStatus) {
            res.status(422).json({ error: 'Data is incorrect' })
        } else {
            res.status(200).json({ transactionId: transactionStatus.id, permlink: data.permlink, author: botAcc.name });
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < appData.maxAttempts) {
            await markForecastAsExpired.call(this ,req, res);
        } else {
            res.status(422).json({ error: e.message })
        }
    }
}

module.exports = {
    processCreateObjectType,
    processCreateObject,
    processAppendObject,
    markForecastAsExpired,
};
