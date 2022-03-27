const sharp = require('sharp');

const RESIZE_W = 574;

const resize = (image) => {
    return sharp(image)
        .resize({width: RESIZE_W})
        .jpeg()
        .toBuffer();
}

module.exports = { resize };