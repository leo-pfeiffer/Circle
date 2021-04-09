/*
// For Testing post
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
   // console.log("I am here")
 
    
   
    const addCommunity = function(){
    let data = new Object();
    //let user = {userName: "New User", userEmail: "@gmail.com"}
    data.communityName = "CS5003";
    
    data.admin = {userName: "New User", userEmail: "@gmail.com"};

    console.log(data)

    fetch(`api/create-community`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data) 
    })
    .then (res => res.json())
    .then (jsn => { console.log(jsn)})
    }
    addCommunity();
   // console.log(user)
    console.log("I am here")
    
   

    const addThread = function(){
        let data = new Object();
        //let user = {userName: "New User", userEmail: "@gmail.com"}
        data.communityName = "CS5003";
        
        data.text = "This is my fiest thread";
        data.title ="Thread"
        data.admin = {userName: "New User", userEmail: "@gmail.com"}
    
        fetch(`/api/create-thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) 
        })
        .then (res => res.json())
        .then (jsn => { console.log(jsn)})}
        addThread();
       // console.log(user)
        console.log("I am here")
      */

     const addComment = function(){
        let data = new Object();
        //let user = {userName: "New User", userEmail: "@gmail.com"}
        data.communityName = "CS5003";
        data.text = "This is my fiest thread";
        data.text1 ="This is my fiest thread" 
        data.title ="Thread"
        data.admin = {userName: "New User", userEmail: "@gmail.com"}
    
        fetch(`/api/create-thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) 
        })
        .then (res => res.json())
        .then (jsn => { console.log(jsn)})}
        addComment();
       // console.log(user)
        console.log("I am here")