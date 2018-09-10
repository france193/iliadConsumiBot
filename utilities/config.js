/*
 * Copyright (c) 2018 Francesco Longo All rights reserved.
 */

'use strict';

/**
 * NPM LIBS
 **/
const TeleBot = require('telebot');
const settings_json = require('../settings/settings');

// authorized ID
const IDs = settings_json.TELEGRAM_AUTHORIZED_IDs;

let bot;
let log;

/**
 * BOT
 **/
let token = settings_json.telegram.token;

if (settings_json.telegram.webhook.isActive) {
    // webhook
    bot = new TeleBot({
        token: token,
        webhook: {
            // Self-signed certificate
            key: './settings/cert.key',
            cert: './settings/cert.pem',
            url: settings_json.telegram.webhook.url,
            // bind server with external ip and port
            host: settings_json.telegram.webhook.host,
            port: settings_json.telegram.webhook.port,
            maxConnections: settings_json.telegram.webhook.maxConnections
        },
        usePlugins: ['askUser']
    });
} else {
    bot = new TeleBot({
        token: token,
        polling: {
            interval: 1000, 	// Optional. How often check updates (in ms).
            timeout: 0, 		// Optional. Update polling timeout (0 - short polling).
            limit: 100, 		// Optional. Limits the number of updates to be retrieved.
            retryTimeout: 3000, // Optional. Reconnecting timeout (in ms).
        },
        usePlugins: ['askUser']
    });
}

/**
 * SIMPLE NODE LOGGER
 **/
const SimpleNodeLogger = require('simple-node-logger');

const opts = {
    logFilePath: './logs/logfile_' + returnDate(new Date()) + '.txt',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss'
};

log = SimpleNodeLogger.createSimpleLogger(opts);

/**
 * EXPORTS
 **/
let e = module.exports = {};

e.bot = bot;
e.log = log;
e.IDs = IDs;

// functions
function returnDate(today) {
    let day = today.getDate();
    let month = today.getMonth() + 1; //January is 0!

    let year = today.getFullYear();

    if (day < 10) {
        day = '0' + day;
    }

    if (month < 10) {
        month = '0' + month;
    }

    return year + '_' + month + '_' + day;
}

function printJSON(obj) {
    console.log(JSON.stringify(obj, null, "	"));
}
