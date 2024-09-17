const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db')
require('dotenv').config()
// const passport = require('./auth')

app.use(bodyParser.json())
const PORT = process.env.PORT || 3000

const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes')
app.use('/user',userRoutes);
app.use('/candidate', candidateRoutes);
// Start the server and log a message to confirm it's running
app.listen(PORT,()=>{
    console.log('listening at port:3000')
})