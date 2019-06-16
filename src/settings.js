const getSettings = () => {
    return {
        TABLE_NAME: process.env.TABLE_NAME,
        WATCH_URLS: process.env.WATCH_URLS,
        SLACK_REPORTING_WEBHOOK: process.env.SLACK_REPORTING_WEBHOOK,
        INSPECT_URL: process.env.INSPECT_URL,
    };
};

module.exports = {
    getSettings
};
