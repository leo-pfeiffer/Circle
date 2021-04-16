/**
 * This file contains utility functions used on the client side as well as information that is shared across
 * files on the client side.
 * */

/**
 * Vue observable that stores basic information about the client.
 * */
export const client = Vue.observable({
    state: 'login',
    userKey: '',
    userData: {
        userId: null,
        username: '',
        picture: '',
    },
    communityData: {
        id: '',
        name: '',
    }
})

/**
 * Vue observable to pass the search term between components
 * */
export const search = Vue.observable({term: '', type: ''})

/**
 * Reset the client Vue observable to its default values
 * */
const resetClientData = function() {
    client.userData = {
        userId: null,
        username: '',
        picture: '',
    }
}

/**
 * Reset the client Vue observable to its default values
 * */
const resetCommunityData = function() {
    client.communityData = {
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
export const setState = function(newState) {
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
        leaveRoom(client.communityData.id);
        resetCommunityData();
    }

    else if (newState === "community") {
        // todo
    }

    else if (newState === "profile") {
        leaveRoom(client.communityData.id);
        resetCommunityData();
    }

    else if (newState === "logout") {
        leaveRoom(client.communityData.id);
        resetCommunityData();
        resetClientData();
    }

    else if (newState === "search") {
        leaveRoom(client.communityData.id);
        resetCommunityData();
    }

    else if (newState === "calendar") {
        leaveRoom(client.communityData.id);
        resetCommunityData();
    }

    // finally, set the new State
    client.state = newState;
}

/**
 * Join a room.
 * @param {string} room
 * @param {Object} params - additional parameters
 * */
export const joinRoom = function(room, params={}) {
    params.room = room
    socket.emit('join', params);
}

/**
 * Leave a room.
 * @param {string} room
 * @param {Object} params - additional parameters
 * */
export const leaveRoom = function(room, params={}) {
    params.room = room
    socket.emit('leave', params);
}


/**
 * Format a Date object as string.
 * @param {Date} dateTime
 * */
export const formatDateTime = function(dateTime) {
    let str = ''
    str += dateTime.getDate() + '/'
    str += (dateTime.getMonth() + 1) + '/'
    str += dateTime.getFullYear() + ', '
    str += dateTime.getHours() + ':'
    str += dateTime.getMinutes()
    return str
}

/**
 * Return hour and minute in a nicer format
 * @param {Date} datetime
 * */
export const timeOfDayFormatter = function(datetime) {
    let hour = `${datetime.getHours()}`
    let minute = `${datetime.getMinutes()}`
    hour = hour.length === 2 ? hour : `0${hour}`
    minute = minute.length === 2 ? minute : `0${minute}`
    return hour + ':' + minute
}

export const goToCommunity = function(communityId) {
    // todo call API
    // go to community with id `communityId`
    setState('community')
    joinRoom(communityId)
    console.log('helloooooo')
}

export const goToProfile = function(username) {
    // todo call API
    // go to profile with of `username`
    setState('profile')
}

/**
 * Check if two Date objects have the same date (year, month, day).
 * @param {Date} date1
 * @param {Date} date2
 * @return {boolean}
 * */
export const isDateMatch = function(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth()
    )
}

/**
 * Create a bar chart 
 * */
export const createChart = function(chartId, chartData) {
    const ctx = document.getElementById(chartId);
    const myChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
    });
}

/**
 * Create a socket connection.
 * */
let socket = null;

/**
 * Add authentication to socket.
 * */
export const addAuthToSocket = function() {
    let username = client.userData.username
    socket.auth = { username };
}

export const makeSocket = function() {
    if (client.userData.username !== '' || client.userData.username !== null) {
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

export const destroySocket = function() {
    socket.disconnect();
    socket = null;
    console.log('disconnected from socket')
}
