const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const readline = require('readline');

const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>'
})

function initialize() {
    clear();
    log("CLI   tool   -   images   scraper", 'title')
}

function inquire(question, type) {
    log(question, type)

    return new Promise((resolve, reject) => {
        interface.question('', (value) => {
            if (value == value) resolve(value)
            else reject('invalid value')
        })
    })
}

function log(text, type) {
    let msg;
    switch (type) {
        case 'title': {
            msg = chalk.green(
                figlet.textSync(text, { horizontalLayout: "default", verticalLayout: "default" })
            );
            break;
        }

        case 'prompt': {
            msg = chalk.blue.bold(text);
            break;
        }

        case 'process-done': {
            msg = chalk.green.bold(text);
            break;
        }

        default: {
            msg = text
            break;
        }
    }
    console.log(msg)
}

module.exports = {
    log: log,

    initialize: initialize,

    inquire: inquire
};