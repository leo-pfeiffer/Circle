/**
 * This file contains utility functions used on the client side as well as information that is shared across
 * files on the client side.
 * */
 import {
    getCommunityStats
} from './charts.js'

/**
 * Vue observable that stores basic information about the client.
 * */
export const client = Vue.observable({
    state: 'login',
    userKey: '',
    userData: {
        id: '',
        name: '',
        picture: '',
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

    // here, we can gather all sorts of things that need to happen if a client transitions into a given state
    // Ideally, we would only like to call other functions from here in order to not clutter up this function with
    // unrelated code snippets.
    if (newState === "login") {
        // todo
    }

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

    // finally, set the new State
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
            // number of activities to get
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
            let obj = {}
            obj.community = { id: activity.community.id, name: activity.community.name };
            obj.thread = { id: activity.thread.id, name: activity.thread.title }
            obj.comment = {
                author: activity.comment.text.author.userName,
                time: formatDateTime(new Date(activity.comment.text.datetime)),
                text: activity.comment.text.text
            }
            mostRecentActivities.activities.push(obj)
        })
        // this.mostRecentActivities = jsn;
    }).catch(err => console.log(err))
}

/**
 * Vue observable for the most recent activities.
 * */
export const mostRecentCommunities = Vue.observable({
    communities: [],
    recentCommunities: []
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
            // at most 4 communities
            num: 4
        })
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get most recent activities')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        console.log("recent community activity", jsn)
        mostRecentCommunities.communities = [];
        mostRecentCommunities.recentCommunities = [];

        jsn.forEach(comm => {
            mostRecentCommunities.communities.push(comm)
            let obj = {}
            obj.name = comm.communityName
            obj.id = comm.id
            mostRecentCommunities.recentCommunities.push(obj)
        })
    }).catch(err => console.log(err))
}

/**
 * Vue observable for all the communities 
 * */
export const allCommunities = Vue.observable({
    communities_all: [],
})


/**
 * Get all the communities
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
            let obj = {};
            obj.name = el.communityName
            obj.id = el.id

            allCommunities.communities_all.push(obj)
        })
    }).catch(err => console.log(err))
}

/**
 * Vue observable for all the owned communities 
 * */
export const allOwnedCommunities = Vue.observable({
    ownedCommunities: [],
})

/**
 * Get a community with all its data and save it to the client observable.
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
            let obj = {};
            obj.name = el.communityName
            obj.id = el.id

            allOwnedCommunities.ownedCommunities.push(obj)
        })
    }).catch(err => console.log(err))
}


/**
 * Get a community with all its data and save it to the client observable.
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
    // go to community with id `communityId`
    setState('community')
    joinRoom(communityId)
}

/**
* Get a user with all its data and save it to the client observable.
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
        client.profileData = jsn;
        console.log('getUser', jsn.id)
    }).catch(err => console.log(err))
}

/**
 * Go to the profile with ID `userId`
 * @param {string} userId
 * */
export const goToProfile = function (userId) {
    console.log('Now going to user profile', userId)
    getUser(userId)
    //todo: getUserStats()
    // go to profile with of `userId`
    client.profileData.id = userId
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
 * Also define action handlers of socket.io
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