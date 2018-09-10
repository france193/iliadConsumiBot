/*
 * Copyright (c) 2018 Francesco Longo All rights reserved.
 */

'use strict';

/** REQUIRE **/
const Config = require('./config');

/** COSTANTS **/
const log = Config.log;
const bot = Config.bot;

/** EXPORT **/
const e = module.exports = {};

e.printJSON = printJSON;
e.consoleLog = consoleLog;
e.returnDateIt = returnDateIt;
e.checkRequest = checkRequest;

function printJSON(obj) {
    log.info(JSON.stringify(obj, null, "	"));
}

function consoleLog(purpose, functionName, message) {
    log.info("(" + purpose + ") - " + functionName + " - " + message);
}

function returnDateIt(today) {
    let day = today.getDate();
    let month = today.getMonth() + 1; //January is 0!
    let year = today.getFullYear();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();

    if (day < 10) {
        day = '0' + day;
    }

    if (month < 10) {
        month = '0' + month;
    }

    if (hours < 10) {
        hours = '0' + hours;
    }

    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    return day + '/' + month + '/' + year + ' @ ' + hours + ':' + minutes + ':' + seconds;
}

async function checkRequest(id, functionName, request) {
    switch (request) {
        case "GET_CONSUMI":
            let message = "Per sapere i tuoi consumi mandami il tuo ID iliad e la password del tuo account con uno " +
                "spazio in mezzo.\n" +
                "In questo modo: ID password";

            await bot.sendMessage(id, message, {
                ask: 'get_consumi',
                replyMarkup: 'hide'
            });
            break;

        default:
            await bot.sendMessage(id, "Errore: richiesta sconosciuta", {replyMarkup: 'hide'});
            break;
    }
}