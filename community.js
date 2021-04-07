const { v4: uuidv4 } = require('uuid')

exports.makeUser = (userName, userEmail) => {
    return makeUser(userName, userEmail)
}

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

        /**
         * Join a new community.
         * @param {Object} community
         * @param isAdmin
         * */
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

        this.addThread = function(thread) {
            if (!(this.threads.includes(thread))) {
                this.threads.push(thread)
            }
        }

        this.addComment = function(comment) {
            if (!(this.comments.includes(comment))) {
                this.comments.push(comment)
            }
        }

    }
    return new User()
}



exports.makeThread = (text, title, author) => {
    return makeThread(text, title, author)
}

makeThread = (text, title, author) => {
    function Thread ()  {
        this.text = text
        this.title = title
        this.author = author
        this.comments =[]
        this.community = null

        this.addComment =  function(comment)
        {
            if (!(this.comments.includes(comment))) {
            this.comments.push(comment)
            comment.thread = this
        }
    }
    author.addThread(this) 
}
return new Thread()
}

exports.makeComment = (text,  author) => {
    return makeComment(text,  author)
}

makeComment = (text, author) =>
{
    function Comment (){
        this.text = text
        this.author = author
        this.thread = null

        author.addComment(this) 

    }
    return new Comment()
}

exports.makeCommunity = (communityName, admin) => {
    return makeCommunity(communityName, admin)
}

makeCommunity = (communityName, admin) => {
    function Community () {
        this.id = uuidv4()
        this.communityName = communityName;
        this.admin = admin;
        this.users = []
        this.threads = []

        this.addThread =  function (thread)
        {
            if (!(this.threads.includes(thread))) {
                this.threads.push(thread)
                thread.community = this

        }

        this.addUser = function(user, isAdmin = false) {
            if (!(this.users.includes(user))) {
                this.users.push(user)
                user.joinCommunity(this, isAdmin)
            }
        }
        this.addUser(this.admin, true )

        //Leaving the community
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
