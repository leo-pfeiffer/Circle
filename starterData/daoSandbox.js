/**
 * Run this file to create test data.
 * */
const dao = require('../dao');
const {makeGeneralTestData, makePageRankDemoData, makeStarterData} = require("./testData");
const { User, Community, Thread, Comment, Event } = require('../models')

// let pageRankDemoData = makePageRankDemoData();
// let demoData = makeGeneralTestData();

let starterData = makeStarterData();

// let userId = demoData.adrian.id
// let communityId = "c50fc1fb-55c3-4f09-8774-59150286bfb4";

dao.init()
    // drop old data
    .then(() => dao.dropCollections())

    .then(() => {
        console.log('Creating logins')
        return starterData.logins.forEach(async (user) => {
            await dao.registerNewUserPassword(user.username, user.password)
        });
    })
    .then(() => {
        console.log('Creating users')
        return dao.addUsers(starterData.users)
    })
    .then(() => {
        console.log('Creating communities')
        return dao.addCommunities(starterData.communities)
    })
    .then(() => {
        console.log('Indexing community')
        return dao.createCommunityIndex()
    })
    .then(() => {
        console.log('Indexing users')
        return dao.createUserIndex()
    })
    .then(() => {
        console.log('done')
        process.exit(0)
    }).catch(err => {
        console.log(err);
        process.exit(1)
    })
