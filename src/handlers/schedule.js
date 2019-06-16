const R = require('ramda');
const fetch = require('node-fetch');
const { withOfflineSupport } = require("../decorators");
const { getSettings } = require("../settings");

const schedule = async (_event, _context) => {
    const inspectEndpoint = getSettings().INSPECT_URL

    let watchUrls = getSettings().WATCH_URLS
    watchUrls = watchUrls.split(",")

    R.map(inspectUrl(inspectEndpoint), watchUrls)

    return {
        statusCode: 200,
    };
}

const getInspectEndpoint = (event) => {
    const { Host: host } = event.headers;
    let path = event.path.split("/")
    path = [
        ...path.slice(0, path.length-1),
        "inspect"
    ].join("/")
    return `http://${host}${path}`
}

const inspectUrl = R.curry((endpoint, url) => {
    fetch(`${endpoint}?${toQueryString({url})}`)
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
