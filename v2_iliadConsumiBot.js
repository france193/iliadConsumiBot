'use strict';

/** import package **/
const Telegraf = require('telegraf');
const request = require('request');
const cheerio = require('cheerio');
const result = dotenv.config({ path: './.env'});

if (result.error) {
	throw result.error;
}

/** import functions **/
const log = require('./v2_common').telegramLog;
const isEmpty = require('./v2_common').isEmpty;
const isBlank = require('./v2_common').isBlank;
const functionName = require('./v2_common').functionName;

/** import classes **/

/** constants **/
const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
const ILIAD_BASE_URL = 'https://www.iliad.it/account/';
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID;
const ILIAD_ADMIN_ID = process.env.ILIAD_ADMIN_ID;
const ILIAD_ADMIN_PASSWORD = process.env.TELEGRAM_ADMIN_ID;

const ILIAD_OPTION_URL = {
	login: 'login',
	credit: 'consumi-e-credito'
};

/** Init **/
const bot = new Telegraf(TELEGRAM_API_TOKEN);

/** Middlewares **/
bot.use(async (ctx, next) => {
	const sender_name = (isEmpty(ctx.from.first_name) || isBlank(ctx.from.first_name)) ? 'first_name_not_set' : ctx.from.first_name;
	const sender_surname = (isEmpty(ctx.from.last_name) || isBlank(ctx.from.last_name)) ? 'last_name_not_set' : ctx.from.last_name;
	const sender_username = (isEmpty(ctx.from.username) || isBlank(ctx.from.username)) ? 'username_not_set' : ctx.from.username;
	
	const start = new Date()
	await next()
	const ms = new Date() - start
	
	log(functionName(), false, `Message from: ${sender_name} ${sender_surname} (${sender_username}) - response time: ${ms} ms.`)
})

/** Start bot **/
bot.launch()
	.then(() => {
		const msg = `Bot started!`;
		log(functionName(), false, msg);
	});

bot.command('consumi', (ctx) => consumiBotCommand(ctx));
bot.command('aiuto', (ctx) => help(ctx));
bot.command('start', (ctx) => help(ctx));

async function help(ctx) {
	const sender = ctx.from.id;
	
	const msg = `Per sapere il tuo credito e le info sulla tua linea iliad, digita il comando /consumi seguito dalla tua id e dalla tua password.\nAd esempio: \n\n` +
		`/consumi <ID> <PASSWORD>\n\n` +
		`Ssostituisci <ID> e <PASSWORD> con la tua id e la tua password.\n\n` +
		`Le tue credenziali non verranno salvate in nessun posto e saranno usate solo per accedere alla tua pagina.`;
	
	await bot.telegram.sendMessage(sender, msg)
		.then((message) => {
			const msg = `Message sent (Telegram message ID: ${message.message_id}).`;
			log(functionName(), false, msg);
		})
		.catch((err) => {
			log(functionName(), true, err);
		});
}

async function consumiBotCommand(ctx) {
	const sender_id = ctx.from.id;
	const text = ctx.update.message.text;
	
	const textStringArray = text.split(/(\s+)/).filter(function (e) {
		return e.trim().length > 0;
	});
	
	if (sender_id === TELEGRAM_ADMIN_ID) {
		const credentials = {
			user_id: ILIAD_ADMIN_ID,
			password: ILIAD_ADMIN_PASSWORD
		};
		
		return await sendResponse(TELEGRAM_ADMIN_ID, credentials);
	}
	
	if (textStringArray.length !== 3) {
		const msg = `Attenzione, hai sbagliato qualcosa, clicca su /aiuto per avere le istruzioni del bot.`;
		
		return await bot.telegram.sendMessage(sender, msg)
			.then((message) => {
				const msg = `Message sent (Telegram message ID: ${message.message_id}).`;
				log(functionName(), false, msg);
			})
			.catch((err) => {
				log(functionName(), true, err);
			});
	} else {
		const credentials = {
			user_id: textStringArray[1],
			password: textStringArray[2]
		};
		
		return await sendResponse(sender_id, credentials);
	}
}

async function sendResponse(sender, credentials) {
	const token = await authenticateAndGetToken(credentials);
	const data = await getDataFromIliadSite(token);
	
	const msg = `La tua linea iliad\n\n` +
		`- Il tuo credito: ${data.credito}\n` +
		`- Prossimo rinnovo ${data.rinnovo}\n` +
		`- I tuoi consumi` +
		`\n    📞 ${data.chiamate.usati} / ${data.chiamate.max}` +
		`\n    ✉️ ${data.messaggi.usati} / ${data.messaggi.max}` +
		`\n    📩 ${data.mms.usati} / ${data.mms.max}` +
		`\n    🌐 🇮🇹: ${data.dati_it.usati} / ${data.dati_it.max} ${data.dati_it.unit}` +
		`\n    🌐 🇪🇺: ${data.dati_eu.usati} / ${data.dati_eu.max} ${data.dati_eu.unit}`;
	
	return await bot.telegram.sendMessage(sender, msg)
		.then((message) => {
			const msg = `Message sent (Telegram message ID: ${message.message_id}).`;
			log(functionName(), false, msg);
		})
		.catch((err) => {
			log(functionName(), true, err);
		});
}

async function authenticateAndGetToken(credentials) {
	const formData = {
		'login-ident': credentials.user_id,
		'login-pwd': credentials.password
	};
	
	const options = {
		url: ILIAD_BASE_URL + ILIAD_OPTION_URL['login'],
		method: 'POST',
		formData: formData
	};
	
	return new Promise(((resolve, reject) => {
		try {
			request(options, async function (error, response, body) {
				let token = response['headers']['set-cookie'][0].split(';')[0].split('=')[1];
				//TODO log
				resolve(token);
			});
		} catch (e) {
			//TODO log
			reject(e);
		}
	}));
}

