const { User, Community, Thread, Comment } = require('./models')
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
        //make the browser ask for credentials if none/wrong are provided
        // res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    }
    req.username = user.username;
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
        console.log('received ping from', )
        io.emit('pong', {data: 'pong'});
    })

    // Handler for join events
    socket.on('join', data => {
        if (!socket.rooms.has(data.room)) {
            socket.join(data.room);
            let text = `${socket.handshake.auth.username} joined room ${data.room}`;
            io.to(data.room).emit('notify', {data: text})
            console.log(text)
        }
    })

    // Handler for leave events
    socket.on('leave', data => {
        if (socket.rooms.has(data.room)) {
            socket.leave(data.room);
            let text = `${socket.handshake.auth.username} left room ${data.room}`;
            io.to(data.room).emit('notify', {data: text})
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
    //res.status(200).json(user);

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

    res.status(200).json({ msg: `Added user '${body.communityName}' with userName ` });
    //res.status(200).json({msg : `Added user '${body.communityName}' with userName ${body.admin}`});
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
    //let author = User.fromJSON(body.author)

    //creating new instances of class User, Community and Thread
    let author = new User(userName, userEmail)
    let community = new Community(communityName, author)
    let thread = new Thread(text, title, author, community)

    res.status(200).json({ msg: `Added new thread '${thread}' with userName ${userName}` });
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
    let title = body.title;
    let communityName = body.communityName
    let userName = body.admin.userName
    let userEmail = body.admin.userEmail
    let text1 = body.text1;
    //let author = User.fromJSON(body.author)

    //creating new instances
    let author = new User(userName, userEmail)
    let community = new Community(communityName, author)
    let thread = new Thread(text, title, author, community)
    let comment = new Comment(text1, author, thread)

    res.status(200).json({ msg: `Added new comment '${comment}' with userName ${userName}` });
}

/**
 * Handler function to retrieve user_data
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getAllUsers = function (req, res, next) {
    dao.getUser()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(`Could not get films`, err);
            res.status(400).json({ msg: `Could not get films` });
        })
}

/**
 * Handler function to get Community object
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getCommunity = function (req, res, next) {
    //creating an instance of class Community manually
    let userName = 'abc'
    let userEmail = 'test@gmail.com'
    let communityName = "CS5003";
    let admin = new User(userName, userEmail)
    let community = new Community(communityName, admin)
    //TODO: serialize/deserialize the object before sending it back
    res.status(200).json(community.communityName)
}

/**
 * Handler function to get Thread object
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getThread = function (req, res, next) {
    //creating an instance of class Thread manually
    let userName = 'abc'
    let userEmail = 'test@gmail.com'
    let communityName = "CS5003";
    let text = 'thread text..'
    let title = 'title of thread'
    let author = new User(userName, userEmail)
    let community = new Community(communityName, author)
    let thread = new Thread(text, title, author, community)
    //TODO: serialize/deserialize the object before sending it back
    res.status(200).json(thread.title)
}

/**
 * Handler function to get Comment object
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let getComment = function (req, res, next) {
    //creating a instance of class Comment manually
    console.log("inside getComment")
    let userName = 'abc'
    let userEmail = 'test@gmail.com'
    let communityName = "CS5003";
    let text = 'thread text..'
    let title = 'title of thread'
    let text1 = 'comment text'
    let author = new User(userName, userEmail)
    let community = new Community(communityName, author)
    let thread = new Thread(text, title, author, community)
    let comment = new Comment(text1, author, thread)
    //TODO: serialize/deserialize the object before sending it back
    res.status(200).json({ msg: `Added new comment '${comment}` })
}

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
app.get('/api/get-all-users/', authenticate, getAllUsers);
app.get('/api/get-community/', authenticate, getCommunity);
app.get('/api/get-thread/', authenticate, getThread);
app.get('/api/get-comment/', authenticate, getComment);

/*
* The follotwing endpoints were introced as proxy in order to access external APIs that have
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


