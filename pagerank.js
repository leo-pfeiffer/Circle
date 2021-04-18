/**
 * This file contains the code for the PageRank Algorithm that we use as one part of our recommendation system.
 * The PageRank was invented by Sergej Brin and Larry Page, the founders of Google, and built the original
 * basis for their world famous search engine.
 *
 * The original paper where the algorithm was introduced is this:
 * Brin, S., Page, L., 1998. The Anatomy of a Large-Scale Hypertextual Web Search Engine.
 *  The Seventh International World Wide Web Conference, 14.-18. April 1998, S. 107-117
 *
 * My main resource for the implementation is
 * Langville, Amy N., and Carl D. Meyer. Google's PageRank and Beyond: The Science of Search Engine Rankings.
 * Princeton University Press, 2006.
 * */

// MathJS
const math = require('mathjs')

/**
 * Implementation of the Google PageRank Algorithm. To run it, create an instance with an adjacency matrix
 * and call the `iterate` method on it.
 * @type {Class}
 * */
const PageRank = class {

    /**
     * Instantiate a new PageRank object with an adjacency matrix
     * @param {Array<Array<Number>>} A: Adjacency matrix.
     * @param {Number} tol: The tolerance threshold for convergence.
     * @param {Number} d: Damping factor. Probability of transitioning to an adjacent node.
     * @param {Number} maxIt: Maximum iteration in case the algorithm doesn't converge.
     * */
    constructor(A, d=0.85, tol=0.01, maxIt=1000) {

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
         * General distribution vector (uniform over the nodes).
         * @type {Array<Number>}
         * */
        this.v = new Array(this.pageCount).fill(this.initProb)
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
     *  @return {Object} - Contains the resulting array, number of iterations, and whether the algorithm converged
     * */
    iterate() {

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
        // add result to the outpu
        output.result = pi.toArray();
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
}

// Adjacency matrix
let A = [
    [0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 0]
]

let rank = new PageRank(A);
let result = rank.iterate();
console.log(result)