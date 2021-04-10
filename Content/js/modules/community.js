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

const makeCommunityInfoVue = function() {
    const communityInfoVue = new Vue({
        el: '#community-info',
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
            // todo Threads should be sorted by most recent first -> maybe make computed property for this
            threads: [
                {
                    id: 1,
                    name: "Spaceships",
                    text: "The rumor that I'm building a spaceship to get back to my home planet Mars is totally untrue",
                    author: "elonmusk",
                    time: "05/12/2015, 22:00",
                    comments: [
                        {
                            author: 'realdonaldtrump',
                            text: 'Despite the constant negative press covfefe',
                            time: '06/12/2015, 22:12'
                        },
                        {
                            author: 'someoneelse',
                            text: 'Gesundheit!',
                            time: '07/12/2015, 12:12'
                        },
                        {
                            author: 'someoneelse',
                            text: 'hello!',
                            time: '07/12/2015, 12:12'
                        },
                        {
                            author: 'someoneelse',
                            text: 'hallo!',
                            time: '07/12/2015, 12:12'
                        },
                        {
                            author: 'someoneelse',
                            text: 'salut!',
                            time: '07/12/2015, 12:12'
                        },
                    ]
                },

                {
                    id: 2,
                    name: "Gigafactory",
                    text: "One gigafactory is about the size of 50 billion hamsters",
                    author: "elonmusk",
                    time: "30/07/2016, 5:41",
                    comments: [
                        {
                            author: 'whitequeen',
                            text: 'Beware the Jubjub bird, and shun the frumious Bandersnatch',
                            time: '30/07/2016, 23:12'
                        },
                        {
                            author: 'whiteking',
                            text: 'And hast thou slain the Jabberwock?',
                            time: '31/07/2016, 14:23'
                        },
                    ]
                },
            ],
            newComment: "",
        },
        computed: {
            state() {
                return client.state;
            },
        },
        methods: {
            submitNewComment: function() {
                if (this.newComment.length > 0) {
                    console.log("New comment: ", this.newComment)
                    this.newComment = "";
                }
            }
        }
    })
}

export const makeCommunity = function () {
    makeCommunityHeaderVue();
    makeCommunityFeedVue();
    makeCommunityCalendarVue();
    makeCommunityInfoVue();
}