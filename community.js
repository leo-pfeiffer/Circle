const { uuid } = require('uuid')

exports.makeUser = (userName, userEmail) => {
    function User () {
        this.id = uuid()
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
         * */
        this.joinCommunity = function(community,isAdmin = false) {
            if (!(this.communities.includes(community))) {
                this.communities.push(community)
            }

            if(isAdmin === true && !(this.communities.includes(community)))
            {
                this.adminCommunities.push(community)
            }
        }

        /**
         * Leave a new community.
         * @param {Object} community
         * */
        this.leaveCommunity = function(community) {
            if(!this.adminCommunities.includes(community))
            {
            this.communities.splice(this.communities.indexOf(community), 1)
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



exports.makeCommunity = (CommunityName, Admin) => {
    function Community () {
        this.id = uuid()
        this.CommunityName = CommunityName;
        this.Admin = Admin;
        this.users = []

        this.addUser = function(user, isAdmin = false) {
            if (!(this.users.includes(user))) {
                this.users.push(user)
                user.joinCommunity(this,isAdmin)

            }
        }
        this.addUser(this.Admin, isAdmin = true )

        //Leaving the community
        this.removeUser = function(user) {
            if (user !== this.Admin)
            {
                this.users.splice(this.users.indexOf(user), 1)
                user.leaveCommunity(this)
            }
        }
        
    }
    return new Community()
}
