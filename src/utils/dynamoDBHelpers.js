const AWS = require("aws-sdk");

const putDoc = (config, item) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const model = { ...config, Item: item };
    return docClient.put(model);
};

const getDoc = (config, params) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const model = { ...config, ...params };
    return docClient.get(model);
};

const deleteDoc = (config, params) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const model = { ...config, ...params };
    return docClient.delete(model);
};

const scan = (config, filters) => {
    fitlers = filters || {};
    const docClient = new AWS.DynamoDB.DocumentClient();
    const model = { ...config, ...filters };
    return docClient.scan(model);
};

module.exports = {
    putDoc,
    getDoc,
    deleteDoc,
    scan,
}
