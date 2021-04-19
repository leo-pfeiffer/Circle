/** 
 * This file contains the code for one part of the community recommendation system. 
 * First of all, the given tags by the user are compared to the tags of the communities. If there is an exact match, the corresponding community is returned.
 * If there is no exact match, the Levenshtein distance between the tags given by the user and the community tags are compared. 
 * "The Levenshtein distance is the minimum number of single-character edits required to change one word into the other. 
 * So the result is a positive integer, sensitive to string length." (https://medium.com/@sumn2u/string-similarity-comparision-in-js-with-examples-4bae35f13968). 
 * A community is recommended to the user if the Levenshtein distance is smaller or equal to 3. 
 * */


/**
 * Levenshtein distance code inspired by https://www.tutorialspoint.com/levenshtein-distance-in-javascript
 */

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
 
 
 // get user interests array and community tags 
 // todo: implement db requests 
 // dummy data
 
 userInterests = ["swimming", "Gardening", "OutDoor", "watersport"];
 
 allCommunitiesTags = [	
   { _id: 1, name: "Swimming London", tags: ["Swimclub", "Swimming", "water"]},
   { _id: 2, name: "Hiking", tags: ["outdoors", "Nature"]},
   { _id: 3, name: "Healthy Cooking", tags: ["healthy", "Food", "Cooking"]}
   ];
 
 
 // get recommendation based on Levenshtein Distance
 const makeRecommendation = function() {
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
     console.log(scores)
   }
 }
 