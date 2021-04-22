/**
 * This file contains the vue components of the logout.
 * */

import { client, setState } from './clientUtils.js'

/**
 * This function contains the functionality for user login out.
 * */
const makeLogoutVue = function () {
    const logoutVue = new Vue({
        el: '#logout',
        computed: {
            state() {
                return client.state;
            },
        },
        methods: {
            backToLogin() {
                setState('login')
            }
        }
    })
}

export const makeLogout = function () {
    makeLogoutVue();
}