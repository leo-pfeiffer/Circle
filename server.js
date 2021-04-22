/**This file contains handler functions for all API endpoints used on the client side. 
 * 
 */

const { User, Community, Thread, Comment, Event } = require('./models')
const {PageRank, CommunityNetwork} = require("./pagerank");

const dao = require('./dao');

const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('basic-auth');
const cors = require('cors')
const axios = require('axios');

const app = express();

const http = require('http');
const auth = require('basic-auth');
const {normaliseNHighestRanks} = require("./serverUtils");
const {calculateLevenshteinScore} = require("./levenshtein");
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const API_PORT = 3000;

/**
 * Basic middleware function that is used for basic authentication upon requests that require it.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let authenticate = async function (req, res, next) {
    let loginData = basicAuth(req);

    // check DB
    let validUser = await dao.authenticateUser(loginData.name, loginData.pass);
    if (!validUser) {
        // make the browser ask for credentials if none/wrong are provided
        return res.sendStatus(401);
    }

    let userObjects = await dao.getUserObjectByName(loginData.name)
    let user = User.fromJSON(userObjects[0])

    req.username = user.userName;
    req.userId = user.id;
    next();
};

// ===== Socket IO =====
// authentication using basicAuth
io.use((socket, next) => {

    const user = socket.handshake.auth

    // todo -> check if user is in db and password is correct
    let validUser = true;

    if (!validUser) {
        return next(new Error('invalid credentials'))
    }

    socket.username = user.username;
    next();
})

// Connection handler
io.on('connection', (socket) => {
    console.log(socket.handshake.auth.username, 'connected');

    // Basic ping event handler for testing
    socket.on('ping', msg => {
        console.log('received ping from',)
        io.emit('pong', { data: 'pong' });
    })

    // Handler for join events
    socket.on('join', data => {
        if (!socket.rooms.has(data.room)) {
            socket.join(data.room);
            let text = `${socket.handshake.auth.username} joined room ${data.room}`;
            io.to(data.room).emit('notify', { data: text })
            console.log(text)
        }
    })

    // Handler for leave events
    socket.on('leave', data => {
        if (socket.rooms.has(data.room)) {
            socket.leave(data.room);
            let text = `${socket.handshake.auth.username} left room ${data.room}`;
            io.to(data.room).emit('notify', { data: text })
            console.log(text)
        }
    })

    // Handler for disconnect events
    socket.on('disconnect', (reason) => {
        console.log(socket.handshake.auth.username, 'disconnected')
    })
})


// ====== Handler functions ======

/**
 * Handler function to create a new user and add it to the database.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createUser = function (req, res, next) {
    let body = req.body;

    // Create a new instance of the class User
    let user = new User(body.userName, body.userEmail)

    //adding User instance to the database
    dao.addUser(user)
        .then((id) => {
            res.status(200).json({ msg: `Added user '${user.userName}' with id ${id}` });
        })
        .catch(err => {
            console.log(`Could not add user '${user.userName}`, err);
            res.status(400).json({ msg: `Could not add user '${user.userName}` });
        });
}

/**
 * Handler function to create a new community.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createCommunity = async (req, res, next) => {
    const communityName = req.body.communityName;
    const description = req.body.description;
    const tags = req.body.tags;
    const picture = req.body.picture;

    // deserialize the User object
    const userId = req.userId

    const admin = await dao.getUserObject(userId)
        .then((u) => {
            return User.fromJSON(u)
        }).catch(err => {
            console.log(`Could not find user`, err);
            res.status(404).json({ msg: `Could not find user` });
        });

    // create a new instance of the class Community
    const community = new Community(communityName, admin)
    community.tags = tags;
    community.picture = picture;
    community.description = description;

    //adding new Community instance to the database
    dao.addCommunity(community)
        .then((id) => {
            res.status(200).json({ msg: `Added community '${communityName}' with ID ${id}` });
        })
        .catch(err => {
            console.log(`Could not add community '${communityName}`, err);
            res.status(400).json({ msg: `Could not add community '${communityName}` });
        });
}

/**
 * Handler function to create a new thread.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createThread = async (req, res, next) => {
    let body = req.body;
    let text = body.thread.text;
    let title = body.thread.title;
    let communityId = body.communityId

    //creating new instances of class User, Community and Thread
    let userId = req.userId

    let author = await dao.getUserObject(userId)
        .then((res) => {
            return User.fromJSON(res)
        }).catch(err => {
            console.log(`Could not find user`, err);
            res.status(404).json({ msg: `Could not find user` });
        });

    let thread = new Thread(text, title, author)

    //adding new Thread to the database
    dao.addThreadToCommunity(communityId, thread).then(() => {
        res.status(200).json({ msg: `Added new thread '${thread.id}' to community ${communityId}` });
    }).catch(err => {
        console.log(`Could not add thread`, err);
        res.status(400).json({ msg: `Could not add thread` });
    });
}
/**
 * Handler function to join a community.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let joinCommunity = async (req, res, next) => {
    let communityId = req.body.communityId

    let userId = req.userId

    // get user
    let user = await dao.getUserObject(userId)
        .then((res) => {
            return User.fromJSON(res)
        }).catch(err => {
            console.log(`Could not find user`, err);
            res.status(404).json({ msg: `Could not find user` });
        });

    // add
    dao.addUserToCommunity(communityId, user).then(() => {
        res.status(200).json({ msg: `Added new user '${user.id}' to community ${communityId}` });
    }).catch(err => {
        console.log(`Could not add user`, err);
        res.status(400).json({ msg: `Could not add user` });
    });
}

/**
 * Handler function to leave a community.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let leaveCommunity = async (req, res, next) => {
    let communityId = req.body.communityId

    let userId = req.userId

    // get user
    let user = await dao.getUserObject(userId)
        .then((res) => {
            return User.fromJSON(res)
        }).catch(err => {
            console.log(`Could not find user`, err);
            res.status(404).json({ msg: `Could not find user` });
        });

    // remove
    dao.removeUserFromCommunity(communityId, user).then(() => {
        res.status(200).json({ msg: `Removed user '${user.id}' from community ${communityId}` });
    }).catch(err => {
        console.log(`Could not remove user`, err);
        res.status(400).json({ msg: `Could not remove user` });
    });
}

/**
 * Handler function to create a new comment.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createComment = async (req, res, next) => {
    let text = req.body.text;
    let threadId = req.body.threadId

    // creating new User and Comment instances
    let userId = req.userId

    let author = await dao.getUserObject(userId)
        .then((userData) => {
            return User.fromJSON(userData)
        }).catch(err => {
            console.log(`Could not find user`, err);
            res.status(404).json({ msg: `Could not find user` });
        });

    let comment = new Comment(text, author)

    //adding new Comment to database
    dao.addComment(comment, threadId)
        .then((id) => {
            res.status(200).json({ msg: `Added new comment '${comment.id}' to thread ${threadId}` });
        })
        .catch(err => {
            console.log(`Could not add comment`, err);
            res.status(400).json({ msg: `Could not add comment` });
        });
}

/**
 * Handler function to POST an event that should be added to the community. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createEvent = async (req, res, next) => {
    let body = req.body;
    let title = body.title;
    let description = body.description;

    let communityId = body.communityId
    let datetime = body.datetime;
    let location = body.location;
    let link = body.link;

    let  userId = req.userId;

    // get user
    let author = await dao.getUserObject(userId)
        .then((res) => {
            return User.fromJSON(res)
        }).catch(err => {
            console.log(`Could not find user`, err);
            res.status(404).json({ msg: `Could not find user` });
        });

    let event = new Event(title, description, author, datetime)
    event.link = link;
    event.location = location;

    //adding new Event instance to the database
    dao.addEvent(communityId, event)
        .then(() => res.status(200).json({ msg: `Added new event '${event.id}' to community ${communityId}` }))
        .catch(err => {
            console.log(`Could not add event`, err);
            res.status(400).json({ msg: `Could not add event` });
        });
}

/**
 * Handler function to POST an event that should be removed from the community. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let removeEvent = async (req, res, next) => {

    let communityId = req.body.communityId;
    let eventId = req.body.eventId;

    let cursor = dao.getEventById(eventId)
    let events = await cursor.toArray()

    if (events.length > 0) {
        let event = Event.fromJSON(events[0].events)

        dao.removeEvent(communityId, event)
            .then(() => res.status(200).json({ msg: `Removed event '${event.id}' from community ${communityId}` }))
            .catch(err => {
                console.log(`Could not remove event`, err);
                res.status(400).json({ msg: `Could not remove event` });
            });
    } else {
        res.status(400).json({msg: 'Could not get event'})
    }
}

/**
 * Handler function to POST a tag that should be added to the community. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let addTag = async (req, res, next) => {
    let body = req.body;
    let tag = body.tag;
    let communityId = body.communityId

    //adding new tag to the database
    dao.addTag(communityId, tag)
        .then(() => res.status(200).json({ msg: `Added new tag '${tag}' to community ${communityId}` }))
        .catch(err => {
            console.log(`Could not add tag`, err);
            res.status(400).json({ msg: `Could not add tag` });
        });
}

/**
 * Handler function to POST a tag that should be removed from the community. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let removeTag = async (req, res, next) => {
    let body = req.body;
    let tag = body.tag;
    let communityId = body.communityId

    //adding new tag to the database
    dao.removeTag(communityId, tag)
        .then(() => res.status(200).json({ msg: `Removed tag '${tag}' from community ${communityId}` }))
        .catch(err => {
            console.log(`Could not remove tag`, err);
            res.status(400).json({ msg: `Could not remove tag` });
        });
}

/**
 * Handler function to GET Community object by id.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getCommunityById = async function (req, res, next) {

    let communityId = req.body.communityId

    let cursor = dao.getCommunityById(communityId)
    let communities = await cursor.toArray();

    if (communities.length > 0) {
        let community = Community.fromJSON(communities[0])
        res.status(200).json(community)
    } else {
        res.status(400).json({msg: 'Could not get community'})
    }
}

/**
 * Handler function to GET Thread objects of a community.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getThreadsOfCommunity = function (req, res, next) {

    let communityId = req.body.communityId

    dao.getThreadsOfCommunity(communityId)
        .then(async function(cursor) {
            const threads = [];
            await cursor.forEach(arr => {
                let obj = {}
                obj.community = {id: arr.communityId, name: arr.communityName}
                obj.thread = new Thread(arr._id)
                threads.push(obj);
            })
            return threads
        })
        .then(threads => res.status(200).json(threads))
        .catch(err => {
            console.log(`Could not get Thread`, err);
            res.status(400).json({ msg: `Could not get Thread` });
        })
}

/**
 * Handler function to GET most recent comments.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getMostRecentComments = function (req, res, next) {

    // how many of the most recent threads to get
    let num = req.body.num;

    dao.getMostRecentComments(req.userId, num)
        .then(async function(cursor) {
            const comments = [];
            await cursor.forEach(arr => {
                let obj = {}
                obj.community = {id: arr.communityId, name: arr.communityName}
                obj.thread = {id: arr._id.id, title: arr._id.title}
                obj.comment = new Comment(arr._id.comments)
                comments.push(obj);
            })
            return comments
        })
        .then(comments => res.status(200).json(comments))
        .catch(err => {
            console.log(`Could not get Thread`, err);
            res.status(400).json({ msg: `Could not get Thread` });
        })
}

/**
 * Handler function to GET most recent communities.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getMostRecentCommunities = function (req, res, next) {

    // how many of the most recent threads to get
    let num = req.body.num;

    dao.getMostRecentCommunities(req.userId, num)
        .then(async function(cursor) {
            let communities = [];
            await cursor.forEach(com => {
                let community = Community.fromJSON(com)
                communities.push(community);
            })
            return communities
        })
        .then(communities => res.status(200).json(communities))
        .catch(err => {
            console.log(`Could not get Thread`, err);
            res.status(400).json({ msg: `Could not get most recent communities` });
        })
}

/**
 * Handler function to GET all Events of the communities the user is a member of.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getUserEvents = function (req, res, next) {

    const userId = req.userId

    dao.getUserEvents(userId)
        .then(async function(cursor) {
            const events = [];
            await cursor.forEach(arr => {
                let obj = {}
                obj.community = {communityId: arr.communityId, communityName: arr.communityName}
                obj.event = Event.fromJSON(arr._id)
                events.push(obj)
            })
            return events;
        })
        .then(events => res.status(200).json(events))
        .catch(err => {
            console.log(`Could not get events`, err);
            res.status(400).json({ msg: `Could not get events` });
        })
}

/**
 * Handler function to GET all Events of a specific community.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getUserEventsOfCommunity = function (req, res, next) {

    // todo get from auth
    const userId = req.userId
    const communityId = req.body.communityId

    dao.getUserEventsOfCommunity(userId, communityId)
        .then(async function(cursor) {
            const events = [];
            await cursor.forEach(arr => {
                let obj = {}
                obj.community = {id: arr.communityId, name: arr.communityName}
                obj.event = Event.fromJSON(arr._id)
                events.push(obj);
            })
            return events
        })
        .then(events => res.status(200).json(events))
        .catch(err => {
            console.log(`Could not get event`, err);
            res.status(400).json({ msg: `Could not get event` });
        })
}

/**
 * Handler function to GET a user object.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
 let getUserObject = function (req, res, next) {
    
    const userId = req.body.userId

    dao.getUserObject(userId)
        .then(docs => {
                if ( docs != null ) res.status(200).json(docs);
                else res.status(400).send("No such user");
            })
        .catch(err => {
            console.log(`Could not get user`, err);
            res.status(400).json({ msg: `Could not get user` });
            
        })
};

/**
 * Handler function to POST a tag that should be added to the user interests. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let addTagUser = async (req, res, next) => {
    let body = req.body;
    let tag = body.tag;
    let userId = body.userId

    //adding new tag to the database
    dao.addTagUser(userId, tag)
        .then(() => res.status(200).json({ msg: `Added new tag '${tag}' to user ${userId}` }))
        .catch(err => {
            console.log(`Could not add tag`, err);
            res.status(400).json({ msg: `Could not add tag` });
        });
}

/**
 * Handler function to POST a tag that should be removed from the user interests. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let removeTagUser = async (req, res, next) => {
    let body = req.body;
    let tag = body.tag;
    let userId = body.userId

    //adding new tag to the database
    dao.removeTagUser(userId, tag)
        .then(() => res.status(200).json({ msg: `Removed tag '${tag}' from user ${userId}` }))
        .catch(err => {
            console.log(`Could not remove tag`, err);
            res.status(400).json({ msg: `Could not remove tag` });
        });
}

/**
 * Handler function to POST updated user information.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let updateUserInfo = async (req, res, next) => {
    let body = req.body;
    let newEmail = body.newEmail;
    let newAge = body.newAge; 
    let newLocation = body.newLocation;
    let userId = body.userId;

    // adding the new info to the users_collection
    dao.updateUserInfo(userId, newEmail, newAge, newLocation)
        .then(() => res.status(200).json({ msg: `Updated user info for ${userId}` }))
        .catch(err => {
            console.log(`Could not update info`, err);
            res.status(400).json({ msg: `Could not update info` });
        });
}

/**
 * Handler function to POST a new profile picture. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let updateUserProfilePicture = async (req, res, next) => {
    let body = req.body;
    let newPicture = body.newPicture;
    let userId = body.userId;

    // adding the new picture to the users_collection
    dao.updateUserProfilePicture(userId, newPicture)
        .then(() => res.status(200).json({ msg: `Updated user picture for ${userId}` }))
        .catch(err => {
            console.log(`Could not update picture`, err);
            res.status(400).json({ msg: `Could not update picture` });
        });
}

/**
 * Handler function to GET the total number of comments a user has made. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
 let getNumberComments = function (req, res, next) {

    const userId = req.body.userId

    dao.getNumberComments(userId)
        .then(async function(cursor) {
            const numComments = [];
            await cursor.forEach(el => {
                numComments.push(el);
            })
            return numComments[0]
        })
        .then(numComments => res.status(200).json(numComments))
        .catch(err => {
            console.log(`Could not get number of comments`, err);
            res.status(400).json({ msg: `Could not get number of comments` });
        })
};

/**
 * Handler function to GET the total number of threads a user has opened. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
 let getNumberThreads = function (req, res, next) {
    
    const userId = req.userId

    dao.getNumberThreads(userId)
    .then(async function(cursor) {
        const numThreads = [];
        await cursor.forEach(el => {
            numThreads.push(el);
        })
        return numThreads[0]
    })
    .then(numThreads => res.status(200).json(numThreads))
    .catch(err => {
        console.log(`Could not get number of threads`, err);
        res.status(400).json({ msg: `Could not get number of threads` });
    })
};


/**
 * Handler function to GET the stats for a community.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
 let getCommunityStats = async function (req, res, next) {

    const communityId = req.body.communityId

    const numEvents = await dao.getNumberEventsOfCommunity(communityId)
        .then(async function(cursor) {
            const numEvents = [];
            await cursor.forEach(el => {
                numEvents.push(el);
            })
            return numEvents[0]
        })
        .catch(err => {
            res.status(400).json({ msg: `Could not get number of events` });
        })

    const numThreads = await dao.getNumberThreads(communityId)
        .then(async function(cursor) {
            const numThreads = [];
            await cursor.forEach(el => {
                numThreads.push(el);
            })
            return numThreads[0]
        })
        .catch(err => {
            res.status(400).json({ msg: `Could not get number of threads` });
        })

    const numComments = await dao.getNumberCommentsOfCommunity(communityId)
        .then(async function(cursor) {
            const numComments = [];
            await cursor.forEach(el => {
                numComments.push(el);
            })
            return numComments[0]
        })
        .catch(err => {
            res.status(400).json({ msg: `Could not get number of comments` });
        })

    res.status(200).json({numComments, numEvents, numThreads})
};


/**
 * Handler function to GET all community tags per community. 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
 let getAllCommunityTags = function (req, res, next) {
    
    const communityId = req.body.communityId

    dao.getAllCommunityTags(communityId)
    .then(async function() {
        const allCommunityTags = [];
        await cursor.forEach(el => {
            let obj = {}
                obj.community = {id: el.communityId, tags: el.communityTags}
            allCommunityTags.push(obj);
        })
        return allCommunityTags
    })
    .then(allCommunityTags => res.status(200).json(allCommunityTags))
    .catch(err => {
        console.log(`Could not get all community tags`, err);
        res.status(400).json({ msg: `Could not get all community tags` });
    })
};

/**
 * Handler function to GET all communities the user is a member of.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
 let getMemberCommunities = function (req, res, next) {

    const userId = req.userId

    dao.getMemberCommunities(userId)
        .then(async function(communityList) {
            const memberCommunities = [];
            await communityList.forEach(community => {
                let newComm = Community.fromJSON(community)
                if (!memberCommunities.map(el => el.id).includes(newComm.id))
                memberCommunities.push(newComm);
            })
            return memberCommunities
        })
        .then(communities => res.status(200).json(communities))
        .catch(err => {
            console.log(`Could not get member communities`, err);
            res.status(400).json({ msg: `Could not get member communities` });
        })
}

/**
 * Handler function to GET all communities the user is the owner of.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
 let getOwnedCommunities = function (req, res, next) {

    const userId = req.userId

    dao.getOwnedCommunities(userId)
        .then(async function(communityList) {
            const ownedCommunities = [];
            await communityList.forEach(community => {
                let newComm = Community.fromJSON(community)
                if (!ownedCommunities.map(el => el.id).includes(newComm.id))
                    ownedCommunities.push(newComm);
            })

            return ownedCommunities;
        })
        .then(communities => res.status(200).json(communities))
        .catch(err => {
            console.log(`Could not get owned communities`, err);
            res.status(400).json({ msg: `Could not get owned communities` });
        })
}

/**
 * Handler function to GET recently active communities.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
 let getRecentlyActiveCommunities = function (req, res, next) {

    // how many of the recently active communities to get
    let num = req.body.num;

    dao.getRecentlyActiveCommunities(req.userId, num)
        .then(async function(cursor) {
            const communities = [];
            await cursor.forEach(arr => {
                let obj = {}
                obj.communities = {id: arr.communityId, name: arr.communityName}
                communities.push(obj);
            })
            return communities
        })
        .then(communities => res.status(200).json(communities))
        .catch(err => {
            console.log(`Could not get recently active communities`, err);
            res.status(400).json({ msg: `Could not get recently active communities` });
        })
}

/**
 * Handler function to get community recommendations.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getRecommendation = async function (req, res, next) {
    let userId = req.userId

    let user = await dao.getUserObject(userId)
        .then((u) => {
            return User.fromJSON(u)
        }).catch(err => {
            console.log(`Could not find user`, err);
            res.status(404).json({ msg: `Could not find user` });
        });

    //retrieving data from DB (from events_collection)
    let pageRank = await dao.getPageRankCommunities(userId)
        .then((coms) => {
            // handle case where user has no communities
            if (coms.length === 0) {
                return {};
            }
            let communities = coms.map(com => Community.fromJSON(com))

            let network = new CommunityNetwork(communities, userId, user.interests)
            network.createGraph();
            network.createAdjacency();
            let v = network.getDistributionVector(0.5);

            let rank = new PageRank(network.adjacency, v);
            let result = rank.iterate(network.communityHash);

            // sort community IDs by descending rank
            return result.mappedResult
        })
        .then(scores => normaliseNHighestRanks(scores, 5))

    let levenshtein = await dao.getCommunityTagsForLevenshtein(userId)
        .then(coms => calculateLevenshteinScore(coms, user.interests))
        .then(scores => normaliseNHighestRanks(scores, 5))

    // combine Levenshtein and PageRank results by giving each a 50% weight
    let combinedScores = {}

    Object.entries(levenshtein).forEach(arr => {
        combinedScores[arr[0]] = 0.5 * arr[1]
    })

    Object.entries(pageRank).forEach(arr => {
        if (combinedScores.hasOwnProperty(arr[0])) {
            combinedScores[arr[0]] += 0.5 * arr[1]
        } else {
            combinedScores[arr[0]] = 0.5 * arr[1]
        }
    })

    // array of community IDs sorted in descending order of rank
    let idArr = Object.entries(combinedScores)
        .sort((a, b) => b[1] - a[1], 0)
        .map(arr => arr[0])

    let cursor = await dao.getCommunitiesById(idArr)

    // community Objects to return
    let communities = []
    await cursor.forEach(com => {
        let community = Community.fromJSON(com)

        // keep only the ones that the user isn't already a member of
        if (!community.users.map(el => el.id).includes(user.id)) {
            communities.push(community)
        }
    })

    // return at most best 5 results
    communities = communities.slice(0, 5)

    // returns array of recommended communities in descending rank order
    res.status(200).json({communities: communities})
}

/**
 * Handler function to get search results.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getSearchResults = function (req, res, next) {
    const searchTerm = req.body.searchTerm

    //retrieving data from DB (from events_collection)
    dao.getSearchResults(searchTerm)
        .then((results) => {
            results.userResults = results.userResults.map(u => User.fromJSON(u));
            results.communityResults = results.communityResults.map(u => Community.fromJSON(u));
            res.status(200).json(results);

        })
        .catch(err => {
            console.log(`Could not get search results`, err);
            res.status(500).json({ msg: `Could not get search results` });
        })
}

/**
 * Proxy request handler that gets a random joke from an external API.
 * @param {Request} req
 * @param {Response} res
 * */
