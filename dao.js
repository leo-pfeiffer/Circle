//build our url from our config file info
const config = require('./config-db.js');
const MongoClient = require('mongodb').MongoClient;
const fullurl = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const sanitisedUrl = fullurl.replace(/:([^:@]{1,})@/, ':****@');

const client = new MongoClient(fullurl, { useUnifiedTopology: true });

//retrieving collection names from config.db file
const users_data = config.collection[0];
const communities_data = config.collection[1];
const threads_data = config.collection[2];
const comments_data = config.collection[3];
const events_data = config.collection[4];

/**
 * MongoDB collections.
 * @type {Collection}
 * */
let collection, users_collection, communities_collection, threads_collection, comments_collection, events_collection

//=== test data ===
//this is added to the DB everytime the program runs 
const test_data = [{ userName: "A", userEmail: 'abc@gmail.com' },
{ userName: "B", userEmail: 'bcd@gmail.com' }];

//initialise the database
let init = function () {
    return client.connect()
        .then(conn => {
            //if the collection does not exist it will automatically be created
            users_collection = client.db().collection(users_data);
            communities_collection = client.db().collection(communities_data);
            threads_collection = client.db().collection(threads_data);
            comments_collection = client.db().collection(comments_data);
            events_collection = client.db().collection(events_data);

            //for testing
            collection = client.db().collection('test_collection');
            console.log("Connected!", sanitisedUrl, 'collection name:', users_data);
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

/**
 * Insert User object into DB.
 * @param {User} user
 * @return {Promise}
 * */
const addUser = function (user) {
    return users_collection.insertOne(user)
        .then(res => res.insertedId);
}

/**
 * Insert many User objects into DB.
 * @param {Array<User>} users
 * @return {Promise}
 * */
const addUsers = function (users) {
    return users_collection.insertMany(users)
        .then(res => res.insertedId);
}

/**
 * Insert Community object into DB.
 * @param {Community} community
 * @return {Promise}
 * */
let addCommunity = function (community) {
    return communities_collection.insertOne(community)
        .then(res => {
            return res.insertedId
        });
}

/**
 * Insert many Community objects into DB.
 * @param {Array<Community>} communities
 * @return {Promise}
 * */
let addCommunities = function (communities) {
    return communities_collection.insertMany(communities)
        .then(res => res.insertedIds);
}

/**
 * Insert Thread object into DB.
 * @param {Thread} thread
 * @return {Promise}
 * */
let addThread = function (thread) {
    return threads_collection.insertOne(thread)
        .then(res => {
            return res.insertedId
        });
}

/**
 * Insert Comment object into DB.
 * @param {Comment} comment
 * @return {Promise}
 * */
let addComment = function (comment) {
    return comments_collection.insertOne(comment)
        .then(res => {
            return res.insertedId
        });
}

/**
 * Insert Event object into DB.
 * @param {Event} event
 * @return {Promise}
 * */
let addEvent = function (event) {
    return events_collection.insertOne(event)
        .then(res => {
            return res.insertedId
        });
}

/**
 * Get the communities required for the PageRank algorithm for a specific user.
 * @param {string} userId
 * @return {Promise}
 * */
const getPageRankCommunities = async function(userId) {

    // aggregation pipeline to get all users that are in communities with the user with userId.
    const pipeline = [
        // match user
        {
            $match: {"users.id": userId},
        },
        // unwind the user array
        {
            $unwind: {path: '$users'}
        },
        // return user id as ID
        {
            $group: {_id: "$users",}
        },
        {
            $project: {
                "_id.id": 1,
                "_id.interests": 1,
            }
        }
    ]

    // perform aggregation
    const aggCursor = communities_collection.aggregate(pipeline);

    const users = []

    // fetch results of aggregation
    await aggCursor.forEach(community => {
        users.push(community._id)
    });

    // query all communities of the users found in the previous step
    const query = {
        "users.id": {
            $in: users.map(el => el.id)
        }
    }

    const projection = {
        fields: {
            _id: 0,
            id: 1,
            admin: 1,
            communityName: 1,
            users: 1,
            tags: 1
        }
    }

    const communityCursor = communities_collection.find(query, projection)

    const communities = [];

    // fetch the results
    await communityCursor.forEach(community => {
        communities.push(community)
    })

    return communities
}

/**
 * Get all Events of the communities the user is a member of.
 * @param {string} userId
 * @return {Promise}
 * */
const getUserEvents = async function(userId) {
    const eventsRaw = communities_collection.find({ "users.id" :  userId}, {'events': 1, _id: 0})

    const events = [];
    await eventsRaw.forEach(arr => {
        arr.events.forEach((event) => {
            let newEvent = Event.fromJSON(event)
            if (!events.map(el => el.id).includes(newEvent.id))
                events.push(newEvent);
        })
    })

    return events;
}

/**
 * Drop all data collections.
 * WARNING: This cannot be undone!
 * */
const dropCollections = function() {
    let collections = [
        users_data,
        communities_data,
        threads_data,
        comments_data,
        events_data,
        'test_collection',
        'collection'
    ]

    // drop the collections if they exist
    return collections.forEach((col) => {
        client.db().listCollections({name: col})
            .next((err, collectionInfo) => {
                if (collectionInfo) {
                    client.db().collection(col).drop()
                }
            });
    })
}

//exporting modules
module.exports = {
    init: init,
    addUser: addUser,
    addUsers: addUsers,
    addCommunity: addCommunity,
    addCommunities: addCommunities,
    addThread: addThread,
    addComment: addComment,
    addEvent: addEvent,
    getUser: getUser,
    getCommunity: getCommunity,
    getThread: getThread,
    getComment: getComment,
    getEvent: getEvent,
    dropCollections: dropCollections,
    getPageRankCommunities: getPageRankCommunities,
    getUserEvents: getUserEvents,
};