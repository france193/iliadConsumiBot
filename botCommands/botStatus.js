/*
 * Copyright (c) 2018 Francesco Longo All rights reserved.
 */

'use strict';

/** botStatus **/
const Utils = require('../utilities/utils');

const e = module.exports = {};

e.botOnStop = botOnStop;
e.botOnReconnecting = botOnReconnecting;
e.botOnReconnected = botOnReconnected;
e.botOnError = botOnError;

function botOnStop(msg, bot) {
    const functionName = "botOnStop";

    Utils.consoleLog("(DEBUG)", functionName, " > Bot STOPPED");
    Utils.printJSON(msg);

    bot.start();
}

function botOnReconnecting(msg) {
    const functionName = "botOnReconnectiong";

    Utils.consoleLog("(DEBUG)", functionName, " > Bot RECONNECTIONG");
    Utils.printJSON(msg);
}

function botOnReconnected(msg) {
    const functionName = "botOnReconnected";

    Utils.consoleLog("(DEBUG)", functionName, " > Bot RECONNECTED");
    Utils.printJSON(msg);
}

function botOnError(msg) {
    const functionName = "botOnError";

    Utils.consoleLog("(DEBUG)", functionName, " > Bot ERROR");
    Utils.printJSON(msg);
}
