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

dao.init()
    // drop old data
    .then(dao.dropCollections)

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

    // .then(() => dao.getPageRankCommunities(pageRankDemoData.peter.id))

    // .then(() => dao.getUserEvents(demoData.adrian.id))

    .then(() => dao.getUserObject(demoData.adrian.id))
    .then((res) => {
        console.log(res)
        console.log('done')
    })
    .then(res => {
        process.exit(0);
    })

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
//
// rl.question("Running this script will wipe the data base collections? Are you sure you want to proceed? [y/n]", function(confirm) {
//     if (confirm.toLowerCase() === 'n') {
//         rl.close()
//     } else {
//         console.log('Deleting now...')
//         dao.init()
//             .then(dropCollections)
//             .then(res => console.log(res))
//             .finally(() => rl.close())
//
//     }
// });
//
// rl.on("close", function() {
//     process.exit(0);
// });
