const chalk = require('chalk');
const interface = require('./custom_modules/interface');
const scrapeStaticURL = require('./custom_modules/scrapeHandler');
const fileHandler = require('./custom_modules/fileHandler');

let inquiries = {
    url: 'Type in valid url to scrape from:',
    output: 'Type in output folder:'
}

async function runProcess() {
    try {
        // Initialize console
        interface.initialize();

        // Get target url and output folder from user
        let targetURL = await interface.inquire(inquiries.url, 'prompt')
        let outputFolder = await interface.inquire(inquiries.output, 'prompt')
        interface.log(`Scraping domain: ${targetURL}`)

        // Resolve output folder
        outputFolder = outputFolder || 'output'
        fileHandler.createDir(outputFolder)
        interface.log(`Created folder at: '/scrapes/${outputFolder}'`, 'prompt')

        // download all images in url
        let imageDownloads = await scrapeStaticURL(targetURL, outputFolder)
        imageDownloads.forEach(download => interface.log(download.msg)) // log all download results
        interface.log('Scraping finished', 'prompt')

        // process downloaded images - filter failed ones, extract necessary file info and optionaly resize 
        imageDownloads = await fileHandler.processDownloadedFiles(imageDownloads)

        // Create html page and populate it with the images
        await fileHandler.createIndexPage(targetURL, imageDownloads, outputFolder)
        interface.log('HTML file created', 'prompt')
        
        // scrape process finished 
        interface.log('Process finished', 'process-done')

        // Prompt question - run operation again or exit?
        shouldRunAgain()

    } catch (error) {
        interface.log(chalk.red(`${error} \nScraping process aborted`))
    }
}

function shouldRunAgain() {
    return interface.inquire("Would you like to scrape another url? y/n")
        .then((answer) => {
            switch (answer.toLowerCase()) {
                case 'y': {
                    runProcess();
                    break;
                }
                case 'n': {
                    interface.log('Goodbye!', 'prompt')
                    process.exit(0)
                    break;
                }
                default: {
                    shouldRunAgain()
                    break;
                }
            }
        })
}

runProcess()


/*
// working examples:
    https://www.ynet.co.il/home/0,7340,L-8,00.html
    https://www.voog.com
    https://scotch.io/tutorials/scraping-the-web-with-node-js
    https://www.skagen.com/en-us/holst-slim-dark-brown-leather-watch-skw6237


// failed examples - files either served dynamically or from other certificate-protected domain
    https://pirple.thinkific.com/courses/the-nodejs-master-class - S3 bucket certificate needed
    https://www.guru99.com/php-interview-questions-answers.html - response doesnt decode to utf8
    http://www.bbc.com/ - requires http protocol and I used https
*/