const mocha = require('mocha');
const chai = require('chai');
const chaiAlmost = require('chai-almost');
const {PageRank} = require("../pagerank");

const {CommunityNetwork} = require("../pagerank");
const {makePageRankDemoData} = require("../testData");
const should = chai.should();
const expect = chai.expect;

chai.use(chaiAlmost(0.01));

/**
 * Create some test data for the tests.
 * */
testData = function() {
    const addUsersToCommunity = function(community, users) {
        for (let user of users) {
            community.addUser(user)
        }
    };
    const addTagsToCommunity = function(community, tags) {
        for (let tag of tags) {
            community.addTag(tag)
        }
    };
    const addEventsToCommunity = function(community, events) {
        for (let event of events) {
            community.addEvent(event);
        }
    };
    const addThreadsToCommunity = function(community, threads) {
        for (let thread of threads) {
            community.addThread(thread);
        }
    };
    const addCommentsToThread = function(thread, comments) {
        for (let comment of comments) {
            thread.addComment(comment);
        }
    };
    const addInterestsToUser = function(user, interests) {
        for (let interest of interests) {
            user.addInterest(interest)
        }
    };

    const peter = new User('peter', 'mail')
    addInterestsToUser(peter, ['hobby1', 'hobby2', 'hobby3'])

    const tom = new User('tom', 'mail')
    const anna = new User('anna', 'mail')
    const jenny = new User('jenny', 'mail')
    const fred = new User('fred', 'mail')

    const comA = new Community('A', peter)
    comA.id = 'A';
    addUsersToCommunity(comA, [tom, anna, jenny])
    addTagsToCommunity(comA, ['hobby1', 'hobby3', 'hobby5'])

    const comB = new Community('B', peter)
    comB.id = 'B';
    addUsersToCommunity(comB, [anna, fred])
    addTagsToCommunity(comB, ['hobby3'])

    const comC = new Community('C', peter)
    comC.id = 'C';
    addUsersToCommunity(comC, [tom, jenny])
    addTagsToCommunity(comC, ['hobby4', 'hobby5'])

    const comD = new Community('D', fred)
    comD.id = 'D'
    addUsersToCommunity(comD, [tom, jenny])
    addTagsToCommunity(comD, ['hobby1', 'hobby2', 'hobby3'])

    const comE = new Community('E', anna)
    comE.id = 'E'
    addUsersToCommunity(comE, [jenny])
    addTagsToCommunity(comE, ['hobby1', 'hobby5'])

    let users = [peter, anna, fred, tom, jenny]
    let communities = [comA, comB, comC, comD, comE]

    return {users, communities, peter}


}()

let communities = testData.communities
let userId = testData.peter.id
let interests = testData.peter.interests

describe("CreateNetwork", function() {
    it("should create a graph with correct nodes", function() {
        let network = new CommunityNetwork(communities, userId, interests)
        network.createGraph();
        let g = network.graph;

        g['A'].should.include('C')
        g['A'].length.should.equal(1)

        g['B'].should.include('A')
        g['B'].length.should.equal(1)

        g['C'].should.include('A')
        g['C'].length.should.equal(1)

        g['D'].should.include('A')
        g['D'].should.include('C')
        g['D'].length.should.equal(2)

        g['E'].should.include('A')
        g['E'].length.should.equal(1)
    });
    it('should create correct adjacency matrix', function() {
        let network = new CommunityNetwork(communities, userId, interests)
        network.createGraph();
        network.createAdjacency();
        let A = network.adjacency;

        A.length.should.equal(5)
        A[0].length.should.equal(5)

        // total sum
        A.map(arr => arr.reduce((a, b) => a+b)).reduce((a, b) => a+b).should.equal(6)

        // elements that are 1
        A[0][2].should.equal(1)
        A[1][0].should.equal(1)
        A[2][0].should.equal(1)
        A[3][0].should.equal(1)
        A[3][2].should.equal(1)
        A[4][0].should.equal(1)
    });
    it('create correct distribution vector when w = 0', function() {
        let network = new CommunityNetwork(communities, userId, interests)
        let v = network.getDistributionVector(0);
        expect(v[0]).to.almost.equal(0.2857)
        expect(v[1]).to.almost.equal(0.1428)
        expect(v[2]).to.almost.equal(0)
        expect(v[3]).to.almost.equal(0.4285)
        expect(v[4]).to.almost.equal(0.1428)
    });
    it('create correct distribution vector when w = 0.5', function() {
        let network = new CommunityNetwork(communities, userId, interests)
        let v = network.getDistributionVector(0.5);
        expect(v[0]).to.almost.equal(0.2428)
        expect(v[1]).to.almost.equal(0.1714)
        expect(v[2]).to.almost.equal(0.1)
        expect(v[3]).to.almost.equal(0.3142)
        expect(v[4]).to.almost.equal(0.1714)
    });
    it('create correct distribution vector when w = 1', function() {
        let network = new CommunityNetwork(communities, userId, interests)
        let v = network.getDistributionVector(1);
        expect(v[0]).to.almost.equal(0.2)
        expect(v[1]).to.almost.equal(0.2)
        expect(v[2]).to.almost.equal(0.2)
        expect(v[3]).to.almost.equal(0.2)
        expect(v[4]).to.almost.equal(0.2)
    })
})

describe("PageRank", function() {
    it("should return correct pi vector", function () {
        let network = new CommunityNetwork(communities, userId, interests)
        network.createGraph();
        network.createAdjacency();
        let v = network.getDistributionVector(0.5);

        let rank = new PageRank(network.adjacency, v);
        let result = rank.iterate(network.communityHash);

        result.iterations.should.equal(23)
        result.converged.should.equal(true)
        expect(result.pi[0]).to.almost.equal(0.4728)
        expect(result.pi[1]).to.almost.equal(0.0257)
        expect(result.pi[2]).to.almost.equal(0.4285)
        expect(result.pi[3]).to.almost.equal(0.0471)
        expect(result.pi[4]).to.almost.equal(0.0257)

        expect(result.mappedResult.A).to.almost.equal(0.4728)
        expect(result.mappedResult.B).to.almost.equal(0.0257)
        expect(result.mappedResult.C).to.almost.equal(0.4285)
        expect(result.mappedResult.D).to.almost.equal(0.0471)
        expect(result.mappedResult.E).to.almost.equal(0.0257)
    });
})