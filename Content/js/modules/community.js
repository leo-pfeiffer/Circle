/**
 * This file contains the vue components of a community.
 * */

import {client, formatDateTime, setState} from './clientUtils.js'

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
            name: "Gardening",
            admin: "michaeljordan23",
            symbol: 'fas fa-seedling',
            tags: ['gardening', 'wood', 'seeds', 'flowers'],
            users: [
                {name: 'lebron', symbol: 'far fa-angry'},
                {name: 'kobe', symbol: 'far fa-grin-alt'},
                {name: 'shaquille', symbol: 'far fa-flushed'},
                {name: 'kareem', symbol: 'far fa-laugh'},
            ]
        },
        computed: {
            state() {
                return client.state;
            },
            formattedTags() {
                let fmtString = "";
                for (let tag of this.tags) {
                    fmtString += tag
                    fmtString += this.tags.indexOf(tag) + 1 < this.tags.length ? ', ' : ''
                }
                return fmtString;
            }
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
                {
                    id: 3,
                    name: "Jack and Jill went up a hill",
                    text: "... you know how it goes.",
                    author: "whoami",
                    time: "30/07/2016, 5:41",
                    comments: []
                },
            ],
            newComments: {},
        },
        computed: {
            state() {
                return client.state;
            },
        },
        methods: {
            submitNewComment: function(threadId) {
                if (this.newComments.hasOwnProperty(threadId) && this.newComments[threadId].length > 0) {

                    let thread = this.getThreadById(threadId)

                    let comment = {
                        // todo get real username
                        author: 'leopold',
                        text: this.newComments[threadId],
                        time: formatDateTime(new Date)
                    }

                    thread.comments.push(comment)

                    console.log("New comment: ", this.newComments[threadId])
                    // todo send to API
                    this.newComments[threadId] = "";
                }
            },
            getThreadById: function(threadId) {
                let arr = this.threads.filter(thread => thread.id === threadId)
                if (arr.length === 1) {
                    return arr[0]
                } else {
                    console.err(`Thread with id ${threadId} not found.`)
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