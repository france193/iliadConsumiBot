/*
 * Copyright (c) 2018 Francesco Longo All rights reserved.
 */

/** WEBHOOK SETTINGS:
 *
 * - SET WEBHOOK (SELF-SIGNED)
 * curl -F "url=<URL>" https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
 *
 * - SET WEBHOOK (SELF-SIGNED)
 * curl -F "url=<URL>" -F "certificate=@cert.pem" https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
 *
 * - UNSET WEBHOOK
 * curl -F "url=" https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
 * **/
const settings_json = require('../settings/settings');
const clients = require('restify-clients');

const client = clients.createJsonClient({
    url: 'https://api.telegram.org/bot' + settings_json.telegram.token,
    version: '~1.0'
});

let object;

if (settings_json.telegram.webhook.isActive) {
	console.log("webHook must me activated!");

    object = {
        url: 'https://95.216.159.202',
        certificate: '../settings/cert.pem'
    };
} else {
    object = {
        url: ''
    };
}

client.post('https://api.telegram.org/bot' + settings_json.telegram.token + '/setWebhook', object, function (err, req, res, data) {
    console.log('%d -> %j', res.statusCode, res.headers);
    console.log("Activated!");
    printJSON(data);
});

function printJSON(obj) {
    console.log(JSON.stringify(obj, null, "	"));
}
