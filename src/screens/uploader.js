const axios = require('axios');
const FormData = require('form-data');
const { existsSync, createReadStream } = require('fs');

const { resize } = require('./resizer.js');
const { Readable } = require('stream');

const { DOMAIN, COOKIE } = process.env;

if (!DOMAIN || !COOKIE)
	throw new Error(`Must specify DOMAIN and COOKIE`);

const API = `https://files-uploader.${DOMAIN}/maps/`;

const uploadMapScreens = async ({id, raw_name, topview, preview}) => {
    if(DOMAIN.includes(`.dev`) && 0) {
        console.error(` > Skip uploading topview & preview on ${DOMAIN} for map`, {id, raw_name, topview, preview});
        return;
    }

    console.log(` > Try to upload screens for map `, id ,raw_name, `...`);

    let screens = {
        topview: Readable.from(topview),
        preview: Readable.from(topview),
    }

    // return;

    //#region startUpload
    for (const [key, value] of Object.entries(screens)) {
        console.log(`  > Try to upload screen: `, key, `...`);
        
        const URI = API + key;
        console.log(URI);

        const form = new FormData();
        form.append('mapID', id);
        form.append('image', topview); // send buffer

        console.log(form);
        
        try {
            const response = await axios.request({
                method: 'POST',
                url: URI,
                headers: {
                    'Cookie':COOKIE,
                    ...form.getHeaders()
                },
                data: form
            });
    
            console.log(`  > Map screen uploaded`, id, response.data.objectID)
        } catch(e) {
            throw new Error(e);
        }
    }

    console.log(` > Screens succefully uploaded for map `, id ,raw_name, `...`);
    //#endregion 
}

module.exports = { uploadMapScreens };