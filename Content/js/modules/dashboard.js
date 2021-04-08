/**
 * This file contains the vue components of the dashboard.
 * */

import {client, setState} from './clientUtils.js'

const makeShortlistVue = function() {
    const shortlistVue = new Vue({
        el: '#shortlist',
        computed: {
            state() {
                return client.state;
            },
        },
        data: {
            // todo fill this with actual communities
            shortListedCommunities: [
                {name: 'Gardening', id: 1},
                {name: 'Tennis', id: 2},
                {name: 'Painting', id: 3},
                {name: 'Cooking', id: 4}
            ]
        },
        methods: {
            goToCommunity: function(communityId) {
                // go to community with id `communityId`
                setState('community')
            }
        }
    })
}

export const makeDashboard = function () {
    makeShortlistVue();
}