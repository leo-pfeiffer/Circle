//build our url from our config file info
const config = require('./config-db.js');
const MongoClient = require('mongodb').MongoClient;
const fullurl = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const sanitisedUrl = fullurl.replace(/:([^:@]{1,})@/, ':****@');

const client = new MongoClient(fullurl, { useUnifiedTopology: true });
let collection = null; //we will give this a value after we connect to the database

//retrieving collection names from config.db file
const user_data = config.collection[0];
const communities_data = config.collection[1];
const threads_data = config.collection[2];
const comments_data = config.collection[3];
const events_data = config.collection[4];

//=== test data ===
//this is added to the DB everytime the program runs 
const test_data = [{ userName: "A", userEmail: 'abc@gmail.com' },
{ userName: "B", userEmail: 'bcd@gmail.com' }];

//initialise the database
let init = function () {
    return client.connect()
        .then(conn => {
            //if the collection does not exist it will automatically be created
            users_collection = client.db().collection(user_data);
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

//returns all data stored in users_collection
let getUser = function () {
    return users_collection.find({}).toArray()
        .then(users => users.map(user => User.fromJSON(user)));
}

//returns all data stored in communities_collection
let getCommunity = function () {
    return communities_collection.find({}).toArray()
        .then(communities => communities.map(community => Community.fromJSON(community)));
}

//returns all data stored in threads_collection
let getThread = function () {
    return threads_collection.find({}).toArray()
        .then(threads => threads.map(thread => Thread.fromJSON(thread)));
}

//returns all data stored in comments_collection
let getComment = function () {
    return comments_collection.find({}).toArray()
        .then(comments => comments.map(comment => Comment.fromJSON(comment)));
}

//returns all data stored in events_collection
let getEvent = function () {
    return events_collection.find({}).toArray()
        .then(events => events.map(event => Event.fromJSON(event)));
}

//adding User object to db
let addUser = function (user) {
    return users_collection.insertOne(user)
        .then(res => res.insertedId);
}

//adding Community object to db
let addCommunity = function (community) {
    return communities_collection.insertOne(community)
        .then(res => {
            return res.insertedId
        });
}

//adding Thread object to db
let addThread = function (thread) {
    return threads_collection.insertOne(thread)
        .then(res => {
            return res.insertedId
        });
}

//adding Comment object to db 
let addComment = function (comment) {
    return comments_collection.insertOne(comment)
        .then(res => {
            return res.insertedId
        });
}

//adding Event object to db 
let addEvent = function (event) {
    return events_collection.insertOne(event)
        .then(res => {
            return res.insertedId
        });
}

//exporting modules
module.exports = {
    init: init,
    addUser: addUser,
    addCommunity: addCommunity,
    addThread: addThread,
    addComment: addComment,
    addEvent: addEvent,
    getUser: getUser,
    getCommunity: getCommunity,
    getThread: getThread,
    getComment: getComment,
    getEvent: getEvent
};