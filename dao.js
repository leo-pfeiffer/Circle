/**This file contains the functions to initialise the database, set up the collections and indexing. It also contains all the database queries which are run by the handler functions in server.js.
 */

/**
 * Building the url from the config file info.
 * @type {MongoClient}
 * */
const config = require('./config-db.js');
const MongoClient = require('mongodb').MongoClient;
const fullurl = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const sanitisedUrl = fullurl.replace(/:([^:@]{1,})@/, ':****@');

const client = new MongoClient(fullurl, { useUnifiedTopology: true });

/**
 * Retrieving the collection names from config.db file.
 * @type {Collection}
 * */
const users_data = config.collection.user_data;
const communities_data = config.collection.communities_data;
const user_passwords_data = config.collection.user_passwords;

/**
 * MongoDB collections.
 * @type {Collection}
 * */
let users_collection, communities_collection, user_passwords_collection

/**
 * Initialise the database.
 * @type {init}
 * */
let init = function () {
    return client.connect()
        .then(conn => {
            // if the collection does not exist it will automatically be created
            users_collection = client.db().collection(users_data);
            communities_collection = client.db().collection(communities_data);
            user_passwords_collection = client.db().collection(user_passwords_data);

            console.log("Connected to database @", sanitisedUrl);

        })
        .then(() => createUserIndex())
        .then(() => createCommunityIndex())
        .catch(err => {
            console.log(`Could not connect to ${sanitisedUrl}`, err);
            throw err;
        })
}

/**
 * Set up community indexes.
 * */
const createCommunityIndex = function() {
    // create indexes to allow search: https://docs.mongodb.com/manual/text-search/
    return communities_collection.createIndex(
        {
            description: "text",
            communityName: "text",
            tags: "text",
        })
        .then((result) => console.log('created index', result))
        .catch(err => console.log('failed to create index', err))
}

/**
 * Set up user indexes.
 * */
const createUserIndex = function() {
    return users_collection.createIndex(
        {
            userName: "text",
            location: "text",
            interests: "text",
        })
        .then((result) => console.log('created index', result))
        .catch(err => console.log('failed to create index', err))
}

/**
 * Returns community by its ID.
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
 * Add comment to a thread.
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
 * Add tag to community.
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
 * Remove tag from community.
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
 * Get all events of the communities the user is a member of.
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
 * Get all Events of a specific community.
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
 * Add tag to user.
 * @param {string} userId
 * @param {string} tag
 * @return {Promise}
 * */
 let addTagUser = function (userId, tag) {
    return users_collection.updateOne(
        { id: userId},
        { $push: { interests: tag } }
    )
}

/**
 * Remove tag from user.
 * @param {string} userId
 * @param {string} tag
 * @return {Promise}
 * */
let removeTagUser = function (userId, tag) {
    return users_collection.updateOne(
        { id: userId },
        { $pull: { interests: tag } }
    )
}