const getJoke = function (req, res) {
    const options = {
        headers: {
            'Accept': 'application/json'
        }
    };

    axios.get('https://icanhazdadjoke.com/', options)
        .then(response => res.status(200).json(response.data))
        .catch(error => console.log(error));
}

/**
 * Handler function to allow registration.
 * @param {Request} req
 * @param {Response} res
 * */
const register = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const email = req.body.email;

    const gender = req.body.gender;
    const age = req.body.age;
    const location = req.body.location;
    const picture = req.body.picture;

    let existingUser = await dao.getUserObjectByName(username)
    if (existingUser.length > 0) {
        res.status(409).json({'msg': `Username ${username} is already taken.`})
    } else {
        dao.registerNewUserPassword(username, password).then((res) => {
            console.log(res)
            let newUser = new User(username, email)
            newUser.gender = gender;
            newUser.age = age;
            newUser.location = location;
            newUser.picture = picture;
            return newUser
        }).then(async (user) => {
            let addedUserIds = await dao.addUser(user)
            console.log(addedUserIds)
            res.status(200).json({msg: 'added', user: user})
        }).catch(err => res.status(400).json({msg: 'registration failed'}))
    }
}

/**
 * Login a user. Send only a response as the point is to go through authentication once to
 * verify the user. If that fails, we don't even get to this point.
 * @param {Request} req
 * @param {Response} res
 * */
