/**
 * This file contains vue components that are present in multiple state such as the sidebar or the header.
 * */

import {client} from "./clientUtils.js";

const makeHeaderVue = function() {
    const headerVue = new Vue({
        el: "#header",
        computed: {
            state() {
                return client.state;
            }
        }
    })
}

const makeSidenavVue = function() {
    const sidenavVue = new Vue({
        el: "#sidenav",
        computed: {
            state() {
                return client.state;
            }
        }
    })
}

const makeProfileAccess = function() {
    const profileAccessVue = new Vue({
        el: "#profileAccess",
        computed: {
            state() {
                return client.state;
            },
        },
        // methods: {
        //     profile: function() {
        //         setState('profile');
        //         console.log('should transition to profile')
        //     }
        // }
    })
}


export const makePage = function() {
    makeHeaderVue();
    makeSidenavVue();
    makeProfileAccess();
}
