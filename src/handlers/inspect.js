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

    if (!watchUrls) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                error: true,
                message: "WATCH_URLS is empty",
                url,
            })
        }
    }

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

    // Check if url is available
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

    const incident = await getDoc(
        { TableName: getSettings().TABLE_NAME }, { Key: { url } }
    ).promise();
    const hasReportedIncident = !R.isEmpty(incident);

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
        try {
            await createIncident(url);
        } catch (err) {
            return buildErrorResponse(err);
        }

        if (getSettings().SLACK_REPORTING_WEBHOOK) {
            const slackMessage = {
                title: `${urlInfo.host} is down`,
                text: error,
            }

            try {
                await sendDownReportToSlack(slackMessage);
            } catch (err) {
                return buildErrorResponse(err);
            }
        }

        if (getSettings().FOURTYSIXELKS_SMS_RECEIVER) {
            const smsMessage = `${urlInfo.host} is down. ${error}`;
            await sendDownReportToSMS({ text: smsMessage });
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

        try {
            await removeIncident(url);
        } catch (err) {
            return buildErrorResponse(err);
        }

        if (getSettings().SLACK_REPORTING_WEBHOOK) {
            await sendUpReportToSlack({
                title: `${urlInfo.host} is up`,
                text: `${url} is up again (down for ${totalDowntime})`,
                url: url,
            });
        }


        if (getSettings().FOURTYSIXELKS_SMS_RECEIVER) {
            const smsMessage = `${url} is up again (down for ${totalDowntime})`
            await sendUpReportToSMS({ text: smsMessage });
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

const sendReportToSMS = R.curry(async (params, { text }) => {
    const username = getSettings().FOURTYSIXELKS_USERNAME;
    const password = getSettings().FOURTYSIXELKS_PASSWORD;
    const smsReceiver = getSettings().FOURTYSIXELKS_SMS_RECEIVER;
    const body = new URLSearchParams({
        ...params,
        to: smsReceiver,
        message: text,
    });

    const auth = 'Basic ' + Buffer.from(
        username + ':' + password
    ).toString('base64');

    return await fetch("https://api.46elks.com/a1/sms", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "Authorization": auth,
        },
        body: body.toString(),
    });
});


const sendUpReportToSMS = sendReportToSMS({ from: "Conymys" });
const sendDownReportToSMS = sendReportToSMS({ from: "Conymys" });

module.exports = {
    inspect: withOfflineSupport(inspect),
};
