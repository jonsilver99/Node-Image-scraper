const fs = require('fs');
const nodeURL = require("url");
const path = require('path');
const https = require('https');
const cheerio = require('cheerio');
const ImageDownload = require('../models/ImageDownload')

function scrapeStaticURL(targetURL, outputFolder) {
    // get target domain's root dir   
    const targetBaseURL = determineBaseURL(targetURL)

    // download website's html as string
    return getWebsiteHTML(targetURL)
        // parse html string and extract img tags src attribute (url's)
        .then(htmlString => parseHTMLAndExtractImages(htmlString, true))
        // download images
        .then(imgURLs => downloadImages(imgURLs, targetBaseURL, outputFolder))

        .catch(err => {
            throw err
        })
}

function determineBaseURL(url) {
    let parsedURL = nodeURL.parse(url)
    return parsedURL.protocol + '//' + parsedURL.host;
}

function getWebsiteHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                // response.setEncoding('utf-8');
                response.setEncoding('utf8');
                let data = "";
                response.on('data', (chunk) => data += chunk.toString('utf8'))
                response.on('end', () => resolve(data))
            } else {
                reject(`failed to get website html - reason: ${response.statusMessage}`)
            }
        })
    })
}

function parseHTMLAndExtractImages(htmlText, src) {
    const $ = cheerio.load(htmlText);
    let extracted = $('img')
    if (src) {
        // if src true - return array of the images 'src's
        return extracted.map((i, image) => {
            // traverse all img tags and try to extract the url from one of their attributes
            return $(image).attr('src') || $(image).attr('data-cfsrc') || $(image).data('data-cfsrc')
        }).get() // calling get on cheerio collection returns an array
    }
    else {
        // otherwise return an array of entire images (objects) 
        return extracted.toArray()
    }
}

function downloadImages(urls, baseURL, outputFolder) {
    if (!Array.isArray(urls)) urls = [urls]

    // filter url's array for invalid values (not likely to happen) 
    urls = urls.filter(url => url !== '' && url != undefined)

    return Promise.all(urls.map(url => {
        // if the url begins with "http" - its absolute, otherwise its probably a path("/")
        // relative to domain root in which case baseURL is concatinated   
        url = (baseURL && !url.includes('http')) ? baseURL + url : url
        return downloadImage(url, outputFolder)
    }))
}

function downloadImage(url, outputFolder) {
    let parsedURL = nodeURL.parse(url);
    let filename = path.basename(parsedURL.pathname);
    let filePath = `./scrapes/${outputFolder}/${filename}`;

    return new Promise((resolve, reject) => {
        let file = fs.createWriteStream(filePath)
            .on('finish', () => {
                resolve(downloadResult('success', url, filename, filePath))
            })

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file)
            } else {
                reject(downloadResult('failed', url, filename, null, response))
            }
        }).on('error', (err) => reject(err))
    })
}

function downloadResult(status, url, filename, filePath, response) {
    return {
        status: status,
        msg: status == 'success' ? `finished downloading: ${filename}` : `failed to download: ${filename} - ${response.statusMessage}`,
        imgData: status == 'success' ? new ImageDownload(url, filename, filePath) : null
    }

}

module.exports = scrapeStaticURL;