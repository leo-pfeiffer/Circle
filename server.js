const { User, Community, Thread, Comment } = require('./models')
const dao = require('./dao');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const API_PORT = 3000;

// ===== Socket IO
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error('no username'));
    }
    socket.username = username;
    next();
})

io.on('connection', (socket) => {
    console.log(socket.handshake.auth.username, 'connected');

    socket.on('ping', msg => {
        console.log('received ping from', )
        io.emit('pong', {data: 'pong'});
    })

    socket.on('join', data => {
        console.log(data);
        socket.join(data.room);
        let text = `${socket.handshake.auth.username} joined room ${data.room}`;
        io.to(data.room).emit('notify', {data: text})
        console.log(socket.rooms)
    })

    socket.on('disconnect', (reason) => {
        console.log(socket.handshake.auth.username, 'disconnected')
    })

})



// ===== Handlers

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

//Set up routes
app.post('/api/create-user/', createUser);
app.post('/api/create-community/', createCommunity);
app.post('/api/create-thread/', createThread);
app.post('/api/create-comment/', createComment);
app.get('/api/get-all-users/', getAllUsers);
app.get('/api/get-community/', getCommunity);
app.get('/api/get-thread/', getThread);
app.get('/api/get-comment/', getComment);



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


