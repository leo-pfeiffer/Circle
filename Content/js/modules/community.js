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

export const makeCommunity = function () {
    makeCommunityHeaderVue();
}