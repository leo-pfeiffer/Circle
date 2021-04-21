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
            // if the collection does not exist it will automatically be created
            users_collection = client.db().collection(users_data);
            communities_collection = client.db().collection(communities_data);
            user_passwords_collection = client.db().collection(user_passwords_data);

            console.log("Connected to database @", sanitisedUrl);

        }).then(async () => {
            // create indexes to allow search: https://docs.mongodb.com/manual/text-search/
            // remove existing indexes to avoid duplication
            return communities_collection.dropIndexes().then(() => {
                // create index for community search
                return communities_collection.createIndex(
                    {
                        description: "text",
                        communityName: "text",
                        tags: "text",
                    })
            })

        }).then(() => {

            // drop indexes to avoid duplication
            return users_collection.dropIndexes().then(() => {
                // create index for user search
                return users_collection.createIndex(
                    {
                        userName: "text",
                        location: "text",
                        interests: "text",
                    }
                )
            })

        })
        .catch(err => {
            console.log(`Could not connect to ${sanitisedUrl}`, err);
            throw err;
        })
}

/**
 * Returns community by its ID
 * @param {string} communityId
 * @return {Promise}
 * */
let getCommunityById = function (communityId) {
    return communities_collection.find({"id": communityId})
}

/**
 * Returns all communities from an array by their ID
 * @param {Array<string>} communityIds
 * @return {Promise}
 * */
