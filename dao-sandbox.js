/**
 * Run this file to create test data.
 * */

const dao = require('./dao');
const {makeGeneralTestData} = require("./testData");
const {makePageRankDemoData} = require("./testData");
const {Community} = require("./models");

let pageRankDemoData = makePageRankDemoData();
let demoData = makeGeneralTestData();

dao.init()
    .then(dao.dropCollections)
    .then(() => dao.addUsers(pageRankDemoData.users))
    .then(() => dao.addCommunities(pageRankDemoData.communities))
    .then(() => dao.addUsers(demoData.users))
    .then(() => dao.addCommunities(demoData.communities))
    .then(() => dao.getPageRankCommunities(pageRankDemoData.peter.id))
    .then(() => dao.getUserEvents(demoData.adrian.id))
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
