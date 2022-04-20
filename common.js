'use strict';

/** import functions **/
const telegramFileLog = require('./logger').telegramFileLog;
const telegramStdoutLog = require('./logger').telegramStdoutLog;
const youtubeFileLog = require('./logger').youtubeFileLog;
const youtubeStdoutLog = require('./logger').youtubeStdoutLog;

/** settings **/
const DEBUG = Boolean(true);
const COMMANDLINE_OUTPUT = Boolean(true);
const FILE_OUTPUT = Boolean(true);

function intTwoChars(i) {
	return (`0${i}`).slice(-2);
}

function getCurrentWeek() {
	let curr = new Date;
	let week = [];
	
	for (let i = 1; i <= 7; i++) {
		let first = curr.getDate() - curr.getDay() + i;
		let date = new Date(curr.setDate(first));
		
		let dow;
		
		if (date.getDay() === 0) {
			dow = 7;
		} else {
			dow = date.getDay();
		}
		
		week.push({
			year: Number(date.getFullYear()),
			month: Number(date.getMonth() + 1),
			day: Number(date.getDate()),
			dow: Number(dow)
		});
	}
	
	return week;
}

function getTodayDate() {
	let date = new Date();
	
	return {
		year: date.getFullYear(),
		month: intTwoChars(date.getMonth() + 1),
		day: intTwoChars(date.getDate())
	};
}

function getYesterdayDate() {
	let date = new Date();
	date.setDate(date.getDate() - 1);
	
	return {
		year: date.getFullYear(),
		month: intTwoChars(date.getMonth() + 1),
		day: intTwoChars(date.getDate())
	};
}

function getOtherYesterdayDate() {
	let date = new Date();
	date.setDate(date.getDate() - 2);
	
	return {
		year: date.getFullYear(),
		month: intTwoChars(date.getMonth() + 1),
		day: intTwoChars(date.getDate())
	};
}

function youtubeStatsLog(functionName, isError, message) {
	const msg = `* [${functionName}] - ${message}`;
	
	if (isError) {
		if (COMMANDLINE_OUTPUT) {
			youtubeStdoutLog.error(msg);
		}
		
		if (FILE_OUTPUT) {
			youtubeFileLog.error(msg);
		}
	} else {
		if (COMMANDLINE_OUTPUT) {
			youtubeStdoutLog.info(msg);
		}
		
		if (FILE_OUTPUT) {
			youtubeFileLog.info(msg);
		}
	}
}

function telegramLog(functionName, isError, message) {
	const msg = `* [${functionName}] - ${message}`;
	
	if (isError) {
		if (COMMANDLINE_OUTPUT) {
			telegramStdoutLog.error(msg);
		}
		
		if (FILE_OUTPUT) {
			telegramFileLog.error(msg);
		}
	} else {
		if (COMMANDLINE_OUTPUT) {
			telegramStdoutLog.info(msg);
		}
		
		if (FILE_OUTPUT) {
			telegramFileLog.info(msg);
		}
	}
}

const findFirstOccurrence = (string, searchElements, fromIndex = 0) => {
	let min = string.length;
	for (let i = 0; i < searchElements.length; i += 1) {
		const occ = string.indexOf(searchElements[i], fromIndex);
		if (occ !== -1 && occ < min) {
			min = occ;
		}
	}
	return (min === string.length) ? -1 : min;
}

const functionName = (func = null) => {
	if (func) {
		if (func.name) {
			return func.name;
		}
		const result = /^function\s+([\w\$]+)\s*\(/.exec(func.toString());
		return result ? result[1] : '';
	}
	const obj = {};
	Error.captureStackTrace(obj, functionName);
	const {stack} = obj;
	const firstCharacter = stack.indexOf('at ') + 3;
	const lastCharacter = findFirstOccurrence(stack, [' ', ':', '\n'], firstCharacter);
	return stack.slice(firstCharacter, lastCharacter);
}

function isEmpty(str) {
	return (!str || 0 === str.length);
}

function isBlank(str) {
	return (!str || /^\s*$/.test(str));
}

const e = module.exports = {};

e.isEmpty = isEmpty;
e.isBlank = isBlank;
e.getCurrentWeek = getCurrentWeek;
e.intTwoChars = intTwoChars;
e.getTodayDate = getTodayDate;
e.getYesterdayDate = getYesterdayDate;
e.getOtherYesterdayDate = getOtherYesterdayDate;
e.youtubeStatsLog = youtubeStatsLog;
e.telegramLog = telegramLog;
e.functionName = functionName;
