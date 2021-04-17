//functions to check GET requests

//function GET all data stored in collection
// const getAllUsers = () => {
// fetch('/api/get-all-users')
// .then(res => res.json())
// .then(data => console.log(data))
// }
// getAllUsers()


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
const addUser = function(){
let data = new Object();
data.userName = "Achintya";
data.userEmail = "A@SpeechGrammarList.com";
fetch(`api/create-user`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(data) 
})
.then (res => res.json())
.then (jsn => { console.log(jsn), console.log("Hello");})}
addUser();

//function to POST new community
// const addCommunity = function(){
// let data = new Object();
// data.communityName = "DIFFERENT COMMUNITY";
// data.admin = {userName: "New User", userEmail: "@gmail.com"};
// fetch(`api/create-community`, {
// method: 'POST',
// headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify(data) 
// })
// .then (res => res.json())
// .then (jsn => { console.log(jsn)})
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
// fetch(`/api/create-thread`, {
// method: 'POST',
// headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify(data) 
// })
// .then (res => res.json())
// .then (jsn => { console.log(jsn)})}
// addComment();
// console.log("I am here")
