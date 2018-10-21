class ImageDownload {

    constructor(url, filename, filePath, fileSize, base64) {
        this.url = url;
        this.filename = filename;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.base64 = base64;
    }
}

module.exports = ImageDownload;