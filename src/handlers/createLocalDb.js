const AWS = require("aws-sdk");
const { withOfflineSupport, requireOffline } = require("../decorators.js");
const { getSettings } = require("../settings.js");

const createLocalDb = async (_event, _context) => {
    var dynamodb = new AWS.DynamoDB();
    var params = {
        TableName: getSettings().TABLE_NAME,
        KeySchema: [
            {
                AttributeName: "url",
                KeyType: "HASH"
            },
        ],
        AttributeDefinitions: [
            { AttributeName: "url", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        const data = await dynamodb.createTable(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Created table. Table description JSON:",
                data,
            })
        };
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify({
                message: err.message,
                code: err.code
            })
        };
    }
};

module.exports = {
    createLocalDb: requireOffline(withOfflineSupport(createLocalDb)),
}
