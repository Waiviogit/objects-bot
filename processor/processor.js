const { api } = require('../api');
const { validator } = require('../validator');
const { PrivateKey } = require('dsteem');
const { accountsData } = require('../constants/accountsData');
const { actionTypes } = require('../constants/actionTypes');
const { appData } = require('../constants/appData');
const { getPostData, getOptions, getAppendRequestBody } = require('../helpers/dataMapper');

let index = 0;

const getAccount = () => {
    const currentIndex = index;
    if (++index === accountsData.length) {
        index = 0;
    }
    return accountsData[currentIndex];
};

async function processCreateObject(req, res) {
    this.attempts = this.attempts < appData.maxAttempts ? this.attempts + 1 : 1;
    try {
        const data = req.body;
        if (validator.validateCreateObject(data)) {
            const botAcc = getAccount();
            const transactionStatus = await api.createPost(
                getPostData(actionTypes.CREATE_OBJECT, data, botAcc),
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
            await processCreateObject.call(this ,req, res);
        } else {
            res.status(422).json({ error: e.message })
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
                getPostData(actionTypes.APPEND_OBJECT, data, botAcc),
                getOptions(data, botAcc),
                PrivateKey.fromString(botAcc.postingKey)
            );
            if (!transactionStatus) {
                res.status(422).json({ error: 'Data is incorrect' })
            } else {
                res.status(200).json({ transactionId: transactionStatus.id, permlink: data.permlink, author: botAcc.name });
            }
        }
        else {
            res.status(422).json({ error: 'Not enough data', body: req.body })
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < appData.maxAttempts) {
            await processAppendObject.call(this ,req, res);
        } else {
            res.status(422).json({ error: e.message })
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
            getPostData(actionTypes.FORECAST_EXPIRED, data, botAcc),
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
    processCreateObject,
    processAppendObject,
    markForecastAsExpired,
};
