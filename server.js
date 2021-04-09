const { User, Community, Thread, Comment } = require('./models')
const dao = require('./dao');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) 

const API_PORT = 3000;

/**
 * Handler function to create a new User
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createUser = function(req, res, next) {
    let body = req.body;

    // Create a new instance of the class User
    let user = new User(body.userName,body.userEmail)
    res.status(200).json(user);
    // dao.addUser(body)
    //     .then((id) => {console.log(user)})
    //     .catch(err => {
    //         console.log(`Could not add user '${body.userName}`, err);
    //         res.status(400).json({msg: `Could not add user '${body.userName}`});
    //     });
}

/**
 * Handler function to create a new Community.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * */
let createCommunity =  (req, res, next) => {
    let body = req.body;

    // deserialize the User object
    //let admin = User.fromJSON(body.admin)
    
    let userName = body.admin.userName
    let userEmail = body.admin.userEmail
    let user = new User(userName,userEmail) 

    // create a new instance of the class Community
    let community = new Community(body.communityName, user)
    res.status(200).json({msg : `Added user '${body.communityName}' with userName `});
    //res.status(200).json({msg : `Added user '${body.communityName}' with userName ${body.admin}`});
}


let createThread = (req, res, next) => {
    let body = req.body;
    let text = body.text;
    let title = body.title;
    let communityName = body.communityName
    let userName = body.admin.userName
    let userEmail = body.admin.userEmail
   //let author = User.fromJSON(body.author)
    let author = new User(userName,userEmail)

    let community = new Community(communityName, author)
    let thread = new Thread(text,title,author,community)
    res.status(200).json({msg : `Added new thread '${thread}' with userName ${userName}`});}

 let createComment = (req, res, next) => {
    let body = req.body;
    let text = body.text;
    let title = body.title;
    let communityName = body.communityName
    let userName = body.admin.userName
    let userEmail = body.admin.userEmail
    let text1 = body.text1;
   //let author = User.fromJSON(body.author)
    let author = new User(userName,userEmail)

    let community = new Community(communityName, author)
    let thread = new Thread(text,title,author,community)
    let comment = new Comment(text1,author,thread)
    res.status(200).json({msg : `Added new comment '${comment}' with userName ${userName}`});}


//Set up routes
 app.post('/api/create-user/', createUser);
 app.post('/api/create-community/', createCommunity);
 app.post('/api/create-thread/', createThread);
 app.post('/api/create-comment/', createComment);

app.use(express.static('content'));

function run() {
    // initialise the database
    dao.init()
    //only start listening once the database initialisation has finished successfully
    .then(() => app.listen(API_PORT, () => console.log(`Listening on localhost: ${API_PORT}`)))
    .catch(err => console.log(`Could not start server`, err))
}
run()


