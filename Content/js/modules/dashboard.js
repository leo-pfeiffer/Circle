/**
 * This file contains the vue components of the dashboard.
 * */

import {client, goToCommunity, setState} from './clientUtils.js'

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
            ],
        },
        methods: {
            goToCommunity: function(communityId) {
                goToCommunity(communityId)
            }
        }
    })
}

const makeFeedVue = function() {
    const feedVue = new Vue({
        el: '#feed',
        data: {
            mostRecentActivities: [
                {
                    community: {name: 'gardening', id: '1'},
                    thread: {name: 'Spaceships', id: 1},
                    comment: {author: 'realdonaldtrump', time: '06/12/2015, 22:12', text: 'Despite the constant negative press covfefe',}
                },
                {
                    community: {name: 'gardening', id: '1'},
                    thread: {name: 'Gigafactory', id: 2},
                    comment: {author: 'whitequeen', time: '30/07/2016, 23:12', text: 'Beware the Jubjub bird, and shun the frumious Bandersnatch',}
                },
                {
                    community: {name: 'gardening', id: '1'},
                    thread: {name: 'Gigafactory', id: 2},
                    comment: {author: 'whitequeen', time: '30/07/2016, 23:12', text: 'Beware the Jubjub bird, and shun the frumious Bandersnatch',}
                },
                {
                    community: {name: 'gardening', id: '1'},
                    thread: {name: 'Gigafactory', id: 2},
                    comment: {author: 'whitequeen', time: '30/07/2016, 23:12', text: 'Beware the Jubjub bird, and shun the frumious Bandersnatch',}
                },
                {
                    community: {name: 'gardening', id: '1'},
                    thread: {name: 'Gigafactory', id: 2},
                    comment: {author: 'whitequeen', time: '30/07/2016, 23:12', text: 'Beware the Jubjub bird, and shun the frumious Bandersnatch',}
                },
                {
                    community: {name: 'gardening', id: '1'},
                    thread: {name: 'Gigafactory', id: 2},
                    comment: {author: 'whitequeen', time: '30/07/2016, 23:12', text: 'Beware the Jubjub bird, and shun the frumious Bandersnatch',}
                },
                {
                    community: {name: 'gardening', id: '1'},
                    thread: {name: 'Gigafactory', id: 2},
                    comment: {author: 'whitequeen', time: '30/07/2016, 23:12', text: 'Beware the Jubjub bird, and shun the frumious Bandersnatch',}
                },
                {
                    community: {name: 'gardening', id: '1'},
                    thread: {name: 'Gigafactory', id: 2},
                    comment: {author: 'whitequeen', time: '30/07/2016, 23:12', text: 'Beware the Jubjub bird, and shun the frumious Bandersnatch',}
                },
            ],
        },
        computed: {
            state() {
                return client.state;
            },
        },
        methods: {
            goToCommunity: function(communityId) {
                // todo get right community
                setState('community')
            },
        }
    })
}

 const makeCalendarPreviewVue = function() {
     const makeCalendarPreview = new Vue({
         el: '#calendarPreview',
         computed: {
             state() {
                 return client.state;
             },
         },
     })
 }


export const makeDashboard = function () {
    makeShortlistVue();
    makeFeedVue();
    makeCalendarPreviewVue();
}