async function getDataFromIliadSite(token) {
	let options = {
		method: 'GET',
		url: ILIAD_BASE_URL + ILIAD_OPTION_URL['credit'],
		headers: {
			'Cache-Control': 'no-cache',
			'x-requested-with': 'XMLHttpRequest',
			cookie: 'ACCOUNT_SESSID=' + token,
			'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,pt;q=0.6',
			accept: 'application/json, text/javascript, * /*; q=0.01',
			scheme: 'https',
			method: 'GET',
			authority: 'www.iliad.it'
		},
		json: true
	};
	
	return new Promise((resolve, reject) => {
		try {
			request(options, async function (error, response, body) {
				try {
					if (body !== undefined) {
						const data = await retrieveDataFromBody(body);
						// TODO log
						resolve(data);
					} else {
						// TODO log
						reject('Error performing request.');
					}
				} catch (e) {
					// TODO log
					reject(e);
				}
			});
		} catch (e) {
			//TODO log
			reject(e);
		}
	})
}

async function retrieveDataFromBody(body) {
	return new Promise((resolve, reject) => {
		let data_store = {
			'iliad': {}
		};
		
		let array2 = [];
		let array3 = [];
		
		const $ = cheerio.load(body);
		let results = $('body');
		results.each(function (i, result) {
			$(result)
				.find('div.conso__content')
				.each(function (index, element) {
					array2 = array2.concat([$(element).find('div.conso__text').text().replace(/^\s+|\s+$/gm, '')]);
				});
			$(result)
				.find('div.conso__icon')
				.each(function (index, element) {
					if ($(element).find('div.wrapper-align').text().replace(/^\s+|\s+$/gm, '').split('\n')[2] !== undefined) {
						array3 = array3.concat([$(element).find('div.wrapper-align').text().replace(/^\s+|\s+$/gm, '').split('\n')[2]]);
					} else {
						array3 = array3.concat([$(element).find('div.wrapper-align').text().replace(/^\s+|\s+$/gm, '')]);
					}
				});
			let title = $(result).find('h2').find('b.red').text().replace(/^\s+|\s+$/gm, '');
			let title2;
			$(result).find('div.table-montant').find('div.label').each(function (index, element) {
				if (index === 1)
					title2 = $(element).text().replace(/^\s+|\s+$/gm, '')
			});
			
			let title3 = $(result).find('div.end_offerta').text().replace(/^\s+|\s+$/gm, '').match(/\d{2}\/\d{2}\/\d{4}/);
			
			data_store["iliad"][0] = {};
			
			data_store["iliad"][0][0] = title + '&\n' + title3; //titole credito
			data_store["iliad"][0][1] = 'true'; //ricarica button
			data_store["iliad"][0][2] = 'true'; //info consumi button
			
			let icon = [
				"http://android12.altervista.org/res/ic_call.png",
				"http://android12.altervista.org/res/ic_sms.png",
				"http://android12.altervista.org/res/ic_gb.png",
				"http://android12.altervista.org/res/ic_mms.png"
			];
			
			for (let y = 1; y < 5; y++) {
				let z = y - 1;
				data_store['iliad'][y] = {};
				data_store["iliad"][y][0] = array2[z].split('\n')[0]; //tipo
				data_store["iliad"][y][1] = array2[z].split('\n')[1]; //consumi
				data_store["iliad"][y][2] = array3[z]; //titoli
				data_store["iliad"][y][3] = icon[y - 1] //icon
				
			}
		});
		
		const temp1 = data_store["iliad"][0][0].split(/(\s+)/).filter(function (e) {
			return e.trim().length > 0;
		});
		
		let credito = temp1[0].replace("&", "");
		let data_rinnovo = temp1[1];
		
		let results_data1 = "\nI tuoi dati iliad (ITALIA):\n";
		let i = 0;
		array2.forEach(function (e) {
			if (i === 4) {
				results_data1 += "\n\nI tuoi dati iliad (EUROPA):\n";
			}
			
			results_data1 += e;
			results_data1 += "\n-------------------\n";
			i++;
		});
		
		const euData = array2[6].split(/(\s+)/).filter(function (e) {
			return e.trim().length > 0;
		});
		
		const chiamateArray = data_store.iliad[1][0].split(/(\s+)/).filter(function (e) {
			return e.trim().length > 0;
		});
		
		const smsArray = data_store.iliad[2][0].split(/(\s+)/).filter(function (e) {
			return e.trim().length > 0;
		});
		
		const mmsArray = data_store.iliad[4][0].split(/(\s+)/).filter(function (e) {
			return e.trim().length > 0;
		});
		
		const datiItArray = data_store.iliad[3][0].split(/(\s+)/).filter(function (e) {
			return e.trim().length > 0;
		});
		
		const datiEuArray = euData[0].split(/(\s+)/).filter(function (e) {
			return e.trim().length > 0;
		});
		
		resolve({
			credito: credito,
			rinnovo: data_rinnovo,
			chiamate: {
				usati: `${chiamateArray[1]} ${chiamateArray[2]} ${chiamateArray[3]}`,
				max: '∞'
			},
			messaggi: {
				usati: `${smsArray[0]}`,
				max: '∞'
			},
			mms: {
				usati: `${mmsArray[0]}`,
				max: '∞'
			},
			dati_it: {
				usati: `${datiItArray[0]}`,
				max: `${datiItArray[2]}`,
				unit: 'Gb'
			},
			dati_eu: {
				usati: euData[0],
				max: '2',
				unit: 'Gb'
			}
		});
	});
}
