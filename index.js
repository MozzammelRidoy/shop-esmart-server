var express = require('express');
var app = express();
require('dotenv').config();
var cors = require('cors');
var port = process.env.PORT || 5000; 



//middleware 
app.use(cors());
app.use(express.json()); 



// mongodb start here



//mongodb end here

app.get('/', (req, res)=>{
    res.send('Server Active Now'); 
})

app.listen(port, ()=> {
    console.log('Server is Running on PORT : ',port)
})