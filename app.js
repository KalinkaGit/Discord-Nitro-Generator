const fs        = require('fs');
const https     = require('https');
const prompts   = require('prompts');

(async () => {
    const nb = await prompts({
      type: 'number',
      name: 'nbCodes',
      message: 'Number of codes',
      validate: nbCodes => nbCodes < 1 ? `Number of codes can only be a number between 1 and 1000` : true
    });
  
    init(nb.nbCodes);
})();

async function init(nb) {
    for (let i = 0; i < nb; i++) {
        let code = genCode();
        const valid = await checkCode(code);

        if (valid) {
            console.log('Valid: https://discord.gift/%s', code);
            writeCode(code);
        } else {
            console.log('Invalid code: https://discord.gift/%s', code);
        }
    }
}

function genCode() {
    const chars = 'abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ0123456789';

    let code = '';

    for (let i = 0; i < 16; i++) {
        code += chars.split('')[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

function checkCode(code) {
    return new Promise((success, failure) => {
        setTimeout(() => {
            https.get(`https://discordapp.com/api/v6/entitlements/gift-codes/${code}?with_application=false&with_subscription_plan=true`, function (res) {
                let body = '';

                res.on('data', function(chunk) {
                    body += chunk;
                });

                res.on('end', function() {
                    let json = JSON.parse(body);

                    if (json['message'] != 'Unknown Gift Code' && json['message'] != 'You are being rate limited.') {
                        success(true);
                    } else {
                        success(false);
                    }
                });
            }).on('error', function() {
                failure(false);
            });
        }, 2000);
    });
}

function writeCode(code) {
    fs.appendFile('./codes.txt', '\nValid: https://discord.gift/' + code, (e) => {
        if (e) {
            console.log('[ERROR] %s', e);
        }
    });
}