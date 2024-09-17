const mongoose = require('mongoose')
require('dotenv').config()
//define mongodb connection url
const mongoURL = process.env.MONGODB_ONLINE_URL;
// const mongoURL = process.env.MONGO_LOCAL_URL

//setup mongodb connecting
mongoose.connect(mongoURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
// mongoose maintain  a default connection object represent the mongodb connection
const db = mongoose.connection;

//adding event listeners
db.on('connected',()=>{
    console.log('connected to mongodb')
});

db.on('error',()=>{
    console.log('connection error to mongodb')
});
db.on('disconnected',()=>{
    console.log('disconnected to mongodb')
});

module.exports = db;