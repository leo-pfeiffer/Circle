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
                console.log('Cannot remove admin')
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

    }
    return new User()
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
                console.log('Cannot remove admin')
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

    c2.removeUser(bob)
    console.log(c2.users.map(el => el.userName))
}
