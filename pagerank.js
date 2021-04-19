/**
 * This file contains the code for the PageRank Algorithm that we use as one part of our recommendation system.
 * PageRank was invented by Sergej Brin and Larry Page, the founders of Google, and built the original
 * basis for their world famous search engine.
 *
 * The original paper where the algorithm was introduced is
 * Brin, S., Page, L., 1998. The Anatomy of a Large-Scale Hypertextual Web Search Engine.
 *  The Seventh International World Wide Web Conference, 14.-18. April 1998, S. 107-117
 *
 * My main resource for the implementation is
 * Langville, Amy N., and Carl D. Meyer. Google's PageRank and Beyond: The Science of Search Engine Rankings.
 *  Princeton University Press, 2006.
 * */

// MathJS
const math = require('mathjs')
const {User} = require("./models");
const {Community} = require("./models");

/**
 * Implementation of the Google PageRank Algorithm. To run it, create an instance with an adjacency matrix
 * and call the `iterate` method on it.
 * @type {Class}
 * */
const PageRank = class {

    /**
     * Instantiate a new PageRank object with an adjacency matrix
     * @param {Array<Array<Number>>} A: Adjacency matrix.
     * @param {Array<Number> | null} v: Distribution vector (if not specified, uniform over the nodes)
     * @param {Number} tol: The tolerance threshold for convergence.
     * @param {Number} d: Damping factor. Probability of transitioning to an adjacent node.
     * @param {Number} maxIt: Maximum iteration in case the algorithm doesn't converge.
     * */
    constructor(A, v=null, d=0.85, tol=0.01, maxIt=1000) {

        /**
         * Adjacency matrix.
         * @type {Array<Array<Number>>}
         * */
        this.A = A;

        /**
         * Number of pages in the adjacency matrix.
         * @type {Number}
         * */
        this.pageCount = A.length;

        /**
         * Initial probability.
         * @type {Number}
         * */
        this.initProb = 1 / this.pageCount;

        /**
         * Damping factor. Probability of transitioning to an adjacent node.
         * @type {Number}
         * */
        this.d = d !== null ? d : 0.85;

        /**
         * Alpha, probability of jumping to random node.
         * @type {Number}
         * */
        this.alpha = 1 - this.d;

        /**
         * The tolerance threshold for convergence.
         * @type {Number}
         * */
        this.tol = tol;

        /**
         * The maximum number of iterations
         * @type {Number}
         * */
        this.maxIt = maxIt;

        /**
         * Hyperlink matrix containing the weighted links between nodes.
         * @type {Array<Array<Number>>}
         * */
        this.H = PageRank.makeMatrixH(A);

        /**
         * Array with binary dangling nodes vector.
         * @type {Array<Number>}
         * */
        this.a = PageRank.detectDangling(A);

        /**
         * General distribution vector (uniform over the nodes if not specified).
         * @type {Array<Number>}
         * */
        this.v = v || new Array(this.pageCount).fill(this.initProb)

        /**
         * Contains result of ranking.
         * */
        this.result = {};
    }

    /**
     * Convert an adjacency matrix into an H (hyperlink) matrix.
     * @param {Array<Array<Number>>} adjacency: The adjacency matrix to convert.
     * @return {Array<Array<Number>>}
     * */
    static makeMatrixH(adjacency) {
        return adjacency.map((row) => {
            const rowSum = row.reduce((a, b) => a + b, 0)
            if (rowSum === 0) return row
            else return row.map(el => el / rowSum)
        })
    }

    /**
     * Perform the Power Method iterations of the algorithm.
     * @param {Object<string, Number> | null} nameMap - optional. Keys are node names, values are index in adjacency matrix.
     * @return {Object} - Contains the resulting array, number of iterations, and whether the algorithm converged
     * */
    iterate(nameMap=null) {

        // the object we will return
        let output = {result: null, iterations: this.maxIt, converged: false}

        // pi vector - the target of our convergence
        let pi = math.matrix(new Array(this.pageCount).fill(1/this.pageCount))

        // save for comparison
        let piPrevious = math.clone(pi)

        // iterate at most until max iterations have been reached
        for (let i=0; i<this.maxIt; i++) {

            // Pi vector scaled by the damping factor
            let scaledPi = math.multiply(this.d, pi)

            // Calculate new pi
            let left = math.multiply(scaledPi, this.H)
            let right = math.multiply(math.add(math.multiply(scaledPi, this.a), this.alpha), this.v)

            pi = math.add(left, right);

            // check convergence on all nodes
            let conv = math.abs(math.subtract(pi, piPrevious)).toArray().filter(el => el > this.tol).length === 0

            // stop if converged
            if (conv) {
                output.converged = true;
                output.iterations = i + 1;
                break;
            }

            // save pi vector of current iteration
            piPrevious = math.clone(pi);
        }

        // add result to the output
        output.pi = pi.toArray();

        // add mapped results if nameMap supplied
        output.mappedResult = nameMap ? PageRank.getMappedResults(output.pi, nameMap) : null;

        // save output
        this.result = output;

        return output
    }

    /**
     * Detect dangling nodes in the adjacency matrix and return them in an array
     * where 0 means the node is non-dangling and 1 means the node is dangling.
     * @param {Array<Array<Number>>} adjacency - Adjacency matrix
     * @return {Array<Number>}
     * */
    static detectDangling(adjacency) {
        let dangling = new Array(adjacency[0].length).fill(0)
        adjacency.forEach((row, i) => {
            if (row.reduce((a, b) => a + b, 0) === 0) {
                dangling[i] = 1
            }
        })
        return dangling
    }

    /**
     * Map the results of a pi vector to the names in a nameMap.
     * @param {Array<Number>} pi - Results of PageRank
     * @param {Object<string, Number>} nameMap - Keys are name of node, values are index in pi
     * @return {Object<string, Number>} keys are name of node, values are ranking
     * */
    static getMappedResults(pi, nameMap) {
        let mappedResults = {}
        Object.entries(nameMap).forEach(([k, v], _) => {
            mappedResults[k] = pi[v]
        })
        return mappedResults;
    }
}

