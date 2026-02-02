const {Client} = require('pg');
const { configDotenv } = require('dotenv');
configDotenv();
const pgClient=new Client({
    host:process.env.PGHOST,
    user:process.env.PGUSERNAME,
    password:process.env.PGPASS,
    port:process.env.PGPORT,
    database:process.env.PGDATABASE,
    options: "-c search_path=penpapper_schema,public"
});
module.exports={pgClient}