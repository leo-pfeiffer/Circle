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
const user_passwords_data = config.collection[5];

/**
 * MongoDB collections.
 * @type {Collection}
 * */
let collection, users_collection, communities_collection, user_passwords_collection

//=== test data ===
//this is added to the DB everytime the program runs 
const test_data = [{ userName: "A", userEmail: 'abc@gmail.com' },
{ userName: "B", userEmail: 'bcd@gmail.com' }];

/**
 * Initialise the database.
 * */
let init = function () {
    return client.connect()
        .then(conn => {
            //if the collection does not exist it will automatically be created
            users_collection = client.db().collection(users_data);
            communities_collection = client.db().collection(communities_data);
            user_passwords_collection = client.db().collection(user_passwords_data);

            // todo obsolete
            // events_collection = client.db().collection(events_data);
            // comments_collection = client.db().collection(comments_data);
            // threads_collection = client.db().collection(threads_data);

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

// /**
//  * TODO LIKELY OBSOLETE
//  * Returns all data stored in users_collection.
//  * @param {Array<User>} users
//  * @return {Promise}
//  * */
// let getUser = function () {
//     return users_collection.find({}).toArray()
//         .then(users => users.map(user => User.fromJSON(user)));
// }

/**
 * Returns all data stored in communities_collection
 * @param {string} communityId
 * @return {Promise}
 * */
let getCommunityById = function (communityId) {
    return communities_collection.find({"id": communityId})
}

/**
 * Returns threads of a community
 * @param {string} communityId
 * @return {Promise}
 * */
let getThreadsOfCommunity = function (communityId) {

    const pipeline = [
        {
            $match: {"id": communityId}
        },
        // unwind the threads
        {
            $unwind: {path: "$threads"}
        },
        // group, but keep some community info
        {
            $group: {_id: "$threads", communityId: {$first: "$id"}, communityName: {$first: "$communityName"}}
        },
    ]

    return communities_collection.aggregate(pipeline);
}

/**
 * Returns n most recent comments
 * @param {string} userId
 * @param {Number} n
 * @return {Promise}
 * */
let getMostRecentComments = async function(userId, n) {

    const pipeline = [
        {
            $match: {"users.id": userId}
        },
        {
            $unwind: {path: '$threads'}
        },
        {
            $unwind: {path: '$threads.comments'}
        },
        // group, but keep some community info
        {
            $group: {_id: "$threads", communityId: {$first: "$id"}, communityName: {$first: "$communityName"}}
        },
        // sort in descending order
        {
            $sort: {"_id.comments.datetime": -1}
        },
        // keep only communityName, communityId, threadId, threatTitle, comment
        {
            $project: {
                "communityName": 1,
                "communityId": 1,
                "_id.id": 1,
                "_id.title": 1,
                "_id.comments": 1,
            }
        },
        // only show n entries
        {
            $limit: n
        }
    ]

    return communities_collection.aggregate(pipeline)
}

// /**
//  * // todo this is likely unnecessary => if not, get from community collection
//  * Returns all data stored in comments_collection
//  * @param {Array<Comment>} comments
//  * @return {Promise}
//  * */
// let getComment = function () {
//     return comments_collection.find({}).toArray()
//         .then(comments => comments.map(comment => Comment.fromJSON(comment)))
//         .catch(err=>console.log("Could not find",err.message));
// }

// /**
//  * TODO LIKELY OBSOLETE
//  * Returns all data stored in events_collection
//  * @param {Array<Event>} events
//  * @return {Promise}
//  * */
// let getEvent = function () {
//     return events_collection.find({}).toArray()
//         .then(events => events.map(event => Event.fromJSON(event)))
//         .catch(err=>console.log("Could not find",err.message));
// }

/**
 * Insert User object into DB.
 * @param {User} user
 * @return {Promise}
 * */
const addUser = function (user) {
    return users_collection.insertOne(user)
        .then(res => res.insertedId)
        .catch(err => {
            console.log("Could not add data ", err.message)
        })
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
 * @param {string} communityId
 * @param {Thread} thread
 * @return {Promise}
 * */
let addThreadToCommunity = function (communityId, thread) {

    return communities_collection.updateOne(
        { id: communityId },
        { $push: { threads: thread } }
    )
}

/**
 * add comment to a thread.
 * @param {Comment} comment
 * @param {string} threadId
 * @return {Promise}
 * */
let addComment = function (comment, threadId) {
    return communities_collection.updateOne(
        { "threads.id": threadId },
        { $push: { "threads.$.comments": comment } }
    )
}

/**
 * Insert Event object into DB.
 * @param {string} communityId
 * @param {Event} event
 * @return {Promise}
 * */
let addEvent = function (communityId, event) {
    return communities_collection.updateOne(
        { id: communityId },
        { $push: { events: event } }
    )
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
    return communities_collection.find({"users.id": userId}, {'events': 1, _id: 0});
}

/**
 * Handler function to GET all Events of a specific community.
 * @param {string} userId
 * @param {string} communityId
 * @return {Promise}
 * */
const getUserEventsOfCommunity = async function(userId, communityId) {

    const pipeline = [
        {
            $match: {"users.id": userId, "id": communityId}
        },
        // unwind the events
        {
            $unwind: {path: "$events"}
        },
        // group, but keep some community info
        {
            $group: {_id: "$events", communityId: {$first: "$id"}, communityName: {$first: "$communityName"}}
        },
    ]

    return communities_collection.aggregate(pipeline);
}

/**
 * Get an entire user object.
 * @param {string} userId
 * @return {Promise}
 * */
 let getUserObject = async function (userId) {
    return users_collection.findOne({ "id" :  userId})
};

/**
 * Get an entire user object by name.
 * @param {string} userName
 * @return {Promise}
 * */
let getUserObjectByName = function (userName) {
    return user_passwords_collection.find({ "userName" :  userName}).toArray()
};

let registerNewUserPassword = function(username, password) {
    return user_passwords_collection.insertOne({userName: username, password: password})
}

let authenticateUser = async function(username, password) {
    let results = await user_passwords_collection.find({userName: username, password: password}).toArray()
    let length = results.length
    return length === 1;
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
        user_passwords_data,
        'test_collection',
        'collection'
    ]

    // drop the collections if they exist
    return collections.forEach((col) => {
        client.db().listCollections({name: col})
            .next((err, collectionInfo) => {
                if (collectionInfo) {
                    console.log(col)
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
    addThreadToCommunity: addThreadToCommunity,
    addComment: addComment,
    getUserObjectByName: getUserObjectByName,
    addEvent: addEvent,
    // getUser: getUser,
    getCommunityById: getCommunityById,
    getThreadsOfCommunity: getThreadsOfCommunity,
    // getComment: getComment,
    // getEvent: getEvent,
    dropCollections: dropCollections,
    getPageRankCommunities: getPageRankCommunities,
    getUserEvents: getUserEvents,
    getUserObject: getUserObject,
    getMostRecentComments: getMostRecentComments,
    getUserEventsOfCommunity: getUserEventsOfCommunity,
    registerNewUserPassword: registerNewUserPassword,
    authenticateUser: authenticateUser
};