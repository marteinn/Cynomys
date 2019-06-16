const AWS = require("aws-sdk");
const { withOfflineSupport } = require("../decorators");
const { scan } = require("../utils/dynamoDBHelpers");
const { getSettings } = require("../settings");
const { buildErrorResponse } = require("../utils/errors");

const getIncidents = async (_event, _context) => {
    let params = {
        TableName: getSettings().TABLE_NAME,
    };

    try {
        const data = await scan(params).promise();
        let items = data.Items;

        return {
            statusCode: 200,
            body: JSON.stringify(items)
        };
    } catch (err) {
        return buildErrorResponse({
            statusCode: 500,
            ...err,
        })
    }
};

module.exports = {
    getIncidents: withOfflineSupport(getIncidents),
};
