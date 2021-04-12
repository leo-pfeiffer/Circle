/**
 * This file contains the vue components of the logout.
 * */

import {client, setState} from './clientUtils.js'

const makeLogoutVue = function() {
    const logoutVue = new Vue({
        el: '#logout',
        computed: {
            state() {
                return client.state;
            },
            setState() {
                setState('login')
            },
        },
    })
}

export const makeLogout = function () {
    makeLogoutVue();
}