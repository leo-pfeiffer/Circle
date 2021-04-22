/**
 * This file contains utility functions used on the client side as well as information that is shared across
 * files on the client side.
 * */
import {
    getCommunityStats,
    getUserComments
} from './charts.js'

/**
 * Vue observable that stores basic information about the client.
 * */
export const client = Vue.observable({
    state: 'login',
    userKey: '',
    userData: {
        id: '',
        userName: '',
        picture: '',
        userEmail: '',
        location: '',
        interests: [],
        gender: '',
        age: '',
    },
    communityData: {
        id: '',
        name: '',
        admin: {},
        users: [],
        events: [],
        threads: [],
        symbol: '',
    },
    profileData: {
        id: '',
        userName: '',
        picture: '',
        userEmail: '',
        location: '',
        interests: [],
        gender: '',
        age: '',
    }
})

/**
 * Vue observable to pass the search term between components
 * */
export const search = Vue.observable({
    term: '',
    type: '',
    communityResults: [],
    userResults: []
})

/**
 * Reset the userData of the client Vue observable to its default values
 * */
const resetClientData = function () {
    client.userData.id = '';
    client.userData.name = '';
    client.userData.picture = '';
}


/**
 * Reset the profileData of the client Vue observable to its default values
 * */
const resetProfileData = function () {
    client.profileData = {
        id: '',
        name: '',
    }
}

/**
 * Array that contains all allowed states the client can be in.
 * @type {Array<string>}
 * */
const ALLOWED_STATES = ['login', 'dashboard', 'community', 'profile', 'logout', 'search', 'calendar']


/**
 * Function to control state transitions.
 * @param {string} newState
 * */
export const setState = function (newState) {
    if (!(ALLOWED_STATES.includes(newState))) {
        throw new Error(`Invalid state: ${newState}. Must be one of ${ALLOWED_STATES}`)
    }

    // all the changes that need to happen if a client transitions into a given state are gathered here
    // Ideally, we would only like to call other functions from here in order to not clutter up this function with
    // unrelated code snippets.

    else if (newState === "dashboard") {
        search.term = ''
        getMostRecentActivities();
        getMostRecentlyActiveCommunities();
        leaveRoom(client.communityData.id);
        resetProfileData();
        getUpdateCalendar();
        getAllCommunities();
        getAllOwnedCommunity();
    }

    else if (newState === "community") {
        search.term = ''
        resetProfileData();
    }

    else if (newState === "profile") {
        search.term = ''
        leaveRoom(client.communityData.id);
    }

    else if (newState === "logout") {
        search.term = ''
        leaveRoom(client.communityData.id);
        resetClientData();
        resetProfileData();
    }

    else if (newState === "search") {
        leaveRoom(client.communityData.id);
        resetProfileData();
    }

    else if (newState === "calendar") {
        search.term = ''
        leaveRoom(client.communityData.id);
        getUpdateCalendar();
        resetProfileData();
    }

    //setting the state
    client.state = newState;
}

/**
 * Vue observable for calendar updates.
 * */
export const updateCalendar = Vue.observable({
    events: []
})

/**
 * Vue observable for calendar updates.
 * */
export const eventData = Vue.observable({
    //TODO
    event: null
})

/**
 * Get the events to display on the dashboard calendar.
 * */
export const getUpdateCalendar = function () {
    fetch('/api/get-user-events/', {
        method: "GET",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        }

    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get user events')
        } else {
            return res.json();
        }
    }).then(jsn => {
        updateCalendar.events = [];

        jsn.forEach(element => {
            //retrieving only the required details from the objects returned
            let obj = {}
            obj.id = element.event.id
            obj.title = element.event.title
            obj.description = element.event.description
            obj.link = element.event.link
            obj.location = element.event.location
            obj.community = {
                name: element.community.communityName,
                id: element.community.communityId
            }
            obj.organiser = {
                username: element.event.organiser.userName,
                id: element.event.organiser.id
            }
            obj.datetime = new Date(element.event.datetime)

            //storing the returned objects in the Vue observable
            updateCalendar.events.push(obj)
        })
    }).catch(err => console.log(err))
}

/**
 * Vue observable for the most recent activities.
 * */
export const mostRecentActivities = Vue.observable({
    activities: [],
})

/**
 * Get the most recent activities to display on the dashboard.
 * */
const getMostRecentActivities = function () {
    fetch('/api/get-recent-comments/', {
        method: "POST",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            //number of activities to get
            num: 10
        })
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get most recent activities')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        mostRecentActivities.activities = [];
        jsn.forEach(activity => {
            //retrieving only the required details from the objects returned
            let obj = {}
            obj.community = { id: activity.community.id, name: activity.community.name };
            obj.thread = { id: activity.thread.id, name: activity.thread.title }
            obj.comment = {
                author: activity.comment.text.author.userName,
                time: formatDateTime(new Date(activity.comment.text.datetime)),
                text: activity.comment.text.text
            }

            //storing the returned objects in the Vue observable
            mostRecentActivities.activities.push(obj)
        })
    }).catch(err => console.log(err))
}

/**
 * Vue observable for the most recently active communities.
 * */
export const mostRecentCommunities = Vue.observable({
    communities: [],      //for header display 
    recentCommunities: [] //for sidebar display
})

/**
 * Get the most recent activities to display on the dashboard.
 * */
