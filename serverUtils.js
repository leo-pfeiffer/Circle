/**
 * Util code that's used across the server.
 * */

/**
 * Normalise the N highest ranks of a Recommendation system output objkect (e.g. Levenshtein, PageRank)
 * @param {Object<string, Number>} scores
 * @param {Number} n
 * @return {Object<string, Number>}
 * */
const normaliseNHighestRanks = function(scores, n) {
    // normalise 5 highest ranked results
    let splitSort = Object.entries(scores)
        .sort((a, b) => b[1] - a[1], 0)
        .slice(0, n)

    let scoreSum = splitSort.map(arr => arr[1]).reduce((a, b) => a+b, 0)

    splitSort = splitSort.map(arr => {
        arr[1] = arr[1] / scoreSum
        return arr;
    })

    // convert back to object
    let normScores = {}
    splitSort.forEach((arr) => normScores[arr[0]] = arr[1])
    return normScores;
}

exports.normaliseNHighestRanks = normaliseNHighestRanks;