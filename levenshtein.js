/** 
 * This file contains the code for one part of the community recommendation system. 
 * First of all, the given tags by the user are compared to the tags of the communities. If there is an exact match, the corresponding community is returned.
 * If there is no exact match, the Levenshtein distance between the tags given by the user and the community tags are compared. 
 * "The Levenshtein distance is the minimum number of single-character edits required to change one word into the other. 
 * So the result is a positive integer, sensitive to string length." (https://medium.com/@sumn2u/string-similarity-comparision-in-js-with-examples-4bae35f13968). 
 * A community is recommended to the user if the Levenshtein distance is smaller or equal to 3. 
 * */

// dummy data
let userInterests = ["swimming", "Gardening", "OutDoor", "watersport"];

let allCommunitiesTags = [
  { id: 1, name: "Swimming London", tags: ["Swimclub", "Swimming", "water"]},
	{ id: 2, name: "Hiking", tags: ["outdoors", "Nature"]},
  { id: 3, name: "Healthy Cooking", tags: ["healthy", "Food", "Cooking"]}
	];

/**
 * Levenshtein distance code inspired by https://www.tutorialspoint.com/levenshtein-distance-in-javascript
 * @param {Array<Object>} allCommunitiesTags
 * @param {Array<string>} userInterests
 * @return {Object<string, Number>}
 */
export const calculateLevenshteinScore = function(allCommunitiesTags, userInterests) {

  let userInterest;
  let communityTag;

  const levenshteinDistance = (userInterest = '', communityTag = '') => {
    const track = Array(communityTag.length + 1).fill(null).map(() =>
    Array(userInterest.length + 1).fill(null));
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


  //Object storing the score per community
  levenshteinScores = {};

  // get recommendation based on Levenshtein Distance

  // for every community
  for (let i=0; i < allCommunitiesTags.length; i++) {
    // for every community tag
    var scores = new Array();
    for (tag of allCommunitiesTags[i].tags) {
      communityTag = tag.toLowerCase();
      // find Levenshtein Distance with each user interest tag
      for (interest of userInterests) {
        userInterest = interest.toLowerCase();
        // push all values into an array
        scores.push(levenshteinDistance(userInterest, communityTag))
      }
    }
    communitySum = scores.reduce((a, b) => a + b, 0)
    overallScore = (communitySum/ scores.length);
    console.log(overallScore)
    levenshteinScores[allCommunitiesTags[i].id] = overallScore;
  }
  console.log(levenshteinScores)
}
