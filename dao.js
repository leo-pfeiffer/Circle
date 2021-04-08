const MongoClient = require('mongodb').MongoClient;

//build our url from our config file info
const config = require('./config-db.js');
const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const client = new MongoClient(url, { useUnifiedTopology: true });
let collection = null; //we will give this a value after we connect to the database

const user_data = [{ userName:"A", userEmail: 'Toy Story'},
    { userName:"B", userEmail: 'Monsters Inc'},
    { userName:"C", userEmail: 'Wall-E'},
    { userName:"D", userEmail: 'Finding Nemo' }]; 

client.connect()
.then(conn => {
    //if the collection does not exist it will automatically be created
    collection = client.db().collection(config.collection);
    console.log("Connected!", conn.s.url.replace(/:([^:@]{1,})@/, ':****@')) 
})
.catch(err => { console.log(`Could not connect to ${url.replace(/:([^:@]{1,})@/, ':****@')}`, err);  throw err; })