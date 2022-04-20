'use strict';

/** import packages **/
const SimpleNodeLogger = require('simple-node-logger');
const fs = require('fs');
const dotenv = require('dotenv');

// check env settings
const result = dotenv.config({ path: './.env'});

if (result.error) {
	throw result.error;
}

const LOG_FILE_PATH = process.env.LOG_FILE_PATH;

// create measurements folder if not exists
if (!fs.existsSync(LOG_FILE_PATH)) {
	fs.mkdirSync(LOG_FILE_PATH);
}

const fileLogOptsTelegramFile = {
	logDirectory: LOG_FILE_PATH,
	fileNamePattern: 'telegramBot_log__<DATE>.log',
	dateFormat: 'YYYY-MM-DD',
	timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};

const fileLogOptsTelegramCommandLine = {
	dateFormat: 'YYYY-MM-DD HH:mm:ss',
	timestampFormat: 'YYYY-MM-DD HH:mm:ss'
};

const fileLogOptsYouTubeStoreFile = {
	logDirectory: LOG_FILE_PATH,
	fileNamePattern: 'youtubeGetStats_log__<DATE>.log',
	dateFormat: 'YYYY-MM-DD',
	timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};

const fileLogYouTubeStoreCommandLine = {
	dateFormat: 'YYYY-MM-DD HH:mm:ss',
	timestampFormat: 'YYYY-MM-DD HH:mm:ss'
};

const e = module.exports = {};

e.telegramFileLog = SimpleNodeLogger.createRollingFileLogger(fileLogOptsTelegramFile);
e.telegramStdoutLog = SimpleNodeLogger.createSimpleLogger(fileLogOptsTelegramCommandLine);
e.youtubeFileLog = SimpleNodeLogger.createRollingFileLogger(fileLogOptsYouTubeStoreFile);
e.youtubeStdoutLog = SimpleNodeLogger.createSimpleLogger(fileLogYouTubeStoreCommandLine);
