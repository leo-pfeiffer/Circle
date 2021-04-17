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
        this.interests = [];
        this.gender = null;
        this.age = null;
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
        user.location = jsn.location || null;
        user.interests = jsn.interests || [];
        user.gender = jsn.gender || null;
        user.age = jsn.age || null;
        return user;
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
     * */
    constructor(text, title, author) {
        this.text = text
        this.title = title
        this.author = author
        this.comments = []
    }

    /**
     * Method to deserialize a JSON object and create a new Thread object.
     * @param {Object} jsn - The object to deserialize
     * */
    static fromJSON(jsn) {
        let text = jsn.text;
        let title = jsn.title;
        let author = jsn.author;
        if (text === undefined || title === undefined || author === undefined) return null;

        let thread = new Thread(text, title, author)
        thread.comments = jsn.comments || [];
        return thread;
    }

    /**
     * Add a new comment.
     * @param {Object} comment
     * */
    addComment (comment) {
        // todo how do we check that comment.user is actually in the community?
        if (!this.comments.includes(comment)) {
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
     * */
    constructor(text, author) {
        this.text = text
        this.author = author
    }

    /**
     * Method to deserialize a JSON object and create a new Comment object.
     * @param {Object} jsn - The object to deserialize
     * */
    static fromJSON(jsn) {
        let text = jsn.text;
        let author = jsn.author;

        if (text === undefined || author === undefined) return null;
        return new Comment(text, author);
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
        this.events = []

        this.addUser(this.admin, true)
    }

    /**
     * Method to deserialize a JSON object and create a new Community object.
     * @param {Object} jsn - The object to deserialize
     * */
    static fromJSON(jsn) {
        let communityName = jsn.communityName;
        let id = jsn.id
        let admin = jsn.admin;

        if (communityName === undefined || admin === undefined || id === undefined) return null;

        let community = new Community(communityName, admin)
        community.events = jsn.events || [];
        community.threads = jsn.threads || [];
        community.events = jsn.events || [];
        return community;
    }

    /**
     * Add a new thread.
     * @param {Object} thread
     * */
    addThread(thread) {
        if (!this.users.includes(thread.author)) {
            throw new Error('Cannot add thread from non member.')
        }
        if (!this.threads.includes(thread)) {
            this.threads.push(thread)
        }
    }

    /**
     * Add a new user.
     * @param {User} user
     * @param {Boolean}isAdmin
     * */
    addUser(user, isAdmin = false) {
        if (!(this.users.includes(user))) {
            this.users.push(user)
        }
    }

    /**
     * Add a new event.
     * @param {Event} event
     * */
    addEvent(event) {
        if (!(this.users.includes(event.organiser))) {
            throw new Error("Cannot add event to a community without being a member")
        }
        else if (!(this.events.includes(event))) {
            this.events.push(event)
        }
    }

    /**
     * Remove an event
     * @param {Event} event
     * */
    removeEvent(event) {
        this.events.splice(this.events.indexOf(event), 1)
    }


    /**
     * Remove user from community.
     * @param {Object} user
     * */
    removeUser(user) {
        if (user !== this.admin) {
            this.users.splice(this.users.indexOf(user), 1)
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
        if (!(this.community.users.includes(organiser))) {
            throw new Error("Cannot add event to a community without being a member")
        }

        this.community.addEvent(this)
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

        if (title === undefined || description === undefined || community === undefined ||
            organiser === undefined || datetime === undefined) return null;

        let event = new Event(title, description, community, organiser, datetime);

        event.location = jsn.location || null;
        event.link = jsn.link || null;

        return event;
    }
}

/**
 * Export the Event class
 * @type {Class}
 * */
exports.Event = Event;
