const path = require('path')

function indexBaseTemplate(heading) {
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <link rel="stylesheet" href="../../style.css">
            <title>Image scraping results</title>
        </head>
        <body>
            <section id="imagesTable">
                <h1 id='page-heading'>Images scraped from: ${heading}</h1>
            </section>
        </body>
    </html>`
}

function tableRow(imgSrc, imgURL, imgSize, base64) {
    return `
    <div class="row">
        <div class="col">
            <img src="${imgSrc}" alt="">
            <div class='base64'>
                <span>
                    ${base64}
                </span>
            </div>
        </div>
        <div class="col details">
            <h3>
                <ul>
                    <li>URL: <a href='${imgURL}'>${imgURL}</a></li>
                    <li>Size: ${imgSize} bytes</li>
                    <li>Format: ${path.extname(imgSrc).replace('.', '')}</li>
                </ul>
            </h3>
        </div>
    </div>`
}

module.exports = { indexBaseTemplate, tableRow }