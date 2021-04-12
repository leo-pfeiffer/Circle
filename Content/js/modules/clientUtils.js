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
})

/**
 * Vue observable to pass the search term between components
 * */
export const search = Vue.observable({term: ''})

/**
 * Reset the client Vue observable to its default values
 * */
export const resetClient = function() {
    client.state = 'login';
    client.userData = {
        userId: null,
        username: '',
        picture: '',
    }
}

/**
 * Array that contains all allowed states the client can be in.
 * @type {Array<string>}
 * */
const ALLOWED_STATES = ['login', 'dashboard', 'community', 'profile', 'logout', 'search']


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
        // todo
    }

    else if (newState === "community") {
        // todo
    }

    else if (newState === "profile") {
        // todo
    }

    else if (newState === "logout") {
        // todo
    }

    else if (newState === "search") {
        // todo
    }

    // finally, set the new State
    client.state = newState;
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

export const goToCommunity = function(communityId) {
    // todo call API
    // go to community with id `communityId`
    setState('community')
}

export const goToProfile = function(username) {
    // todo call API
    // go to profile with of `username`
    setState('profile')
}

/**
 * Get a list of all available Font Awesome unicode characters
 * @return {Promise<Array>}
 * */
export const getAvailableIcons = function() {
    const url = 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/metadata/icons.json'

    // use jQuery here instead due to Github's cross domain policy
    return $.getJSON(url).then(data => {
        return Object.entries(data).filter(el => el[1].styles.includes('solid')).map(el => el[1].unicode);
    })
}