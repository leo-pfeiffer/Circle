/**
 * This file contains the code for one part of the community recommendation system.
 * First of all, the given tags by the user are compared to the tags of the communities. If there is an exact match, the corresponding community is returned.
 * If there is no exact match, the Levenshtein distance between the tags given by the user and the community tags are compared.
 * "The Levenshtein distance is the minimum number of single-character edits required to change one word into the other.
 * So the result is a positive integer, sensitive to string length." (https://medium.com/@sumn2u/string-similarity-comparision-in-js-with-examples-4bae35f13968).
 * A community is recommended to the user if the Levenshtein distance is smaller or equal to 3.
 * */

/**
 * Calculate Levenshtein distance between two strings inspired by
 * https://www.tutorialspoint.com/levenshtein-distance-in-javascript
 * @param {string} userInterest
 * @param {string} communityTag
 * @return {Number}
 * */
const levenshteinDistance = function (userInterest = '', communityTag = '') {
    const track = Array(communityTag.length + 1).fill(null)
        .map(() => Array(userInterest.length + 1).fill(null));

    for (let i = 0; i <= userInterest.length; i += 1) {
        track[0][i] = i;
    }

    for (let j = 0; j <= communityTag.length; j += 1) {
        track[j][0] = j;
    }

    for (let j = 1; j <= communityTag.length; j += 1) {
        for (let i = 1; i <= userInterest.length; i += 1) {
            const indicator = userInterest[i - 1] === communityTag[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator,
            );
        }
    }
    return track[communityTag.length][userInterest.length];
};

/**
 * Get a recommendation based on the Levenshtein distance.
 * @param {Array<Object>} allCommunitiesTags
 * @param {Array<string>} userInterests
 * @return {Object<string, Number>}
 * */
const makeRecommendation = function(allCommunitiesTags, userInterests) {

    /**
     * Contains ranking scores.
     * @type {Object<string, Number>}
     * */
    const levenshteinScores = {};

    // for every community
    for (let i=0; i < allCommunitiesTags.length; i++) {
        // for every community tag
        const scores = [];
        for (let tag of allCommunitiesTags[i].tags) {

            const communityTag = tag.toLowerCase();

            // find Levenshtein Distance with each user interest tag
            for (let interest of userInterests) {
                const userInterest = interest.toLowerCase();

                // push all values into an array
                scores.push(levenshteinDistance(userInterest, communityTag))
            }
        }

        let communitySum = scores.reduce((a, b) => a + b, 0)

        // save overall score
        levenshteinScores[allCommunitiesTags[i].id] = (communitySum / scores.length);
    }
    return levenshteinScores
}


/**
 * Levenshtein distance code
 * @param {Array<Object>} allCommunitiesTags
 * @param {Array<string>} userInterests
 * @return {Object<string, Number>}
 */
const calculateLevenshteinScore = function(allCommunitiesTags, userInterests) {
    return makeRecommendation(allCommunitiesTags, userInterests)
}

exports.calculateLevenshteinScore = calculateLevenshteinScore;
