const express=require('express');
const { configDotenv } = require('dotenv');
const cors=require('cors');
const { pgClient } = require('./db/pgClient');
const port=process.env.PORT || 1111
const app=express();

configDotenv();
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded())

pgClient.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");
  })
  .catch(err => {
    console.error("❌ PostgreSQL connection error:", err.stack);
  });


app.use('/s3/api/v1/asset',require('./router/imageRouter'));
app.use('/s3/api/v1/author',require('./router/authorRouter'));


app.listen(port,()=>{
console.log("Server running on PORT: "+port)
})