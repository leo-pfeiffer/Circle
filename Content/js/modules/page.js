/**
 * This file contains vue components that are present in multiple state such as the sidebar or the header.
 * */

import {client, setState} from "./clientUtils.js";

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
        },
        methods: {
            setState: function(newState) {
                setState(newState)
            }
        }
    })
}

export const makePage = function() {
    makeHeaderVue();
    makeSidenavVue();
}
