const URL = require('url');
const R = require('ramda');
const fetch = require('node-fetch');
const formatDistanceToNow = require('date-fns/formatDistanceToNow');
const { withOfflineSupport } = require("../decorators");
const { getSettings } = require("../settings");
const { statusCodes } = require("../utils/statusCodes");
const { putDoc, getDoc, deleteDoc } = require("../utils/dynamoDBHelpers");
const { buildErrorResponse } = require("../utils/errors");


const inspect = async (event, _context) => {
    const { url } = event.queryStringParameters
    const urlInfo = URL.parse(url);
    let watchUrls = getSettings().WATCH_URLS
    watchUrls = watchUrls.split(",")

    if (!watchUrls.includes(url)) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                error: true,
                message: "Url is not allowed",
                url,
            })
        }
    }

    const incident = await getDoc(
        { TableName: getSettings().TABLE_NAME }, { Key: { url } }
    ).promise();
    const hasReportedIncident = !R.isEmpty(incident);

    let resp = {}
    let error;
    try {
        resp = await fetch(url, { timeout: 10*1000 })
    } catch (e) {
        error = e.message
    }

    if (!error && resp.status !== 200 && resp.status !== 201) {
        error = `Status code ${resp.status}: ${statusCodes[resp.status]}`;
    }

    // Incident is active and has already been reported
    if (error && hasReportedIncident) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                error: true,
                message: `${error} (Already reported)`,
                url,
            })
        }
    }

    // Report new incident
    if (error && !hasReportedIncident) {
        const slackMessage = {
            title: `${urlInfo.host} is down`,
            text: error,
        }

        try {
            await sendDownReportToSlack(slackMessage);
        } catch (err) {
            return buildErrorResponse(err);
        }

        try {
            await createIncident(url);
        } catch (err) {
            return buildErrorResponse(err);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                error: true,
                message: error,
                slackMessage,
            })
        }
    }

    // Service back up, mark as up and remove incident
    if (!error && hasReportedIncident) {
        const totalDowntime = formatDistanceToNow(
            new Date(incident.Item.created)
        )

        await sendUpReportToSlack({
            title: `${urlInfo.host} is up`,
            text: `${url} is up again (down for ${totalDowntime})`,
            url: url,
        });

        try {
            await removeIncident(url);
        } catch (err) {
            return buildErrorResponse(err);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            error: false,
            message: "Service is up",
            url,
        })
    }
}

const createIncident = async (url) => {
    return await putDoc(
        { TableName: getSettings().TABLE_NAME },
        {
            url,
            created: new Date().getTime()
        },
    ).promise();
}

const removeIncident = async (url) => {
    return await deleteDoc(
        { TableName: getSettings().TABLE_NAME },
        { Key: { url } }
    ).promise();
}

const sendReportToSlack = R.curry(async (params, { title, text }) => {
    const webhookUrl = getSettings().SLACK_REPORTING_WEBHOOK
    const body = {
        "attachments": [
            {
                ...params,
                "title": title,
                "fallback": text,
                "text": text,
            }
        ]
    }

    return await fetch(webhookUrl, {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
})

const sendUpReportToSlack = sendReportToSlack({ color: "00FF00" });
const sendDownReportToSlack = sendReportToSlack({ color: "FF0000" });

module.exports = {
    inspect: withOfflineSupport(inspect),
};