const login = async function(req, res) {

    const username = req.username

    let existingUser = await dao.getUserObjectByName(username)

    if (existingUser.length > 0) {
        let user = User.fromJSON(existingUser[0])
        res.status(200).json({msg: 'logged in', user: user})
    }
    else {
        res.status(401).json({msg: 'login failed'})
    }
}


/**
 * The following API endpoints allow the client to interact with the server.
 * */

// Register
app.post('/api/register', register)

// Login an existing user
app.get('/api/login', authenticate, login)

// Create a new user
app.post('/api/create-user/', authenticate, createUser);

// Create a new community
app.post('/api/create-community/', authenticate, createCommunity);

// Create a new thread in a community
app.post('/api/create-thread/', authenticate, createThread);
app.post('/api/join-community/', authenticate, joinCommunity);
app.post('/api/leave-community/', authenticate, leaveCommunity);

// Create a new comment in a thread
app.post('/api/create-comment/', authenticate, createComment);

// Create a new event in a community
app.post('/api/create-event/', authenticate, createEvent);
app.post('/api/remove-event/', authenticate, removeEvent);
app.post('/api/add-tag/', authenticate, addTag);
app.post('/api/remove-tag/', authenticate, removeTag);

// get a community by its ID
app.post('/api/community-by-id/', authenticate, getCommunityById);

