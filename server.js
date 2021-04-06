const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');

//build our url from our config file info
const config = require('./config-db.js');
const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const client = new MongoClient(url, { useUnifiedTopology: true });
let collection = null; //we will give this a value after we connect to the database

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) 

const API_PORT = 3000;



app.use(express.static('content'));

client.connect()
.then(conn => {
    //if the collection does not exist it will automatically be created
    collection = client.db().collection(config.collection);
    console.log("Connected!", conn.s.url.replace(/:([^:@]{1,})@/, ':****@')) 
})
.catch(err => { console.log(`Could not connect to ${url.replace(/:([^:@]{1,})@/, ':****@')}`, err);  throw err; })
// tell the server to listen on the given port and log a message to the console (so we can see our server is doing something!)
.then(() => app.listen(API_PORT, () => console.log(`Listening on localhost: ${API_PORT}`)))
.catch(err => console.log(`Could not start server`, err))