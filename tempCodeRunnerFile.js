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
    .then(() => dao.getUserObject(demoData.adrian.id))
    .then((res) => {
        console.log(res)
        console.log('done')
    })
    .then(res => {
        process.exit(0);
    })