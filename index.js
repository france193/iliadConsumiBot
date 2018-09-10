/*
 * Copyright (c) 2018 Francesco Longo All rights reserved.
 */

'use strict';

/** IMPORTS **/
const Config = require('./utilities/config');

/** COMMANDS **/
const {botOnText: botOnText} = require('./botCommands/botOnText');
const {botOnStart: botOnStart} = require('./botCommands/botOnStart');

const {
	botOnConsumi: botOnConsumi,
	botOnConsumiAfterReceivingData: botOnConsumiAfterReceivingData
} = require('./botCommands/botOnConsumi');

//const {botOnHelp: botOnHelp} = require('./botCommands/botOnHelp');

const {
	botOnStop: botOnStop,
	botOnReconnecting: botOnReconnecting,
	botOnReconnected: botOnReconnected,
	botOnError: botOnError
} = require('./botCommands/botStatus');

/** CONSTANT IMPORT **/
const bot = Config.bot;

/** BOT COMMANDS **/
bot.on(['text'], (msg) => botOnText(msg));

bot.on(['/start'], (msg) => botOnStart(msg));
bot.on(['/consumi'], (msg) => botOnConsumi(msg));

// ask events
bot.on('ask.get_consumi', (msg) => botOnConsumiAfterReceivingData(msg));

//bot.on(['/help'], (msg) => botOnHelp(msg));

// status
bot.on(['stop'], (msg, bot) => botOnStop(msg, bot));
bot.on(['reconnecting'], (msg) => botOnReconnecting(msg));
bot.on(['reconnected'], (msg) => botOnReconnected(msg));
bot.on(['error'], (msg, bot) => botOnError(msg, bot));

/** START BOT **/
bot.start();
