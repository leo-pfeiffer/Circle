const { v4: uuidv4 } = require('uuid')

/**
 * Class representing a User.
 * */
User = class {

    /**
     * Create a new User.
     * @param {string} userName - The username of the user
     * @param {string} userEmail - The Email of the user
     * */
    constructor(userName, userEmail) {
        this.id = uuidv4();
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
    }

    /**
     * Deserialize a JSON object and create a new User object from it.
     * @param {Object} jsn - The JSON object to deserialize
     * */
    static fromJSON(jsn) {

        let userName = jsn.userName;
        let userEmail = jsn.userEmail;

        // Assert that the values required for the constructor are not null
        if (userName === undefined || userEmail === undefined) return null;

        // Create the new User instance and fill in the attributes
        let user = new User(userName, userEmail)
        user.location = jsn.location;
        user.communities = jsn.communities;
        user.interests = jsn.interests;
        user.gender = jsn.gender;
        user.age = jsn.age;
        user.adminCommunities = jsn.adminCommunities;
        user.comments = jsn.comments;
        user.threads = jsn.threads;
        return user;
    }

    /**
     * Join a new community.
     * @param {Object} community
     * @param isAdmin
     * */
    joinCommunity(community, isAdmin = false) {
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
    leaveCommunity(community) {
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
    addInterest(interest) {
        if (!(this.interests.includes(interest))) {
            this.interests.push(interest)
        }
    }

    /**
     * Remove an interest.
     * @param {string} interest
     * */
    removeInterest(interest) {
        this.interests.splice(this.interests.indexOf(interest), 1)
    }

    /**
     * Add a new thread.
     * @param {Object} thread
     * */
    addThread(thread) {
        if (!(this.threads.includes(thread))) {
            this.threads.push(thread)
        }
    }

    /**
     * Add a new comment.
     * @param {Object} comment
     * */
    addComment(comment) {
        if (!(this.comments.includes(comment))) {
            this.comments.push(comment)
        }
    }
}

/**
 * Export the User class
 * @type {Class}
 * */
exports.User = User;

/**
 * A class representing a Thread.
 * */
Thread = class {

    /**
     * Create a new Thread.
     * @param {string} text - The content of the thread
     * @param {string} title - The title of the thread
     * @param {User} author - The authoring User
     * @param {Community} community - The community the thread belongs to
     * */
    constructor(text, title, author, community) {
        this.text = text
        this.title = title
        this.author = author
        this.community = community
        this.comments = []

        // Make sure the author is actually a member
        if (!(community.users.includes(author))) {
            throw new Error("Cannot add thread to a community without being a member")
        }

        // add this thread to the author
        this.author.addThread(this)
        // add this thread to the community
        this.community.addThread(this)
    }

    /**
     * Method to deserialize a JSON object and create a new Thread object.
     * @param {Object} jsn - The object to deserialize
     * */
    static fromJSON(jsn) {
        let text = jsn.text;
        let title = jsn.title;
        let author = jsn.author;
        let community = jsn.community;
        if (text === undefined || title === undefined || author === undefined || community === undefined) return null;

        let thread = new Thread(text, title, author, community)
        thread.comments = jsn.comments;
        return thread;
    }

    /**
     * Add a new comment.
     * @param {Object} comment
     * */
    addComment (comment) {
        if (!(this.comments.includes(comment)) && this.community.users.includes(comment.author)) {
            this.comments.push(comment)
            comment.thread = this
        }
    }
}

/**
 * Export the Thread class
 * @type {Class}
 * */
exports.Thread = Thread;

Comment = class {

    /**
     * Create a new Comment.
     * @param {string} text - The content of the comment
     * @param {User} author - The authoring User
     * @param {Thread} thread - The thread the comment belongs to
     * */
    constructor(text, author, thread) {
        this.text = text
        this.author = author
        this.thread = thread

        // Make sure the author is actually a member
        if (!(thread.community.users.includes(author))) {
            throw new Error("Cannot add comment to a thread of a community without being a member")
        }

        this.author.addComment(this)
    }

    /**
     * Method to deserialize a JSON object and create a new Comment object.
     * @param {Object} jsn - The object to deserialize
     * */
    static fromJSON(jsn) {
        let text = jsn.text;
        let author = jsn.author;
        let thread = jsn.thread;

        if (text === undefined || author === author || thread === undefined) return null;
        return new Comment(text, author, thread);
    }
}

/**
 * Export the Comment class
 * @type {Class}
 * */
exports.Comment = Comment;

/**
 * A class representing a Community.
 * */
Community = class {

    /**
     * Create a new Comment.
     * @param {string} communityName - The name of the community
     * @param {User} admin - The admin of the community
     * */
    constructor(communityName, admin) {
        this.id = uuidv4()
        this.communityName = communityName;
        this.admin = admin;
        this.users = []
        this.threads = []

        this.addUser(this.admin, true)
    }

    /**
     * Method to deserialize a JSON object and create a new Community object.
     * @param {Object} jsn - The object to deserialize
     * */
    static fromJSON(jsn) {
        let communityName = jsn.communityName;
        let admin = jsn.admin;

        if (communityName === undefined || admin === undefined) return null;

        let community = new Community(communityName, admin)
        community.id = jsn.id;
        community.threads = jsn.threads;
        return community;
    }

    /**
     * Add a new thread.
     * @param {Object} thread
     * */
    addThread(thread) {
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
    addUser(user, isAdmin = false) {
        if (!(this.users.includes(user))) {
            this.users.push(user)
            user.joinCommunity(this, isAdmin)
        }
    }

    /**
     * Remove user from community.
     * @param {Object} user
     * */
    removeUser(user) {
        if (user !== this.admin) {
            this.users.splice(this.users.indexOf(user), 1)
            user.leaveCommunity(this)
        } else {
            throw new Error("Cannot remove admin of a community.")
        }
    }
}

/**
 * Export the Community class
 * @type {Class}
 * */
exports.Community = Community;

Event = class {

    /**
     * Create a new Event.
     * @param {string} title - The title of the event
     * @param {string} description - A description of the event
     * @param {Community} community - The community the event belongs to
     * @param {User} organiser - The user that created the event
     * @param {Date} datetime - The date and time of the event
     * */
    constructor(title, description, community, organiser, datetime) {
        this.title = title
        this.description = description
        this.community = community
        this.organiser = organiser
        this.datetime = datetime

        /**
         * @type {string | null}
         * */
        this.location = null;

        /**
         * @type {string | null}
         * */
        this.link = null;

        // Make sure the organiser is actually a member
        if (!(community.users.includes(organiser))) {
            throw new Error("Cannot add event to a community without being a member")
        }
    }

    /**
     * Method to deserialize a JSON object and create a new Event object.
     * @param {Object} jsn - The object to deserialize
     * */
    static fromJSON(jsn) {
        let title = jsn.title;
        let description = jsn.description;
        let community = jsn.community;
        let organiser = jsn.organiser;
        let datetime = jsn.datetime;

        if (title === undefined || description === author || community === undefined ||
            organiser === undefined || datetime === undefined) return null;

        let event = new Event(title, description, community, organiser, datetime);

        event.location = jsn.location;
        event.link = jsn.link;

        return event;
    }
}

/**
 * Export the Event class
 * @type {Class}
 * */
exports.Event = Event;


/**
 * Simple test function to test the user and community classes.
 * */
exports.testUserAndCommunityClasses = function() {
    let alice = new User('alice', 'alice@mail.com')
    let bob = new User('bob', 'bob@mail.com')
    let charly = new User('charly', 'charly@mail.com')

    let c1 = new Community('cs5003', alice)
    let c2 = new Community('id5059', bob)
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

/**
 * Simple test function to test the comment and thread classes
 * */
exports.testCommentAndThreadClasses =  function () {
    let alice = new User('alice', 'alice@mail.com')
    let bob = new User('bob', 'bob@mail.com')
    let charly = new User('charly', 'charly@mail.com')

    let c1 = new Community('cs5003', alice)
    let c2 = new Community('id5059', bob)
    c2.addUser(alice)
    let thread = new Thread('hello','cs5003',alice,c2)
    let comment =new Comment ('hello',alice)

    console.log(alice.communities.map(el => el.communityName))
    console.log(alice.adminCommunities.map(el => el.communityName))

    console.log(c2.users.map(el => el.userName))

    //c2.addThread(thread)
    console.log(c2.threads)
    thread.addComment(comment)
    console.log(thread.comments)
}