let getCommunitiesById = function (communityIds) {
    return communities_collection.find({"id": {$in: communityIds}})
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

/**
 * Returns n most recently active communities
 * @param {string} userId
 * @param {Number} n
 * @return {Promise}
 * */
let getMostRecentCommunities = async function(userId, n) {

    const pipeline = [
        {$match: {"users.id": userId}},
        {$sort: {"threads.comments.datetime": -1}},
        // only show n entries
        {$limit: n}
    ]

    return communities_collection.aggregate(pipeline)
}

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
 * Add User to a commnunity
 * @param {string} communityId
 * @param {User} user
 * @return {Promise}
 * */
let addUserToCommunity = function (communityId, user) {

    return communities_collection.updateOne(
        { id: communityId },
        { $push: { users: user } }
    )
}

/**
 * Remove User from a commnunity
 * @param {string} communityId
 * @param {User} user
 * @return {Promise}
 * */
let removeUserFromCommunity = function (communityId, user) {

    return communities_collection.updateOne(
        { id: communityId },
        { $pull: { users: user } }
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
 * Returns event by its ID
 * @param {string} eventId
 * @return {Promise}
 * */
let getEventById = function (eventId) {

    const pipeline = [
        {$unwind: {path: "$events"}},
        {$match: {"events.id": eventId}},
        {$project: {"events": 1, _id: 0}}
    ]
    return communities_collection.aggregate(pipeline)
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
 * Remove an event from a community.
 * @param {string} communityId
 * @param {Event} event
 * @return {Promise}
 * */
let removeEvent = function (communityId, event) {
    return communities_collection.updateOne(
        { id: communityId },
        { $pull: { events: event } }
    )
}

/**
 * add tag to community.
 * @param {string} communityId
 * @param {string} tag
 * @return {Promise}
 * */
let addTag = function (communityId, tag) {
    return communities_collection.updateOne(
        { id: communityId },
        { $push: { tags: tag } }
    )
}

/**
 * remove tag from community.
 * @param {string} communityId
 * @param {string} tag
 * @return {Promise}
 * */
let removeTag = function (communityId, tag) {
    return communities_collection.updateOne(
        { id: communityId },
        { $pull: { tags: tag } }
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
 * Get the search results for a query.
 * @param {string} searchTerm
 * @return {Promise}
 * */
const getSearchResults = async function(searchTerm) {
    const userResults = await users_collection.find( { $text: { $search: searchTerm } } ).toArray()
    const communityResults = await communities_collection.find( { $text: { $search: searchTerm } } ).toArray()
    return {
        userResults: userResults,
        communityResults: communityResults
    }
}

/**
 * Get all Events of the communities the user is a member of.
 * @param {string} userId
 * @return {Promise}
 * */
const getUserEvents = async function(userId) {
    const pipeline = [
        {
            $match: {"users.id": userId}
        },
        {
            $unwind: {path: "$events"}
        },
        {
            $group: {_id: "$events", communityId: {$first: "$id"}, communityName: {$first: "$communityName"}}
        },
    ]
    return communities_collection.aggregate(pipeline);
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
 * Returns total number of comments posted by a user.
 * @param {string} userId
 * @return {Promise}
 * */
 let getNumberComments = async function(userId) {
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
        {
            $group: {_id: "$threads.comments", communityId: {$first: "$id"}, communityName: {$first: "$communityName"}}
        },
        {
            $count: "commentCount"
        }
    ]
    return communities_collection.aggregate(pipeline);
}

/**
 * Returns total number of comments of a community.
 * @param {string} communityId
 * @return {Promise}
 * */
let getNumberCommentsOfCommunity = async function(communityId) {
    const pipeline = [
        {
            $match: {"id": communityId}
        },
        {
            $unwind: {path: '$threads'}
        },
        {
            $unwind: {path: '$threads.comments'}
        },
        {
            $group: {_id: "$threads.comments", communityId: {$first: "$id"}, communityName: {$first: "$communityName"}}
        },
        {
            $count: "commentCount"
        }
    ]
    return communities_collection.aggregate(pipeline);
}

/**
 * Returns total number of threads opened by a user.
 * @param {string} userId
 * @return {Promise}
 * */
 let getNumberThreads = async function(userId) {
    const pipeline = [
        {
            $match: {"users.id": userId}
        },
        {
            $unwind: {path: '$threads'}
        },
        {
            $group: {_id: "$threads", communityId: {$first: "$id"}, communityName: {$first: "$communityName"}}
        },
        {
            $count: "threadCount"
        }
    ]
    return communities_collection.aggregate(pipeline);
}

/**
 * Returns total number of threads of a community
 * @param {string} communityId
 * @return {Promise}
 * */
 let getNumberThreadsOfCommunity = async function(communityId) {
    const pipeline = [
        {
            $match: {"id": communityId}
        },
        {
            $unwind: {path: '$threads'}
        },
        {
            $group: {_id: "$threads", communityId: {$first: "$id"}, communityName: {$first: "$communityName"}}
        },
        {
            $count: "threadCount"
        }
    ]
    return communities_collection.aggregate(pipeline);
}

/**
 * Returns total number of events of a community
 * @param {string} communityId
 * @return {Promise}
 * */
 let getNumberEventsOfCommunity = async function(communityId) {
    const pipeline = [
        {
            $match: {"id": communityId}
        },
        {
            $unwind: {path: '$events'}
        },
        {
            $group: {_id: "$threads", communityId: {$first: "$id"}, communityName: {$first: "$communityName"}}
        },
        {
            $count: "eventCount"
        }
    ]
    return communities_collection.aggregate(pipeline);
}

/**
 * Handler function to GET all tags of all communities.
 * @param {string} communityId
 * @return {Promise}
 * */
 const getAllCommunityTags = async function(communityId) {

    const pipeline = [
        {
            $match: {"id": communityId}
        },
        // unwind the tags
        {
            $unwind: {path: "$tags"}
        },
        // group tags by community id 
        {
            $group: {_id: "$tags", communityId: {$first: "$id"}, communityTags: {$first: "$tags"}}
        },
    ]

    return communities_collection.aggregate(pipeline);
}

/**
 * Get all communities with their tags for the Levenshtein algorithm.
 * @return {Promise}
 * */
const getCommunityTagsForLevenshtein = async function() {
    return communities_collection.find({}, {_id: 0, id: 1, tags: 1}).toArray();
}


/**
 * Get all communities the user is a member of.
 * @param {string} userId
 * @return {Promise}
 * */
 const getMemberCommunities = async function(userId) {
    return communities_collection.find({"users.id": userId}, {'communityId': 1, _id: 0}).toArray();
}

/**
 * Get all communities the user is the owner of.
 * @param {string} userId
 * @return {Promise}
 * */
const getOwnedCommunities = async function(userId) {
    return communities_collection.find({"admin.id": userId}, {'communityId': 1, _id: 0}).toArray();
}

/**  Get an entire user object by name.
 * @param {string} userName
 * @return {Promise}
 */
let getUserObjectByName = function (userName) {
    return users_collection.find({ "userName" :  userName}).toArray()
};

// Commented out because server side is missing
// /**
//  * Update user information from profile view. 
//  * @param {string} userName
//  * @return {Promise}
//  * */
//  let updateUserInfo = function (userId) {
//     return users_collection.update(
//         { "user.id": userId },
//         { $set: 
//             { 
//                 "users.$.userEmail": newEmail,
//                 "users.$.age": newAge,
//                 "users.$.location": newLocation, 
//                 "users.$.status": newStatus,
//                 "users.$.picture": newPicture,
//             }
//         }
//     )
// };

/** Register a new user
* @param {string} userName
* @return {Promise}
*/
let registerNewUserPassword = function(username, password) {
    return user_passwords_collection.insertOne({userName: username, password: password})
}

/**
 * Authenticate a new user.
 * */
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
    addUserToCommunity: addUserToCommunity,
    removeUserFromCommunity: removeUserFromCommunity,
    addComment: addComment,
    getUserObjectByName: getUserObjectByName,
    addEvent: addEvent,
    removeEvent: removeEvent,
    getEventById: getEventById,
    getCommunityById: getCommunityById,
    getCommunitiesById: getCommunitiesById,
    getThreadsOfCommunity: getThreadsOfCommunity,
    dropCollections: dropCollections,
    getPageRankCommunities: getPageRankCommunities,
    getSearchResults: getSearchResults,
    getUserEvents: getUserEvents,
    getUserObject: getUserObject,
    getMostRecentComments: getMostRecentComments,
    getMostRecentCommunities: getMostRecentCommunities,
    getUserEventsOfCommunity: getUserEventsOfCommunity,
    getNumberComments: getNumberComments,
    getNumberCommentsOfCommunity: getNumberCommentsOfCommunity,
    getNumberThreads: getNumberThreads,
    getNumberThreadsOfCommunity: getNumberThreadsOfCommunity,
    getNumberEventsOfCommunity: getNumberEventsOfCommunity,
    getAllCommunityTags: getAllCommunityTags,
    registerNewUserPassword: registerNewUserPassword,
    authenticateUser: authenticateUser,
    getMemberCommunities: getMemberCommunities,
    getOwnedCommunities: getOwnedCommunities,
    addTag: addTag,
    removeTag: removeTag,
    getCommunityTagsForLevenshtein: getCommunityTagsForLevenshtein,
    //updateUserInfo: updateUserInfo,
};