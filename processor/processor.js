const { api } = require('../api');
const { validator } = require('../validator');
const { PrivateKey } = require('dsteem');
const { accountsData } = require('../constants/accountsData');
const { actionTypes } = require('../constants/actionTypes');
const { getPostData, getOptions, getAppendRequestBody } = require('../helpers/dataMapper');
const { getPermlink } = require('../helpers/permlinkGenerator');
const { steemErrRegExp } = require('../constants/regExp');

const botsAcc = (function() {
    let index = 0;
    const accData = accountsData;
    const length = accountsData.length;

    return {
        getNext: function() {
            let account;
            if (!this.hasNext()) {
                this.resetIndex();
            }
            account = accData[index];
            index = index + 1;
            return account;
        },
        hasNext: function() {
            return index < length;
        },
        resetIndex: function() {
            index = 0;
        },
    };
}());

async function processCreateObjectType(req, res) {
    this.attempts = this.attempts < accountsData.length ? this.attempts + 1 : 1;
    try {
        const data = {
            ...req.body,
            permlink: getPermlink(req.body.objectType),
        };
        if (validator.validateCreateObjectType(data)) {
            const botAcc = botsAcc.getNext();
            console.info(`INFO[CreateObjectType] Try to create object type | attempt: ${this.attempts} | bot: ${botAcc.name} | request body: ${JSON.stringify(req.body)}`);
            const transactionStatus = await api.createPost(
                getPostData(data, botAcc, actionTypes.CREATE_OBJECT_TYPE),
                getOptions(data, botAcc, actionTypes.CREATE_OBJECT_TYPE),
                PrivateKey.fromString(botAcc.postingKey)
            );
            if (!transactionStatus) {
                console.error(`ERR[CreateObjectType] Create type failed | request body: ${JSON.stringify(req.body)}`);
                handleError(this, res, { error: 'Data is incorrect' });
            } else {
                this.attempts = 0;
                const payload = {
                    transactionId: transactionStatus.id,
                    author: botAcc.name,
                    permlink: data.permlink,
                };
                res.status(200).json(payload);
                console.info(`INFO[CreateObjectType] Object type successfully created | response body: ${JSON.stringify(payload)}`);
            }
        }
        else {
            console.error(`ERR[CreateObjectType] Invalid request data: ${JSON.stringify(req.body)}`);
            handleError(this, res, { error: 'Not enough data', body: req.body });
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < accountsData.length) {
            console.warn(`ERR[CreateObjectType] RPCError: ${e.message}`);
            await processCreateObjectType.call(this ,req, res);
        } else {
            console.error(`ERR[CreateObjectType] Create type failed | Error: ${e.message}`);
            handleError(this, res, { error: e.message });
        }
    }
}

async function processCreateObject(req, res) {
    this.attempts = this.attempts < accountsData.length ? this.attempts + 1 : 1;
    try {
        const data = req.body;
        if (validator.validateCreateObject(data)) {
            const botAcc = botsAcc.getNext();
            console.info(`INFO[CreateObject] Try create | attempt: ${this.attempts} | bot: ${botAcc.name} | request body: ${JSON.stringify(req.body)}`);
            const transactionStatus = await api.createPost(
                getPostData(data, botAcc, actionTypes.CREATE_OBJECT),
                getOptions(data, botAcc),
                PrivateKey.fromString(botAcc.postingKey)
            );
            if (!transactionStatus) {
                console.error(`ERR[CreateObject] Create failed | request body: ${JSON.stringify(req.body)}`);
                handleError(this, res, { error: 'Data is incorrect' });
            } else {
                this.attempts = 0;
                console.info(`INFO[CreateObject] Successfully created`);
                console.info(`INFO[CreateObject] Recall Append object`);
                await processAppendObject(getAppendRequestBody(data, botAcc), res);
            }
        }
        else {
            console.error(`ERR[CreateObject] Invalid request data: ${JSON.stringify(req.body)}`);
            handleError(this, res, { error: 'Not enough data', body: req.body });
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < accountsData.length) {
            console.warn(`ERR[CreateObject] RPCError: ${e.message}`);
            await processCreateObject.call(this ,req, res);
        } else {
            console.error(`ERR[CreateObject] Create failed | Error: ${e.message}`);
            handleError(this, res, { error: e.message });
        }
    }
}

