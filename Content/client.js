//functions to check GET requests

//function GET all users stored in user collection
// const getAllUsers = () => {
// fetch('/api/get-all-users')
// .then(res => res.json())
// .then(data => console.log(data))
// }
// getAllUsers()

// //function GET all Communities stored in Communities collection
// const getAllCommunities = () => {
//     fetch('/api/get-community')
//     .then(res => res.json())
//     .then(data => console.log(data))
//     }

// getAllCommunities()

//function GET all threads stored in threads collection
// const getAllThreads= () => {
//     fetch('/api/get-thread')
//     .then(res => res.json())
//     .then(data => console.log(data))
//     }

// getAllThreads()

//function GET all comments stored in comments collection
// const getAllComments= () => {
//     fetch('/api/get-comment')
//     .then(res => res.json())
//     .then(data => console.log(data))
//     }

// getAllComments()

//function to GET community object
// const getCommunity = () => {
// fetch('/api/get-community')
// .then(res => res.json())
// .then(data => console.log(data))
// }
// getCommunity()


//function to GET thread object
// const getThread = () => {
// fetch('/api/get-thread')
// .then(res => res.json())
// .then(data => console.log(data))
// }
// getThread()

//function to GET comment object
// const getComment = () => {
// fetch('/api/get-comment')
// .then(res => res.json())
// .then(data => console.log(data))
// console.log('inside client.js')
// }
// getComment()

//function to GET comment object
// const getEvent = () => {
// fetch('/api/get-event')
// .then(res => res.json())
// .then(data => console.log(data))
// }
// getEvent()

// const addUser = function(){
// let data = new Object();
// data.userName = "Achintya";
// data.userEmail = "A@gmail.com";
// fetch(`api/create-user`, {
// method: 'POST',
// headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify(data) 
// })
// .then (res => res.json())
// .then (jsn => { console.log(jsn), console.log("Hello");})}
// addUser();
// console.log("I am here")

//functions to check POST requests

// function to POST new user
// const addUser = function(){
//     let data = new Object();
//     data.userName = "Achintya";
//     data.userEmail = "A@SpeechGrammarList.com";
//     fetch(`api/create-user`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             "Authorization": "Basic " + btoa('user:pw')
//         },
//         body: JSON.stringify(data)
//     })
//     .then (res => res.json())
//     .then (jsn => {
//         console.log(jsn), console.log("Hello");
//     }
// )}
// addUser();

// // function to POST new community
// const addCommunity = function(){
//     let data = new Object();
//     data.communityName = "DIFFERENT COMMUNITY";
//     data.admin = {userName: "New User", userEmail: "@gmail.com"};
//     fetch(`api/create-community`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             "Authorization": "Basic " + btoa('user:pw')
//         },
//         body: JSON.stringify(data)
//     })
//     .then(res => res.json())
//     .then(jsn => { console.log(jsn)})
// }
// addCommunity();

//function to POST new thread
// const addThread = function(){
// let data = new Object();
// data.communityName = "CS5003";
// data.text = "This is my fiest thread";
// data.title ="Thread"
// data.admin = {userName: "New User", userEmail: "@gmail.com"}
// fetch(`/api/create-thread`, {
// method: 'POST',
// headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify(data) 
// })
// .then (res => res.json())
// .then (jsn => { console.log(jsn)})}

// addThread();


// //function to POST new comment
// const addComment = function(){
// let data = new Object();
// data.communityName = "CS5003";
// data.text = "This is my fiest thread";
// data.text1 ="This is my fiest thread" 
// data.title ="Thread"
// data.admin = {userName: "New User", userEmail: "@gmail.com"}
// fetch(`/api/create-comment`, {
// method: 'POST',
// headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify(data) 
// })
// .then (res => res.json())
// .then (jsn => { console.log(jsn)})}

// addComment();

//function to POST new comment
// const addEvent = function(){
// let data = new Object();
// data.communityName = "CS5003";
// data.title ="Thread"
// data.description = "description"
// data.admin = {userName: "New User", userEmail: "@gmail.com"}
// fetch(`/api/create-event`, {
// method: 'POST',
// headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify(data) 
// })
// .then (res => res.json())
// .then (jsn => { console.log(jsn)})}

// addEvent();
