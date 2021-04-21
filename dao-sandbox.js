/**
 * Run this file to create test data.
 * */
const dao = require('./dao');
const {makeGeneralTestData, makePageRankDemoData, makeStarterData} = require("./testData");
const { User, Community, Thread, Comment, Event } = require('./models')

// let pageRankDemoData = makePageRankDemoData();
// let demoData = makeGeneralTestData();

let starterData = makeStarterData();

// let userId = demoData.adrian.id
// let communityId = "c50fc1fb-55c3-4f09-8774-59150286bfb4";

dao.initStarterData()
    // drop old data
    .then(() => dao.dropCollections())

    // // some users
    // .then(() => dao.registerNewUserPassword('test', 'test'))
    // .then(() => dao.registerNewUserPassword('akl8', 'password'))
    // .then(() => dao.registerNewUserPassword('adrian', 'password'))
    // .then(() => dao.registerNewUserPassword('am557', 'password'))
    // .then(() => dao.registerNewUserPassword('gasj1', 'password'))
    // .then(() => dao.registerNewUserPassword('jl341', 'password'))
    //
    // // add new data
    // .then(() => dao.addUsers(pageRankDemoData.users))
    // .then(() => dao.addCommunities(pageRankDemoData.communities))
    // .then(() => dao.addUsers(demoData.users))
    // .then(() => dao.addCommunities(demoData.communities))

    .then(() => {
        return starterData.logins.forEach(async (user) => {
            await dao.registerNewUserPassword(user.username, user.password)
        });
    })
    .then(() => dao.addUsers(starterData.users))
    .then(() => dao.addCommunities(starterData.communities))
    .then(res => {
        console.log('done')
        process.exit(0)
    }).catch(err => {
        console.log(err);
        process.exit(1)
    })
