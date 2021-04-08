const { testUserAndCommunity,testcommentAndThread,makeUser,makeThread,makeComment,makeCommunity} = require('./community.js')
const dao = require('./dao');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) 

const API_PORT = 3000;

 
    //define handler functions
    let addUser = function(req,res,next) {
        let body = req.body;
       // let film = Film.fromJSON(body); // this will do all the validation for us!
        let user =  makeUser(body.userName,body.userEmail)
    //    dao.addUser(body)
    //    .then( id => {
    //        console.log(user)
           res.status(200).json(user);
            //res.status(200).json({msg : `Added user '${body.userName}' with id ${id}`});
    //    })
    //    .catch(err => {
    //        console.log(`Could not add user '${body.userName}`, err);
    //        res.status(400).json({msg: `Could not add user '${body.userName}`});
    //    });
    }

    let addCommunity =  function(req,res,next)
    {
        let body = req.body;
        makeCommunity(body.communityName, body.admin)
        res.status(200).json({msg : `Added user '${body.communityName}' with userName ${body.admin}`});

    }

    //Set up routes
     app.post('/User/', addUser);
     app.post('/Community/', addCommunity);

app.use(express.static('content'));

// tell the server to listen on the given port and log a message to the console (so we can see our server is doing something!)
// app.listen(API_PORT, () => {
// 	console.log(`Listening on localhost:${API_PORT}`);
// });

function run() {
    // intitialise the database 
    dao.init()
    //only start listening once the database initialisation has finished successfully
    .then(() => app.listen(API_PORT, () => console.log(`Listening on localhost: ${API_PORT}`)))
    .catch(err => console.log(`Could not start server`, err))
}

run()
//testUserAndCommunity();
//testcommentAndThread();
//process.exit(1)

