/**
 * Run this file to create test data.
 * */

const dao = require('./dao');
const {makeMoreDemoData} = require("./testData");
const {makePageRankDemoData} = require("./testData");
const {PageRank} = require("./pagerank");
const {CommunityNetwork} = require("./pagerank");
const {getPageRankCommunities} = require("./dao");
const {addCommunities} = require("./dao");
const {addUsers} = require("./dao");
const {Community} = require("./models");

const {getUser} = require("./dao");
const {dropCollections} = require("./dao");

let pageRankDemoData = makePageRankDemoData();
let moreDemoData = makeMoreDemoData();

dao.init()
    .then(dropCollections)
    .then(() => addUsers(pageRankDemoData.users))
    .then(() => addCommunities(pageRankDemoData.communities))
    .then(() => addUsers(moreDemoData.users))
    .then(() => addCommunities(moreDemoData.communities))
    .then(() => getPageRankCommunities(pageRankDemoData.peter.id))
    .then((res) => {
        console.log('there we go...')

        let communities = res.map(com => Community.fromJSON(com))
        let userId = pageRankDemoData.peter.id
        let interests = pageRankDemoData.peter.interests

        let network = new CommunityNetwork(communities, userId, interests)
        network.createGraph();
        network.createAdjacency();
        let v = network.getDistributionVector(0.5);

        let rank = new PageRank(network.adjacency, v);
        let result = rank.iterate(network.communityHash);
        console.log(result)

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
