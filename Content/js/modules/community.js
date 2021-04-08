/**
 * This file contains the vue components of a community.
 * */

import {client, setState} from './clientUtils.js'

const makeCommunityHeaderVue = function() {
    const communityHeaderVue = new Vue({
        el: '#community-header',
        data: {
            name: 'Gardening',
            symbol: 'fas fa-seedling',
        },
        computed: {
            state() {
                return client.state;
            },
        },
    })
}

const makeCommunityCalendarVue = function() {
    const communityCalendarVue = new Vue({
        el: '#community-calendar',
        data: {
        },
        computed: {
            state() {
                return client.state;
            },
        },
    })
}

const makeCommunityFeedVue = function() {
    const communityFeedVue = new Vue({
        el: '#community-feed',
        data: {
            threads: [
                {name: "Thread 1", text: "Lorem ipsum dolor", id: 1},
                {name: "Thread 2", text: "Lorem ipsum dolor", id: 2},
            ]
        },
        computed: {
            state() {
                return client.state;
            },
        },
    })
}

export const makeCommunity = function () {
    makeCommunityHeaderVue();
    makeCommunityFeedVue();
    makeCommunityCalendarVue();
}