/*
 * Copyright (c) 2018 Francesco Longo All rights reserved.
 */

'use strict';

/** require **/
const Config = require('../utilities/config');
const Utils = require('../utilities/utils');

/** constants **/
const bot = Config.bot;

/** export **/
const e = module.exports = {};

e.botOnStart = botOnStart;

async function botOnStart(msg) {
    const id = msg.from.id;
    const functionName = "_botOnStart_";

    const reply = "Benvenuto su @IliadConsumiBot!" +
        "Questo bot è stato creato da @france193!" +
        "Per sapere i tuoi consumi digita: /consumi";

    try {
        await bot.sendMessage(id, reply);
    } catch (e) {
        Utils.consoleLog("ERROR", functionName, e);
    }
}
