const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path')
const templates = require('./htmlTemplates')
const indexTemplate = templates.indexBaseTemplate
const tableRow = templates.tableRow


function createDir(dirname) {
    let dirpath = (dirname) ? `scrapes/${dirname}` : 'scrapes/output'
    if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath);
    }
    return
}

function createIndexPage(scrapedURL, imgDownloads, outputFolder) {

    if (!Array.isArray(imgDownloads)) imgDownloads = [imgDownloads];

    // create a standard index.html template and wrap it as cheerio object
    const $ = cheerio.load(indexTemplate(scrapedURL))

    const table = $('#imagesTable')
    // for every download image - append new row in #imagesTable'
    for (let i = 0; i < imgDownloads.length; i++) {
        let img = imgDownloads[i]
        let row = cheerio.load(tableRow(img.filename, img.url, img.fileSize, img.base64))
        row('.row').appendTo(table)
    }

    // generate the index file
    return new Promise((resolve, reject) => {
        let HTMLfile = fs.createWriteStream(`./scrapes/${outputFolder}/index.html`, {})
        HTMLfile.write($.html(), 'utf8', (err) => {
            if (err) reject(err)
            resolve()
        })
    })
}

function processDownloadedFiles(imageDownloads, resize) {
    // filter unsuccessful downloads
    imageDownloads = imageDownloads.filter(download => download.status == 'success')
    // extract each image file data
    return Promise.all(imageDownloads.map(imgDownload => extractFileDetails(imgDownload.imgData)))
}

function extractFileDetails(imgData) {
    return new Promise((resolve, reject) => {
        fs.readFile(imgData.filePath, (err, data) => {
            if (err) reject(err)
            let fileSize = data.byteLength
            let base64 = new Buffer(data, 'binary').toString('base64');
            imgData = { ...imgData, fileSize, base64 }
            resolve(imgData)
        })
    })
}

function resizeImage() {}

module.exports = { createDir, createIndexPage, processDownloadedFiles }