/**
 * Returns total number of comments posted by a user.
 * @param {string} userId
 * @return {Promise}
 * */
 let getNumberComments = async function(userId) {

    const pipeline = [
        // match
        {
            $match: {
                "users.id": userId
            },
        },
        {
            $unwind: {
                path: '$threads'
            }
        },
        {
            $unwind: {
                path: '$threads.comments'
            }
        },
        {
            $match: {
                "threads.comments.author.id": userId
            },
        },
        {
            $group: {
                _id: "$communityName",
                communityId: {$first: "$id"},
                communityName: {$first: "$communityName"},
                commentCount: {$sum: 1}
            }
        },
        {
            $project: {
                _id: 0
            }
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
        // match
        {
            $match: {
                "users.id": userId
            },
        },
        // unwind the user array
        {
            $unwind: {
                path: '$threads'
            }
        },
        {
            $match: {
                "threads.author.id": userId
            },
        },
        {
            $group: {
                _id: "$communityName",
                communityId: {$first: "$id"},
                communityName: {$first: "$communityName"},
                threadCount: {$sum: 1}
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ]
    return communities_collection.aggregate(pipeline);
}

/**
 * Returns total number of threads of a community.
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
 * Returns total number of events of a community.
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
 * Get all communities with their tags for the Levenshtein algorithm (except the ones where user is already member).
 * @param {string} userId
 * @return {Promise}
 * */
const getCommunityTagsForLevenshtein = async function(userId) {
    return communities_collection.find({'users.id': {$ne: userId}}, {_id: 0, id: 1, tags: 1}).toArray();
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

/**
 * Update user information from profile view. 
 * @param {string} userId
 * @param {string} newEmail
 * @param {string} newAge
 * @param {string} newLocation
 * @return {Array<Promise>}
 * */
 let updateUserInfo = async function (userId, newEmail, newAge, newLocation) {

     // Update user
    let userUpdateResult = await users_collection.updateOne(
        { "id": userId },
        { $set:
                {
                    "userEmail": newEmail,
                    "age": newAge,
                    "location": newLocation,
                }
        })

    // Update community users
    let communitiesUpdateResult = await communities_collection.updateMany(
        { "users.id": userId },
        { $set:
                {
                    "users.$[elem].userEmail": newEmail,
                    "users.$[elem].age": newAge,
                    "users.$[elem].location": newLocation,
                }
        },
        {
            arrayFilters: [ { "elem.id":  userId} ]
        }
    )

    // update community admin
    let communitiesAdminUpdateResult = await communities_collection.updateMany(
        { "admin.id": userId },
        {
            $set:
                {
                    "userEmail": newEmail,
                    "age": newAge,
                    "location": newLocation,
                }
        }
    )

    // update event organiser
    let communitiesEventOrganiserUpdateResult = await communities_collection.updateMany(
        { "events.organiser.id": userId },
        { $set:
                {
                    "events.$[elem].organiser.userEmail": newEmail,
                    "events.$[elem].organiser.age": newAge,
                    "events.$[elem].organiser.location": newLocation,
                }
        },
        {
            arrayFilters: [ { "elem.organiser.id":  userId} ]
        }
    )

    return [userUpdateResult, communitiesUpdateResult, communitiesAdminUpdateResult, communitiesEventOrganiserUpdateResult]
};

/**
 * Update user profile picture from profile view. 
 * @param {string} userId
 * @param {image} newPicture
 * @return {Array<Promise>}
 * */
 let updateUserProfilePicture = async function (userId, newPicture) {

    // Update user
   let userUpdateResult = await users_collection.updateOne(
       { "id": userId },
       { $set:
               {
                   "picture": newPicture,
               }
       })

   // Update community users
   let communitiesUpdateResult = await communities_collection.updateMany(
       { "users.id": userId },
       { $set:
               {
                   "users.$[elem].picture": newPicture,
               }
       },
       {
           arrayFilters: [ { "elem.id":  userId} ]
       }
   )

   // update community admin
   let communitiesAdminUpdateResult = await communities_collection.updateMany(
       { "admin.id": userId },
       {
           $set:
               {
                   "picture": newPicture,
               }
       }
   )

   // update event organiser
   let communitiesEventOrganiserUpdateResult = await communities_collection.updateMany(
       { "events.organiser.id": userId },
       { $set:
               {
                   "events.$[elem].organiser.picture": newPicture,
               }
       },
       {
           arrayFilters: [ { "elem.organiser.id":  userId} ]
       }
   )

   return [userUpdateResult, communitiesUpdateResult, communitiesAdminUpdateResult, communitiesEventOrganiserUpdateResult]
};

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
const dropCollections = async function() {
    await users_collection.drop().catch(err => console.log(err))
    await communities_collection.drop().catch(err => console.log(err))
    await user_passwords_collection.drop().catch(err => console.log(err))
}

/**
 * Export all modules required for handler functions in server.js
 */
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
    addTagUser: addTagUser,
    removeTagUser: removeTagUser,
    updateUserInfo: updateUserInfo,
    updateUserProfilePicture: updateUserProfilePicture,
    createUserIndex: createUserIndex,
    createCommunityIndex: createCommunityIndex,
};