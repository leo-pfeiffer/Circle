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

        /**
         * Join a new community.
         * @param {Object} community
         * */
        this.joinCommunity = function(community) {
            if (!(this.communities.includes(community))) {
                this.communities.push(community)
            }
        }

        /**
         * Leave a new community.
         * @param {Object} community
         * */
        this.leaveCommunity = function(community) {
            this.communities.splice(this.communities.indexOf(community), 1)
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

