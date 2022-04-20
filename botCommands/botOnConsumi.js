/*
 * Copyright (c) 2018 Francesco Longo All rights reserved.
 */

'use strict';

/** require **/
const Config = require('../utilities/config');
const Utils = require('../utilities/utils');

/** constants **/
const bot = Config.bot;

const request = require('request');
const cheerio = require('cheerio');

const ILIAD_BASE_URL = 'https://www.iliad.it/account/';
const ILIAD_OPTION_URL = {
    login: 'login',
    credit: 'consumi-e-credito'
};

/** export **/
const e = module.exports = {};

e.botOnConsumi = botOnConsumi;
e.botOnConsumiAfterReceivingData = botOnConsumiAfterReceivingData;

async function botOnConsumi(msg) {
    const id = msg.from.id;
    const functionName = "_botOnConsumi_";

    try {
        await Utils.checkRequest(id, functionName, "GET_CONSUMI");
    } catch (e) {
        Utils.consoleLog("ERROR", functionName, e);
        await bot.sendMessage(id, "Errore, premi di nuovo: /consumi", {replyMarkup: 'hide'});
    }
}

async function botOnConsumiAfterReceivingData(msg) {
    const id = msg.from.id;
    const functionName = "_botOnConsumiAfterReceivingData_";
    const text = String(msg.text);

    try {
        const stringArray = text.split(/(\s+)/).filter(function (e) {
            return e.trim().length > 0;
        });

        const userid = stringArray[0];
        const password = stringArray[1];

        let formData = {
            'login-ident': userid,
            'login-pwd': password
        };

        let options = {
            url: ILIAD_BASE_URL + ILIAD_OPTION_URL['login'],
            method: 'POST',
            formData: formData
        };

        request(options, function (error, response, body) {
            let token = response['headers']['set-cookie'][0].split(';')[0].split('=')[1];

            //console.log("Token is: " + token);

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

            request(options, async function (error, response, body) {
                try {
                    if (body !== undefined) {
                        //console.log("Data: " + body);
                        await retrieveData(id, body);
                    } else {
                        console.log('Error1');
                    }
                } catch (exeption) {
                    console.log("Error2");
                }
            });
        });
    } catch (e) {
        Utils.consoleLog("ERROR", functionName, e);
        await bot.sendMessage(id, "Errore, premi di nuovo: /consumi", {replyMarkup: 'hide'});
    }
}

async function retrieveData(id, body) {
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


    let results_data2 = "<b>La tua linea iliad</b>\n\n" +
        "➡️<b>Il tuo credito: </b>" + credito + "\n" +
        "➡️<b>Prossimo rinnovo: </b>" + data_rinnovo + "\n" +
        "➡️<b>I tuoi consumi di questo mese</b>" +
        "\n    📞" + data_store.iliad[1][0] + " di chiamate effettuate" +
        "\n    ✉️ : " + data_store.iliad[2][0] + " SMS" +
        "\n    📩 : " + data_store.iliad[4][0] + " MMS" +
        "\n    🌐 Dati consumati (🇮🇹): " + data_store.iliad[3][0] +
        "\n    🌐 Dati consumati  (🇪🇺): " + euData[0] + " / 2GB";

    await bot.sendMessage(id, results_data2, {parseMode: 'html'});
}
