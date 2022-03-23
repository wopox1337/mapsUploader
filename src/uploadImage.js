const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const form = new FormData();

const file = path.join(__dirname, `de_dust2_2055`, `574.jpg`);

console.log(file);

form.append('image', fs.createReadStream(file));
form.append('mapID', '185');

axios
    .request({
        method: 'POST',
        url: 'https://files-uploader.fastcup.net/maps/preview',
        headers: {
            'Cookie':'sid=5834052.NYKk%2Fh3JVSuOvHNFi3iaxIFM5INapNcepcvuWTfjmMw',
            ...form.getHeaders()
        },
        data: form
    })
    .then(response => {
        console.log(response.data)
    })
    .catch(e => {
        console.error(e)
    })
