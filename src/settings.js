const getSettings = () => {
    return {
        TABLE_NAME: process.env.TABLE_NAME,
        WATCH_URLS: process.env.WATCH_URLS,
        SLACK_REPORTING_WEBHOOK: process.env.SLACK_REPORTING_WEBHOOK,
        INSPECT_URL: process.env.INSPECT_URL,
        FOURTYSIXELKS_USERNAME: process.env.FOURTYSIXELKS_USERNAME,
        FOURTYSIXELKS_PASSWORD: process.env.FOURTYSIXELKS_PASSWORD,
        FOURTYSIXELKS_SMS_RECEIVER: process.env.FOURTYSIXELKS_SMS_RECEIVER,
    };
};

module.exports = {
    getSettings
};