const getMostRecentlyActiveCommunities = function () {
    fetch('/api/get-recent-communities/', {
        method: "POST",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            //number of communities
            num: 4
        })
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get most recent activities')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        mostRecentCommunities.communities = [];
        mostRecentCommunities.recentCommunities = [];

        jsn.forEach(comm => {

            //storing the returned objects in the Vue observable for header 
            mostRecentCommunities.communities.push(comm)

            //retrieving only the required details from the objects returned
            let obj = {}
            obj.name = comm.communityName
            obj.id = comm.id
            //storing the returned objects in the Vue observable for sidebar
            mostRecentCommunities.recentCommunities.push(obj)
        })
    }).catch(err => console.log(err))
}

/**
 * Vue observable for all the communities the user is a member of.
 * */
export const allCommunities = Vue.observable({
    communities_all: [],
})


/**
 * Get all the communities the user is a member of.
 * */
const getAllCommunities = function () {
    fetch('/api/get-member-communities', {
        method: "GET",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        }
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get all the communities')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        allCommunities.communities_all = [];

        jsn.forEach(el => {
            //retrieving only the required details from the objects returned
            let obj = {};
            obj.name = el.communityName
            obj.id = el.id

            //storing the returned objects in the Vue observable
            allCommunities.communities_all.push(obj)
        })
    }).catch(err => console.log(err))
}

/**
 * Vue observable for all the communities owned by the current user.
 * */
export const allOwnedCommunities = Vue.observable({
    ownedCommunities: [],
})

/**
 * Get all communities owned by the current user.
 * */
const getAllOwnedCommunity = function () {
    fetch('/api/get-owned-communities', {
        method: "GET",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        }
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get all the owned communities')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        allOwnedCommunities.ownedCommunities = [];

        jsn.forEach(el => {
            //retrieving only the required details from the objects returned
            let obj = {};
            obj.name = el.communityName
            obj.id = el.id

            //storing the returned objects in the Vue observable
            allOwnedCommunities.ownedCommunities.push(obj)
        })
    }).catch(err => console.log(err))
}


/**
 * Get a community with all its data and save it to the client observable.
 * @param {string} communityId
 * */
const getCommunity = function (communityId) {

    fetch('/api/community-by-id/', {
        method: "POST",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            communityId: communityId
        })
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get most recent activities')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        //storing the returned data in the client observable
        client.communityData = jsn;
    }).catch(err => console.log(err))
}

/**
 * Go to the community with ID `communityId`
 * @param {string} communityId
 * */
export const goToCommunity = function (communityId) {
    client.communityData.id = communityId;
    getCommunity(communityId)
    getCommunityStats(communityId)
    setState('community')
    joinRoom(communityId)
}

/**
* Get a user with all its data and save it to the client observable.
* @param {string} userId
* */
const getUser = function (userId) {
    fetch('/api/get-user-object/', {
        method: "POST",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: userId
        })
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get user object')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        //storing the returned data in the client observable
        client.profileData = jsn;
    }).catch(err => console.log(err))
}

/**
 * Go to the profile with ID `userId`
 * @param {string} userId
 * */
export const goToProfile = function (userId) {
    client.profileData.id = userId
    getUser(userId)
    getUserComments()
    setState('profile')
}

/**
 * Check if two Date objects have the same date (year, month, day).
 * @param {Date} date1
 * @param {Date} date2
 * @return {boolean}
 * */
export const isDateMatch = function (date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth()
    )
}

/**
 * Return hour and minute in a nicer format
 * @param {Date} datetime
 * */
export const timeOfDayFormatter = function (datetime) {
    let hour = `${datetime.getHours()}`
    let minute = `${datetime.getMinutes()}`
    hour = hour.length === 2 ? hour : `0${hour}`
    minute = minute.length === 2 ? minute : `0${minute}`
    return hour + ':' + minute
}

/**
 * Format a Date object as string.
 * @param {Date} dateTime
 * */
export const formatDateTime = function (dateTime) {
    let str = ''
    str += dateTime.getDate() + '/'
    str += (dateTime.getMonth() + 1) + '/'
    str += dateTime.getFullYear() + ', '
    str += dateTime.getHours() + ':'
    str += dateTime.getMinutes()
    return str
}

// Socket.io related utility functions ======
/**
 * Create the variable that will eventually contain the socket connection.
 * */
let socket = null;

/**
 * Add authentication to socket.
 * */
export const addAuthToSocket = function () {
    let username = client.userData.name
    let password = client.userData.password
    socket.auth = { username: username, password: password };
}

/**
 * Make the actual socket, i.e. instantiate and connect it.
 * Define action handlers of socket.io
 * */
export const makeSocket = function () {
    if (client.userData.name !== '' || client.userData.name !== null) {
        socket = io();

        addAuthToSocket();
        socket.connect();

        socket.on('notify', msg => {
            console.log(msg.data);
        })

    } else {
        console.log('No username provided. Socket not working')
    }
}

/**
 * Destroy the socket and reset it to it's initial state.
 * */
export const destroySocket = function () {
    if (socket.connected) socket.disconnect();
    socket = null;
    console.log('disconnected from socket')
}

/**
 * Join a room.
 * @param {string} room
 * @param {Object} params - additional parameters
 * */
export const joinRoom = function (room, params = {}) {
    params.room = room
    socket.emit('join', params);
}

/**
 * Leave a room.
 * @param {string} room
 * @param {Object} params - additional parameters
 * */
export const leaveRoom = function (room, params = {}) {
    params.room = room
    socket.emit('leave', params);
}