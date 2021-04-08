/**
 * This file contains utility functions used on the client side as well as information that is shared across
 * files on the client side.
 * */

/**
 * Vue observable that stores basic information about the client.
 * */
export const client = Vue.observable({
    state: 'login'
})

/**
 * Array that contains all allowed states the client can be in.
 * @type {Array<string>}
 * */
const ALLOWED_STATES = ['login', 'dashboard']


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
        console.log(`Doing something that is necessary whenever we enter the login state.`)
    }

    if (newState === "dashboard") {
        console.log(`Doing something that is necessary whenever we enter the dashboard state.`)
    }

    // finally, set the new State
    client.state = newState;
    console.log(`The user has transitioned from ${client.state} to ${newState}.`)
}