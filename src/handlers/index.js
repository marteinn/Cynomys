const { getIncidents } = require('./incident');
const { createLocalDb } = require('./createLocalDb');
const { getAppVersion } = require('./getAppVersion');
const { schedule } = require('./schedule');
const { inspect } = require('./inspect');

module.exports = {
    getIncidents,
    createLocalDb,
    getAppVersion,
    schedule,
    inspect,
};
