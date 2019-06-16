const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
};

const buildErrorResponse = err => {
    return {
        statusCode: err.statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            message: err.message,
            code: err.code
        })
    };
};


module.exports = {
    buildErrorResponse,
}
