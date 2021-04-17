//build our url from our config file info
const config = require('./config-db.js');
const MongoClient = require('mongodb').MongoClient;
const fullurl = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const sanitisedUrl = fullurl.replace(/:([^:@]{1,})@/, ':****@');

const client = new MongoClient(fullurl, { useUnifiedTopology: true });
let collection = null; //we will give this a value after we connect to the database

const test_data = [{ userName: "A", userEmail: 'abc@gmail.com' },
{ userName: "B", userEmail: 'bcd@gmail.com' }];

const user_data= config.collection[0];
const communities_data = config.collection[1];
const threads_data = config.collection[2];
const comments_data = config.collection[3];
const events_data = config.collection[4];


//initialise the database
let init = function () {
    return client.connect()
        .then(conn => {
            //if the collection does not exist it will automatically be created
            user_collection = client.db().collection(user_data);
            communities_collection = client.db().collection(communities_data);
            threads_collection = client.db().collection(threads_data);
            comments_collection = client.db().collection(comments_data);
            events_collection = client.db().collection(events_data);

            //for testing
            collection = client.db().collection('test_collection');
            console.log("Connected!", sanitisedUrl, 'collection name:', user_data);
        })
        .catch(err => {
            console.log(`Could not connect to ${sanitisedUrl}`, err);
            throw err;
        })
        .then(() => collection.insertMany(test_data))
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

//get all data stored in test_data
let getUser = function () {
    return collection.find({}).toArray()
        .then(users => users.map(user => User.fromJSON(user)));
}

//adding User object to db
let addUser = function (user) {
    return user_collection.insertOne(user)
        .then(res => res.insertedId);
}

//adding Community object to db
let addCommunity = function (community) {
    return communities_collection.insertOne(community)
        .then(res => {
            console.log('success')
            return res.insertedId
        });
}

//adding Thread object to db
let addThread = function (thread) {
    return threads_collection.insertOne(thread)
    .then(res =>  res.insertedId);
}


module.exports = {
    init: init,
    getUser: getUser,
    addUser: addUser,
    addCommunity: addCommunity,
    addThread: addThread
};