// get all threads of a community
app.get('/api/get-threads-of-community/', authenticate, getThreadsOfCommunity);

// get all events of a user
app.get('/api/get-user-events/', authenticate, getUserEvents);

// get all events of a user of a specific community
app.post('/api/get-user-events-of-community/', authenticate, getUserEventsOfCommunity);

// get most recent comments of a user
app.post('/api/get-recent-comments/', authenticate, getMostRecentComments);
app.post('/api/get-recent-communities/', authenticate, getMostRecentCommunities);

// get result of the recommendation system
app.get('/api/get-recommendation/', authenticate, getRecommendation);

// get search results
app.post('/api/get-search-results/', authenticate, getSearchResults);

// get a user object by ID
app.post('/api/get-user-object/', authenticate, getUserObject);
app.get('/api/get-user-comments/', authenticate, getNumberComments);
app.get('/api/get-user-threads/', authenticate, getNumberThreads);
app.post('/api/add-tag-user/', authenticate, addTagUser);
app.post('/api/remove-tag-user/', authenticate, removeTagUser);
app.post('/api/update-user-info/', authenticate, updateUserInfo);
app.post('/api/update-user-profile-picture/', authenticate, updateUserProfilePicture);

app.post('/api/get-community-stats/', authenticate, getCommunityStats);

// get community lists for sidenav access
app.get('/api/get-member-communities/', authenticate, getMemberCommunities);
app.get('/api/get-owned-communities/', authenticate, getOwnedCommunities);
app.get('/api/get-recently-active-communities/', authenticate, getRecentlyActiveCommunities);

// get tags for levenshtein distance algorithm 
app.get('/api/get-all-community-tags', authenticate, getAllCommunityTags);


/*
* The following endpoints were introduced as a proxy in order to access external APIs that have
* strict CORS policies which would not allow direct access from the client. Therefore, the client
* request is send to this server, which executes the actual requests and sends back the response
* to the client. This also gives us more control over what the client receives, i.e. we could filter
* or enrich the response ourselves.
 */

app.get('/api/proxy/joke', getJoke);

// Set the static folder
app.use(express.static('content'));

function run() {
    // initialise the database
    dao.init()
        // only start listening once the database initialisation has finished successfully
        // User the http server here instead of app since we're using Socket.io; all Restful endpoints are still valid.
        .then(() => server.listen(API_PORT, () => console.log(`Listening on localhost: ${API_PORT}`)))
        .catch(err => console.log(`Could not start server`, err))
}
run()


