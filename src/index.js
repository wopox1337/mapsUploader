const { uploadMapScreens } = require('./screens/uploader.js');
const { uploadMapToDB } = require('./db.js');

const { join } = require('path');
const { createReadStream } = require('fs');

const processMap = async (mapData) => {
    console.log(`Start processing map`, mapData);
    return { id, raw_name } = await uploadMapToDB(mapData);

    // const basePath = join(__dirname, raw_name);
    // const topview = join(basePath, '1920.jpg');
    // const preview = join(basePath, '574.jpg');
    // uploadMapScreens({id, raw_name, topview, preview});
}

// processMap(TrainMini);

var AdmZip = require('adm-zip');

const unZip = async (file) => {
    var zip = new AdmZip(file);
    var zipEntries = zip.getEntries(); // an array of ZipEntry records
    

    let meta, topview, preview; // TODO: priority!!!

    zipEntries.every(async (zipEntry) => {
        if (zipEntry.isDirectory)
            return true;
        

        // console.log(zipEntry.toString()); // outputs zip entries information

        switch(zipEntry.entryName.toLowerCase()) {
            case 'meta-info.json': {
                console.log(` > Read ${zipEntry.entryName} file ...`);
                meta = JSON.parse(zipEntry.getData().toString("utf8"));

                break;
            }
            case `screens/1920.jpg`: {
                console.log(` > Found`, zipEntry.entryName, `file in`, file, `...`);
                topview = zipEntry.getData();
                
                break;
            }
            case `screens/574.jpg`: {
                console.log(` > Found`, zipEntry.entryName, `file in`, file, `...`);
                preview = zipEntry.getData();
                
                break;
            }
            default: {
                // console.log(` > Found`, zipEntry.entryName, `file in`, file, ` skip it...`);
                
                break;
            }
        }
        
        
        return true;
    });


    // TS: typecheck

    if (meta.game_id === 2 && meta.workshop_id !== null) {
        console.error(`Found incorrect ${zipEntry.entryName} file.`, `game_id: 1 should have workshop_id = null!`);
        return false;
    }
    
    let processedMap = await processMap(meta);

    console.log(`Try to upload screens...`, processedMap);
    await uploadMapScreens({...processedMap, topview, preview});
}

unZip(join(__dirname, `..`, `mini_train.zip`))

