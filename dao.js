//build our url from our config file info
const config = require('./config-db.js');
const MongoClient = require('mongodb').MongoClient;
const fullurl = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const sanitisedUrl = fullurl.replace(/:([^:@]{1,})@/, ':****@');

const client = new MongoClient(fullurl, { useUnifiedTopology: true });
let collection = null; //we will give this a value after we connect to the database

const user_data = [{ userName: "A", userEmail: 'abc@gmail.com' },
{ userName: "B", userEmail: 'bcd@gmail.com' }];

// client.connect()
// .then(conn => {
//     //if the collection does not exist it will automatically be created
//     collection = client.db().collection(config.collection);
//     console.log("Connected!", conn.s.fullurl.replace(/:([^:@]{1,})@/, ':****@')) 
// })
// .catch(err => { console.log(`Could not connect to ${fullurl.replace(/:([^:@]{1,})@/, ':****@')}`, err);  throw err; })

//initialise the database
let init = function () {
    return client.connect()
        .then(conn => {
            //if the collection does not exist it will automatically be created
            collection = client.db().collection(config.collection);
            console.log("Connected!", sanitisedUrl);
        })
        .catch(err => {
            console.log(`Could not connect to ${sanitisedUrl}`, err);
            throw err;
        })
        .then(() => collection.insertMany(user_data))
        .then(res => console.log("Data inserted with two users", res.insertedIds))
        .catch(err => {
            console.log("Could not add data ", err.message);
            //For now, ingore duplicate entry errors, otherwise re-throw the error for the next catch
            if (err.name != 'BulkWriteError' || err.code != 11000) {
                client.close();
                throw err;
            }
        })
}

//get all data stored in user_data
let getUser = function () {
    return collection.find({}).toArray()
        .then(users => users.map(user => User.fromJSON(user)));
}

//adding User object to db
let addUser = function (user) {
    return collection.insertOne(user)
        .then(res => res.insertedId);
}

module.exports = {
    init: init,
    getUser: getUser,
    addUser: addUser
};