/**
 * Class for the creation of a network graph for a given user. The adjacency matrix of this network can then be used
 * to run the PageRank algorithm.
 * @type {Class}
 * */
const CommunityNetwork = class {

    /**
     * Create a new community network instance.
     * @param {Array<Community>} communities - An array containing all the communities that ought to be in the network.
     * @param {User} user - The user for whom the network graph is built for. Must be in one of the communities.
     * */
    constructor(communities, user) {

        /**
         * An array containing all the communities that ought to be in the network.
         * @type {Array<Community>}
         * */
        this.communities = communities;

        /**
         * The user for whom the network graph is built for. Must be in one of the communities.
         * @type {User}
         * */
        this.user = user;

        /**
         * A hashmap that contains the row/column index of the adjacency matrix as value and the corresponding
         * community name as value.
         * @type {Object<string, Number>}
         * */
        this.communityHash = {};

        /**
         * Slimmed down version of the communities that only contains the community ID and the users.
         * @type {Array<Object>}
         * */
        this.communitiesClean = this.makeCommunitiesClean();

        /**
         * Network graph.
         * @type {Object<string, Array<string>>}
         * */
        this.graph = {};

        /**
         * Adjacency matrix based on the network graph. Initialised as zero matrix.
         * @type {Array<Array<Number>>}
         * */
        this.adjacency = new Array(this.communities.length).fill(0)
            .map(_ => new Array(this.communities.length).fill(0));

        // Fill communityHash and assert that communities are unique
        this.communities.forEach((community, i) => {
            if (this.communityHash.hasOwnProperty(community.communityName)) {
                throw new Error ("Entries in 'communities' must be unique.")
            } else {
                this.communityHash[community.communityName] = i;
            }
        })

        // Assert that user is in one of the communities
        if (!this.communities.map(el => el.users).reduce((a, b) => a.concat(b), []).includes(this.user)) {
            throw new Error ("User must be a member of one of the communities.")
        }
    }

    /**
     * Slim down the array of communities to only contain essential information, i.e. communityId and users.
     * @return {Array<Object>}
     * */
    makeCommunitiesClean() {
        return this.communities.map(community => {
            let obj = {}
            obj.communityName = community.communityName;
            obj.users = community.users.map(user => user.id);
            return obj;
        })
    }

    /**
     * Create the network graph based on the user links.
     * */
    createGraph() {

        // Create nodes for all communities
        for (let community of this.communitiesClean) {

            // initialise some values for the algorithm
            let numUsers = community.users.length
            let maxVal = 0;

            // add the current node
            this.graph[community.communityName] = this.communitiesClean

                // no self references
                .filter(com => com !== community)

                // calculate the closeness score between the current and all other communities
                .map(com => {
                    let obj = {}
                    obj.communityName = com.communityName
                    obj.similarityScore = com.users.filter(v => community.users.includes(v)).length / numUsers
                    maxVal = obj.similarityScore > maxVal ? obj.similarityScore : maxVal
                    return obj
                })

                // keep only the ones with the maximum value
                .filter(com => com.similarityScore === maxVal)

                // only return the name for simplicity
                .map(com => com.communityName)
        }
    }

    /**
     * Create the adjacency matrix from the graph.
     * */
    createAdjacency() {
        if (this.graph === {}) {
            throw new Error("Create graph first (`CommunityNetwork.createNetwork()`) before creating the adjacency matrix.")
        }

        // Create edges for all communities
        for (let community of this.communitiesClean) {

            // get the edges from the current community
            let edgesTo = this.graph[community.communityName]

            // add 1s in the correct place of the adjacency matrix for all edges
            for (let edge of edgesTo) {
                this.adjacency[this.communityHash[community.communityName]][this.communityHash[edge]] = 1;
            }
        }
    }


    /**
     * Create a distribution vector based on tha shared interests. Used as `v` in PageRank.
     * Vector is created by weighting the similarity of user interests and community tags with a uniform distribution.
     * @param {Number} u - Weight of uniform distribution. Defaults to 0.5
     * @return {Array<Number>}
     * */
    getDistributionVector(u=0.5) {

        if (u < 0 || u > 1) {
            throw new Error('`u` must be between 0 and 1.')
        }

        const interests = this.user.interests;
        let custom = this.communities.map(com => com.tags.filter(v => interests.includes(v)).length / interests.length);
        const customSum = custom.reduce((a, b) => a + b, 0);
        custom = custom.map(el => el / customSum);

        const uniform = new Array(custom.length).fill(1 / custom.length);
        return custom.map((el, i) => (1-u) * el + u * uniform[i])
    }
}

// ======== Test CommunityNetwork ========

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

let communities = [comA, comB, comC, comD, comE]

let network = new CommunityNetwork(communities, peter)
network.createGraph();
network.createAdjacency();
let v = network.getDistributionVector(0.5);

console.log(math.matrix(network.adjacency))

// adjacency should be:
//     [ 0, 0, 1, 0, 0 ],
//     [ 1, 0, 0, 0, 0 ],
//     [ 1, 0, 0, 0, 0 ],
//     [ 1, 0, 1, 0, 0 ],
//     [ 1, 0, 0, 0, 0 ]

// v should be:
//     [
//      0.24285714285714285,
//      0.17142857142857143,
//      0.1,
//      0.3142857142857143,
//      0.17142857142857143
//     ]

let rank = new PageRank(network.adjacency, v);
let result = rank.iterate(network.communityHash);
console.log(result)


// ======== Test PageRank ========
// Adjacency matrix
let A = [
    [0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 0]
]

// let rank = new PageRank(A);
// let result = rank.iterate();
// console.log(result)