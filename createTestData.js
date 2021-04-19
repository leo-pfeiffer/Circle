/**
 * Run this file to create test data.
 * */

const dao = require('./dao');
const {PageRank} = require("./pagerank");
const {CommunityNetwork} = require("./pagerank");
const {getPageRankCommunities} = require("./dao");
const {addCommunities} = require("./dao");
const {addUsers} = require("./dao");
const {User} = require("./models");
const {Community} = require("./models");

const {getUser} = require("./dao");
const {dropCollections} = require("./dao");

/**
 * Add users from an array to a community.
 * @param {Community} community
 * @param {Array<User>} users
 * */
const addUsersToCommunity = function(community, users) {
    for (let user of users) {
        community.addUser(user)
    }
}

/**
 * Add tags from an array to a the tags of a community.
 * @param {Community} community
 * @param {Array<string>} tags
 * */
const addTagsToCommunity = function(community, tags) {
    for (let tag of tags) {
        community.addTag(tag)
    }
}

/**
 * Add interests from an array to a user.
 * @param {User} user
 * @param {Array<string>} interests
 * */
const addInterestsToUser = function(user, interests) {
    for (let interest of interests) {
        user.addInterest(interest)
    }
}

/**
 * Make demo data to test page rank
 * */
const makePageRankDemoData = function() {

    const peter = new User('peter', 'mail')
    addInterestsToUser(peter, ['hobby1', 'hobby2', 'hobby3'])

    const tom = new User('tom', 'mail')
    const anna = new User('anna', 'mail')
    const jenny = new User('jenny', 'mail')
    const fred = new User('fred', 'mail')

    const comA = new Community('A', peter)
    addUsersToCommunity(comA, [tom, anna, jenny])
    addTagsToCommunity(comA, ['hobby1', 'hobby3', 'hobby5'])

    const comB = new Community('B', peter)
    addUsersToCommunity(comB, [anna, fred])
    addTagsToCommunity(comB, ['hobby3'])

    const comC = new Community('C', peter)
    addUsersToCommunity(comC, [tom, jenny])
    addTagsToCommunity(comC, ['hobby4', 'hobby5'])

    const comD = new Community('D', fred)
    addUsersToCommunity(comD, [tom, jenny])
    addTagsToCommunity(comD, ['hobby1', 'hobby2', 'hobby3'])

    const comE = new Community('E', anna)
    addUsersToCommunity(comE, [jenny])
    addTagsToCommunity(comE, ['hobby1', 'hobby5'])

    let users = [peter, anna, fred, tom, jenny]
    let communities = [comA, comB, comC, comD, comE]

    return {users, communities, peter}
}

/**
 * Make some more demo data
 * */
const makeMoreDemoData = function() {

    const adrian = new User('adrian', 'mail')
    addInterestsToUser(adrian, ['hobby1', 'hobby2', 'hobby3'])

    const betty = new User('betty', 'mail')
    const jon = new User('jon', 'mail')
    const darren = new User('darren', 'mail')
    const aida = new User('aida', 'mail')

    const comF = new Community('F', adrian)
    addUsersToCommunity(comF, [jon, darren, aida])
    addTagsToCommunity(comF, ['hobby1', 'hobby3', 'hobby5'])

    const comG = new Community('G', betty)
    addUsersToCommunity(comG, [jon, darren])
    addTagsToCommunity(comG, ['hobby3'])

    const comH = new Community('H', aida)
    addUsersToCommunity(comH, [betty, darren])
    addTagsToCommunity(comH, ['hobby4', 'hobby5'])

    const comI = new Community('I', darren)
    addUsersToCommunity(comI, [jon, betty])
    addTagsToCommunity(comI, ['hobby1', 'hobby2', 'hobby3'])

    const comJ = new Community('J', jon)
    addUsersToCommunity(comJ, [betty])
    addTagsToCommunity(comJ, ['hobby1', 'hobby5'])

    let users = [adrian, jon, betty, aida, darren]
    let communities = [comF, comG, comH, comI, comJ]

    return {users, communities}
}



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

module.exports = {
    makePageRankDemoData: makePageRankDemoData
};