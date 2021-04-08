const { v4: uuidv4 } = require('uuid')

/** 
 * Export makeUser().
 * @param userName
 * @param userEmail
 * */
exports.makeUser = (userName, userEmail) => {
    return makeUser(userName, userEmail)
}

/** 
 * Create a new user profile.
 * @param userName
 * @param userEmail
 * */
makeUser = (userName, userEmail) => {
    function User () {
        this.id = uuidv4()
        this.userName = userName;
        this.userEmail = userEmail;
        this.location = null;
        this.communities = [];
        this.interests = [];
        this.gender = null;
        this.age = null;
        this.adminCommunities = [];
        this.comments = []
        this.threads = []


        this.joinCommunity = function(community,isAdmin = false) {
            if (!(this.communities.includes(community))) {
                this.communities.push(community)

                if (isAdmin === true) {
                    this.adminCommunities.push(community)
                }
            }
        }

        /**
         * Leave a new community.
         * @param {Object} community
         * */
        this.leaveCommunity = function(community) {
            if(!this.adminCommunities.includes(community)) {
                this.communities.splice(this.communities.indexOf(community), 1)
            } else {
                throw new Error("Cannot remove admin of a community.")
            }
        }

        /**
         * Add a new interest.
         * @param {string} interest
         * */
        this.addInterest = function(interest) {
            if (!(this.interests.includes(interest))) {
                this.interests.push(interest)
            }
        }

        /**
         * Remove an interest.
         * @param {string} interest
         * */
        this.removeInterest = function(interest) {
            this.interests.splice(this.interests.indexOf(interest), 1)
        }

        /**
         * Add a new thread.
         * @param {Object} thread
         * */
        this.addThread = function(thread) {
            if (!(this.threads.includes(thread))) {
                this.threads.push(thread)
            }
        }

        /**
         * Add a new comment.
         * @param {Object} comment
         * */
        this.addComment = function(comment) {
            if (!(this.comments.includes(comment))) {
                this.comments.push(comment)
            }
        }

    }
    return new User()
}

/** 
 * Export makeThread().
 * @param text
 * @param title
 * @param {Object} author
 * @param {Object} community
 * */
exports.makeThread = (text, title, author, community) => {
    return makeThread(text, title, author, community)
}

/** 
 * Create a new thread.
 * @param text
 * @param title
 * @param {Object} author
 * @param {Object} community
 * */
makeThread = (text, title, author, community) => {
    function Thread ()  {
        this.text = text
        this.title = title
        this.author = author
        this.comments =[]
        this.community = community

        /**
         * Add a new comment.
         * @param {Object} comment
         * */
        this.addComment =  function(comment) {
            if (!(this.comments.includes(comment)) && this.community.users.includes(comment.author)) {
                this.comments.push(comment)
                comment.thread = this
           }
        }
        this.author.addThread(this)
        this.community.addThread(this)
    }
    return new Thread()
}

/** 
 * Export makeComment().
 * @param text
 * @param {Object} author
 * */
exports.makeComment = (text,  author) => {
    return makeComment(text,  author)
}

/** 
 * Create a new comment.
 * @param text
 * @param {Object} author
 * */
makeComment = (text, author) => {
    function Comment (){
        this.text = text
        this.author = author
        this.thread = null

        this.author.addComment(this)

    }
    return new Comment()
}

/** 
 * Export makeCommunity().
 * @param communityName
 * @param {Object} admin
 * */
exports.makeCommunity = (communityName, admin) => {
    return makeCommunity(communityName, admin)
}
/** 
 * Create a new community.
 * @param communityName
 * @param {Object} admin
 * */
makeCommunity = (communityName, admin) => {
    function Community () {
        this.id = uuidv4()
        this.communityName = communityName;
        this.admin = admin;
        this.users = []
        this.threads = []

        /**
         * Add a new thread.
         * @param {Object} thread
         * */
        this.addThread =  function (thread) {
            if (!(this.threads.includes(thread)) && (this.users.includes(thread.author))) {
                this.threads.push(thread)
                thread.community = this
            }
        }

        /**
         * Add a new user.
         * @param {Object} user
         * @param isAdmin
         * */
        this.addUser = function(user, isAdmin = false) {
            if (!(this.users.includes(user))) {
                this.users.push(user)
                user.joinCommunity(this, isAdmin)
            }
        }
        this.addUser(this.admin, true)

        /**
         * Remove user from community.
         * @param {Object} user
         * */
        this.removeUser = function(user) {
            if (user !== this.admin) {
                this.users.splice(this.users.indexOf(user), 1)
                user.leaveCommunity(this)
            } else {
                throw new Error("Cannot remove admin of a community.")
            }
        }
    }
    return new Community()
}

exports.testUserAndCommunity = function() {
    let alice = makeUser('alice', 'alice@mail.com')
    let bob = makeUser('bob', 'bob@mail.com')
    let charly = makeUser('charly', 'charly@mail.com')

    let c1 = makeCommunity('cs5003', alice)
    let c2 = makeCommunity('id5059', bob)
    c2.addUser(alice)

    console.log(alice.communities.map(el => el.communityName))
    console.log(alice.adminCommunities.map(el => el.communityName))
    console.log(c2.users.map(el => el.userName))

    c2.removeUser(alice)
    console.log(c2.users.map(el => el.userName))

    // the following would throw an error
    // c2.removeUser(bob)
    // console.log(c2.users.map(el => el.userName))
}

exports.testcommentAndThread =  function () {
    let alice = makeUser('alice', 'alice@mail.com')
    let bob = makeUser('bob', 'bob@mail.com')
    let charly = makeUser('charly', 'charly@mail.com')

    let c1 = makeCommunity('cs5003', alice)
    let c2 = makeCommunity('id5059', bob)
    c2.addUser(alice)
    let thread = makeThread('hello','cs5003',alice,c2)
    let comment = makeComment ('hello',alice)
   
    console.log(alice.communities.map(el => el.communityName))
    console.log(alice.adminCommunities.map(el => el.communityName))

    console.log(c2.users.map(el => el.userName))

    //c2.addThread(thread)
    console.log(c2.threads)
    thread.addComment(comment)
    console.log(thread.comments)
}

