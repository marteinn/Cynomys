const R = require('ramda');
const fetch = require('node-fetch');
const { withOfflineSupport } = require("../decorators");
const { getSettings } = require("../settings");
const { buildErrorResponse } = require("../utils/errors");

const schedule = async (_event, _context) => {
    const inspectEndpoint = getSettings().INSPECT_URL

    let watchUrls = getSettings().WATCH_URLS
    watchUrls = watchUrls.split(",")

    try {
        const promises = R.map(inspectUrl(inspectEndpoint), watchUrls)
        await Promise.all(promises)
    } catch (e) {
        return buildErrorResponse(err);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            inspectEndpoint: inspectEndpoint,
            urls: watchUrls,
        }),
    };
}

const inspectUrl = R.curry((endpoint, url) => {
    return fetch(`${endpoint}?${toQueryString({url})}`)
})

const toQueryString = R.pipe(
    R.toPairs,
    R.map(R.map(encodeURIComponent)),
    R.map(R.join("=")),
    R.join("&"),
);

module.exports = {
    schedule: withOfflineSupport(schedule),
};
