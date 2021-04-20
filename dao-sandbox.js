/**
 * Run this file to create test data.
 * */
const dao = require('./dao');
const {makeGeneralTestData} = require("./testData");
const {makePageRankDemoData} = require("./testData");
const { User, Community, Thread, Comment, Event } = require('./models')

let pageRankDemoData = makePageRankDemoData();
let demoData = makeGeneralTestData();

let userId = demoData.adrian.id
let communityId = "c50fc1fb-55c3-4f09-8774-59150286bfb4";

dao.init()
    // drop old data
    .then(dao.dropCollections)

    // some users
    .then(() => dao.registerNewUserPassword('test', 'test'))
    .then(() => dao.registerNewUserPassword('akl8', 'password'))
    .then(() => dao.registerNewUserPassword('adrian', 'password'))
    .then(() => dao.registerNewUserPassword('am557', 'password'))
    .then(() => dao.registerNewUserPassword('gasj1', 'password'))
    .then(() => dao.registerNewUserPassword('jl341', 'password'))

    // add new data
    .then(() => dao.addUsers(pageRankDemoData.users))
    .then(() => dao.addCommunities(pageRankDemoData.communities))
    .then(() => dao.addUsers(demoData.users))
    .then(() => dao.addCommunities(demoData.communities))

    // // your functions here and comment them out if needed
    // .then(() => dao.getMostRecentComments(userId, 3))
    // .then(async function(cursor) {
    //     const comments = [];
    //     await cursor.forEach(arr => {
    //         let obj = {}
    //         obj.community = {id: arr.communityId, name: arr.communityName}
    //         obj.thread = {id: arr._id.id, title: arr._id.title}
    //         obj.comment = Comment.fromJSON(arr._id.comments)
    //         comments.push(obj);
    //     })
    //     return comments
    // })
    // .then(() => dao.getPageRankCommunities(pageRankDemoData.peter.id))

    // .then(() => dao.getUserEvents(userId))
    // .then(async function(eventsRaw) {
    //     const events = [];
    //     await eventsRaw.forEach(arr => {
    //         arr.events.forEach((event) => {
    //             let newEvent = Event.fromJSON(event)
    //             if (!events.map(el => el.id).includes(newEvent.id))
    //                 events.push(newEvent);
    //         })
    //     })
    //
    //     return events;
    // })

    // .then(() => {
    //     let communityId = "c50fc1fb-55c3-4f09-8774-59150286bfb4"
    //     return dao.getUserEventsOfCommunity(userId, communityId)
    // })
    // .then(async function(cursor) {
    //     const events = [];
    //     await cursor.forEach(arr => {
    //         let obj = {}
    //         obj.community = {id: arr.communityId, name: arr.communityName}
    //         obj.event = Event.fromJSON(arr._id)
    //         events.push(obj);
    //     })
    //     return events
    // })

    // .then(() => {
    //     let communityId = "85958011-170d-442b-ad20-0e871fc3e021";
    //     return dao.getThreadsOfCommunity(communityId)
    // })
    // .then(async function(cursor) {
    //     const threads = [];
    //     await cursor.forEach(arr => {
    //         let obj = {}
    //         obj.community = {id: arr.communityId, name: arr.communityName}
    //         obj.thread = Thread.fromJSON(arr._id)
    //         threads.push(obj);
    //     })
    //     return threads
    // })

    // .then(async function() {
    //     let communityId = "85958011-170d-442b-ad20-0e871fc3e021";
    //     let text = 'hello'
    //     let title = 'intro'
    //
    //     //creating new instances of class User, Community and Thread
    //
    //     // todo get from authenticate
    //     let author = await dao.getUserObject(userId)
    //         .then((res) => {
    //             return User.fromJSON(res)
    //         }).catch(err => {
    //             console.log(`Could not find user`, err);
    //             res.status(404).json({ msg: `Could not find user` });
    //         });
    //
    //     let thread = new Thread(text, title, author)
    //
    //     //adding new Thread to the database
    //     return dao.addThreadToCommunity(communityId, thread)
    // })

    // .then(async function() {
    //     let communityId = "85958011-170d-442b-ad20-0e871fc3e021";
    //     let title = 'tea'
    //     let description = 'having some team'
    //     let datetime = new Date(2020, 3, 12)
    //
    //     let author = await dao.getUserObject(userId)
    //         .then((res) => {
    //             return User.fromJSON(res)
    //         }).catch(err => {
    //             console.log(`Could not find user`, err);
    //             res.status(404).json({ msg: `Could not find user` });
    //         });
    //
    //     let event = new Event(title, description, author, datetime)
    //
    //     return dao.addEvent(communityId, event)
    // })

    // .then(async function() {
    //     let threadId = "2eec1791-d327-43b0-b7bf-1e6cfad7a498";
    //     let text = "this is a comment"
    //
    //     let author = await dao.getUserObject(userId)
    //         .then((res) => {
    //             return User.fromJSON(res)
    //         }).catch(err => {
    //             console.log(`Could not find user`, err);
    //             res.status(404).json({ msg: `Could not find user` });
    //         });
    //
    //     let comment = new Comment(text, author)
    //
    //     //adding new Comment to database
    //     return dao.addComment(comment, threadId)
    // })

    // .then(async () => {
    //     const username = 'username123';
    //     const password = 'password123';
    //
    //     const email = 'some@mail.com';
    //
    //     let existingUser = await dao.getUserObjectByName(username)
    //     if (existingUser.length > 0) {
    //         return {'msg': `Username ${username} is already taken.`};
    //     } else {
    //         return dao.registerNewUserPassword(username, password).then((res) => {
    //             console.log(res)
    //             return new User(username, email)
    //         }).then(async (user) => {
    //             let addedUserIds = await dao.addUser(user)
    //             console.log(addedUserIds)
    //             return addedUserIds
    //         }).catch(err => res.status(400).json({msg: 'registration failed'}))
    //     }
    // })

    // .then(async() => {
    //     let loginData = {name: 'username123', pass: 'password123'}
    //     // check DB
    //     let validUser = await dao.authenticateUser(loginData.name, loginData.pass);
    //     if (!validUser) {
    //         // make the browser ask for credentials if none/wrong are provided
    //         return {msg: 'invalid username and password'}
    //     }
    //
    //     let userObjects = await dao.getUserObjectByName(loginData.name)
    //     let user = User.fromJSON(userObjects[0])
    //     return user
    // })

    // .then(() => dao.getPageRankCommunities(pageRankDemoData.peter.id))

    // .then(() => dao.getUserEvents(demoData.adrian.id))

    // .then(() => dao.getUserObject(demoData.adrian.id))
    // .then(() => dao.getNumberThreads(demoData.adrian.id))
    // .then(async function(cursor) {
    //     await cursor.forEach(el => console.log(el))
    // })

    // .then(() => dao.getAllCommunityTags(communityId))
    // .then(async function(cursor) {
    //     await cursor.forEach(el => console.log(el))
    // })

    .then((res) => {
        console.log(res)
        console.log('done')
    })
    .then(res => {
        process.exit(0)
    })