async function processAppendObject(req, res) {
    this.attempts = this.attempts < accountsData.length ? this.attempts + 1 : 1;
    try {
        const data = req.body;
        if (validator.validateAppendObject(data)) {
            const botAcc = botsAcc.getNext();
            console.info(`INFO[AppendObject] Try append | attempt: ${this.attempts} | bot: ${botAcc.name} | request body: ${JSON.stringify(req.body)}`);
            const transactionStatus = await api.createPost(
                getPostData(data, botAcc, actionTypes.APPEND_OBJECT),
                getOptions(data, botAcc),
                PrivateKey.fromString(botAcc.postingKey)
            );
            if (!transactionStatus) {
                console.error(`ERR[AppendObject] Append failed | request body: ${JSON.stringify(req.body)}`);
                handleError(this, res, { error: 'Data is incorrect' });
            } else {
                this.attempts = 0;
                const payload = {
                    transactionId: transactionStatus.id,
                    author: botAcc.name,
                    permlink: data.permlink,
                    parentAuthor: data.parentAuthor,
                    parentPermlink: data.parentPermlink,
                };
                res.status(200).json(payload);
                console.info(`INFO[AppendObject] Successfully appended | response body: ${JSON.stringify(payload)}`);
            }
        }
        else {
            console.error(`ERR[AppendObject] Invalid request data: ${JSON.stringify(req.body)}`);
            handleError(this, res, { error: 'Not enough data', body: req.body });
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < accountsData.length) {
            console.warn(`ERR[AppendObject] RPCError: ${e.message}`);
            await processAppendObject.call(this ,req, res);
        } else {
            console.error(`ERR[AppendObject] Append failed | Error: ${e.message}`);
            handleError(this, res, { error: e.message });
        }
    }
}

async function markForecastAsExpired(req, res) {
    this.attempts = this.attempts < accountsData.length ? this.attempts + 1 : 1;
    try {
        const data = {
            ...req.body,
            title: '',
            body: `Forecast has expired with profitability ${req.body.expForecast.profitability}`,
            permlink: `exp-${Number(new Date(req.body.expForecast.expiredAt))}`,
        };

        const botAcc = botsAcc.getNext();
        console.info(`INFO[ForecastExpired] Try to write comment | attempt: ${this.attempts} | bot: ${botAcc.name}`);
        const transactionStatus = await api.createPost(
            getPostData(data, botAcc, actionTypes.FORECAST_EXPIRED),
            getOptions(data, botAcc, actionTypes.FORECAST_EXPIRED),
            PrivateKey.fromString(botAcc.postingKey)
        );
        if (!transactionStatus) {
            console.error(`ERR[ForecastExpired] Set expired forecast failed | request body: ${JSON.stringify(req.body)}`);
            handleError(this, res, { error: 'Data is incorrect' });
        } else {
            res.status(200).json({ transactionId: transactionStatus.id, permlink: data.permlink, author: botAcc.name });
            console.info(`INFO[ForecastExpired] Expired forecast comment successfully created | response body: ${JSON.stringify(payload)}`);
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < accountsData.length) {
            console.warn(`ERR[ForecastExpired] RPCError: ${e.message}`);
            await markForecastAsExpired.call(this ,req, res);
        } else {
            console.error(`ERR[ForecastExpired] Set expired forecast failed | Error: ${e.message}`);
            handleError(this, res, { error: e.message });
        }
    }
}

function handleError(instance, res, payload) {
    const statusCode = steemErrRegExp.test(payload.error) ? 503 : 422;
    instance.attempts = 0;
    res.status(statusCode).json(payload);
}

module.exports = {
    processCreateObjectType,
    processCreateObject,
    processAppendObject,
    markForecastAsExpired,
};
