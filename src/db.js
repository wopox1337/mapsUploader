const Pool = require('pg').Pool;

const { POSTGRES_URL } = process.env

if (!POSTGRES_URL)
	throw new Error(`Must specify POSTGRES_URL`)


const pool = new Pool({
    connectionString: POSTGRES_URL,
	max: 10
});

const findExistingMap = async (raw_name) => {

    try {
        const value = await pool.query(`
            SELECT id as existing_id
            FROM maps 
            WHERE raw_name=$1 
            LIMIT 1;
        `, [raw_name]);

        return value.rowCount ? value.rows[0] : { existing_id: -1 };
    } catch (e) {
        console.error(e)
    }
}

const insertMap = async (game_id, name, raw_name, type, workshop_id) => {
    try {
        res = await pool.query(`
            INSERT INTO maps(game_id, name, raw_name, type, workshop_id) 
            VALUES ($1,$2,$3,$4,$5) 
            RETURNING id, raw_name;
        `, [game_id, name, raw_name, type, workshop_id]);
        
        return res.rows[0];
    } catch (e) {
        throw new Error(e);
    }
}

const updateMap = async (id, name, raw_name, type, workshop_id) => {
    try {
        const res = await pool.query(`
            UPDATE maps 
            SET name=$2, raw_name=$3, type=$4, workshop_id=$5 
            WHERE id=$1 
            RETURNING id, raw_name;
        `, [id, name, raw_name, type, workshop_id]);

        return res.rows[0];
    } catch(e) {
        throw new Error(e);
    }
}


const uploadMapToDB = async ({ game_id, name, raw_name, type, workshop_id }) => {
    
    console.log(` > Try to search map`, {raw_name}, `in DB...`);
    const { existing_id } = await findExistingMap(raw_name);
    
    if(existing_id !== -1) {
        console.log(`  > Map`, {raw_name}, `was found in DB. Update this map.`);
        const updatedMap = await updateMap(existing_id, name, raw_name, type, workshop_id);
        console.log(`  > Map`, {raw_name}, `was succefully updated.`, updatedMap);

        pool.end();
        return updatedMap;
    }

    console.log(`  > Map`, {raw_name}, `not found in DB. Upload new map.`);
    const insertedMap = await insertMap(game_id ,name, raw_name, type, workshop_id);
    console.log(` > Map`, {raw_name}, `was succefully added.`, insertedMap);
    
    pool.end();
    return insertedMap;
}


module.exports = { uploadMapToDB };