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
let authenticate = function (req, res, next) {
    let user = basicAuth(req);
    // check DB
    let validUser = true;
    if (!validUser) {
        // make the browser ask for credentials if none/wrong are provided
        return res.sendStatus(401);
    }
    req.username = user.username;
    // todo
    // req.userId = user.id;
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


// ===== Handler functions =======

/**
 * Handler function to create a new User and add it to the database
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
 * Handler function to create a new Community.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createCommunity = (req, res, next) => {
    let body = req.body;

    // deserialize the User object
    //let admin = User.fromJSON(body.admin)

    let userName = body.admin.userName
    let userEmail = body.admin.userEmail

    //create new instance of the class User
    let user = new User(userName, userEmail)
    // create a new instance of the class Community
    let community = new Community(body.communityName, user)

    //adding new Community instance to the database
    dao.addCommunity(community)
        .then((id) => {
            res.status(200).json({ msg: `Added community '${body.communityName}' with ID ${id}` });
        })
        .catch(err => {
            console.log(`Could not add community '${body.communityName}`, err);
            res.status(400).json({ msg: `Could not add community '${body.communityName}` });
        });
}

/**
 * Handler function to create a new Thread
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createThread = (req, res, next) => {
    let body = req.body;
    let text = body.text;
    let title = body.title;
    let communityName = body.communityName
    let userName = body.admin.userName
    let userEmail = body.admin.userEmail

    //creating new instances of class User, Community and Thread
    let author = new User(userName, userEmail)
    let community = new Community(communityName, author)
    let thread = new Thread(text, title, author, community)

    //adding new Thread to the database
    dao.addThread(thread)
        .then((id) => {
            res.status(200).json({ msg: `Added new thread '${thread}' in community ${community}` });
        })
        .catch(err => {
            console.log(`Could not add thread`, err);
            res.status(400).json({ msg: `Could not add thread` });
        });

}

/**
 * Handler function to create a new  Comment
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createComment = (req, res, next) => {
    let body = req.body;
    let text = body.text;
    let userName = body.user.userName
    let userEmail = body.user.userEmail

    //creating new User and Comment instances
    let author = new User(userName, userEmail)
    let comment = new Comment(text, author)

    //adding new Comment to database
    dao.addComment(comment)
        .then((id) => {
            res.status(200).json({ msg: `Added new comment '${comment}' with userName ${userName}` });
        })
        .catch(err => {
            console.log(`Could not add comment`, err);
            res.status(400).json({ msg: `Could not add comment` });
        });
}

// handler function for adding Event object
let createEvent = (req, res, next) => {
    let body = req.body;
    let title = body.title;
    let description = body.description;
    let communityName = body.communityName
    let userName = body.admin.userName
    let userEmail = body.admin.userEmail
    let datetime = new Date()

    //creating new User, Community and Event instances
    let author = new User(userName, userEmail)
    let community = new Community(communityName, author)
    let event = new Event(title,description,community, author,datetime)

    //adding new Event instance to the database
    dao.addEvent(event)
    .then((id) => {
     res.status(200).json({ msg: `Added new event '${event}'` });
    })
    .catch(err => {
        console.log(`Could not add event`, err);
        res.status(400).json({ msg: `Could not add event` });
    });
}

/**
 * Handler function to GET User objects
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getUser = function (req, res, next) {
    //retrieving data from DB (from users_collection)
    dao.getUser()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(`Could not get users`, err);
            res.status(400).json({ msg: `Could not get users` });
        })
}

/**
 * Handler function to GET Community objects 
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getCommunity = function (req, res, next) {
    //retrieving data from DB (from communities_collection)
    dao.getCommunity()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(`Could not get community`, err);
            res.status(400).json({ msg: `Could not get community` });
        })
}

/**
 * Handler function to GET Thread objects of a community
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
 * Handler function to GET most recent comments
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
                console.log(arr._id.comments.id)
                obj.comment = new Comment(arr._id.comments)
                console.log(obj.comment.id)
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
 * Handler function to GET Comment objects
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getComment = function (req, res, next) {
    //retrieving data from DB (from comments_collection)
    dao.getComment()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(`Could not get Comment`, err);
            res.status(400).json({ msg: `Could not get Comment` });
        })

}

/**
 * Handler function to GET Event objects
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getEvent = function (req, res, next) {
    //retrieving data from DB (from events_collection)
    dao.getEvent()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(`Could not get event`, err);
            res.status(400).json({ msg: `Could not get event` });
        })
}

/**
 * Handler function to GET all Events of the communities the user is a member of.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getUserEvents = function (req, res, next) {

    const userId = req.body.userId

    dao.getUserEvents(userId)
        .then(async function(eventsRaw) {
            const events = [];
            await eventsRaw.forEach(arr => {
                arr.events.forEach((event) => {
                    let newEvent = Event.fromJSON(event)
                    if (!events.map(el => el.id).includes(newEvent.id))
                        events.push(newEvent);
                })
            })

            return events;
        })
        .then(docs => res.status(200).json(docs))
        .catch(err => {
            console.log(`Could not get event`, err);
            res.status(400).json({ msg: `Could not get event` });
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
    const communityId = req.communityId

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
 * Handler function to get community recommendations
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getRecommendation = function (req, res, next) {
    let body = req.body;
    let userId = body.user.id
    let interests = body.user.interests

    //retrieving data from DB (from events_collection)
    dao.getPageRankCommunities(userId)
        .then((res) => {
            let communities = res.map(com => Community.fromJSON(com))

            let network = new CommunityNetwork(communities, userId, interests)
            network.createGraph();
            network.createAdjacency();
            let v = network.getDistributionVector(0.5);

            let rank = new PageRank(network.adjacency, v);
            let result = rank.iterate(network.communityHash);

            res.status(200).json(result);

        })
        .catch(err => {
            console.log(`Could not get PageRank recommendation`, err);
            res.status(500).json({ msg: `Could not get PageRank recommendation` });
        })
}

/**
 * Handler function to GET a user object
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
 * Proxy request handler that gets a random joke from an external API
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
const getJoke = function (req, res, next) {
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
 * The following API endpoints allow the client to interact with the server.
 * */
app.post('/api/create-user/', authenticate, createUser);
app.post('/api/create-community/', authenticate, createCommunity);
app.post('/api/create-thread/', authenticate, createThread);
app.post('/api/create-comment/', authenticate, createComment);
app.post('/api/create-event/', authenticate, createEvent);
app.get('/api/get-all-users/', authenticate, getUser);
app.get('/api/get-community/', authenticate, getCommunity);
app.get('/api/get-threads-of-community/', authenticate, getThreadsOfCommunity);
app.get('/api/get-comment/', authenticate, getComment);
app.get('/api/get-event/', authenticate, getEvent);
app.get('/api/get-user-event/', authenticate, getUserEvents);
app.get('/api/get-user-events-of-community/', authenticate, getUserEventsOfCommunity);
app.get('/api/get-recommendation/', authenticate, getRecommendation);
app.get('/api/get-user-object/', authenticate, getUserObject);

/*
* The following endpoints were introduced as a proxy in order to access external APIs that have
* strict CORS policies which would not allow direct access from the client. Therefore, the client
* request is send to this server, which executes the actual requests and sends back the response
* to the client. This also gives us more control over what the client receives, i.e. we could filter
* or enrich the response ourselves.
 */
app.get('/api/proxy/joke', authenticate, getJoke);

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


