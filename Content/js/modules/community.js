/**
 * This file contains the vue components of a community.
 * */

import {client, formatDateTime, goToProfile, setState} from './clientUtils.js'

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
                {name: 'lebron', picture: 'https://randomuser.me/api/portraits/men/7.jpg', numComments: 12},
                {name: 'kobe', picture: 'https://randomuser.me/api/portraits/men/8.jpg', numComments: 13},
                {name: 'shaquille', picture: 'https://randomuser.me/api/portraits/men/9.jpg', numComments: 14},
                {name: 'kareem', picture: 'https://randomuser.me/api/portraits/men/10.jpg', numComments: 16},
                {name: 'michael', picture: 'https://randomuser.me/api/portraits/men/11.jpg', numComments: 3},
                {name: 'stephen', picture: 'https://randomuser.me/api/portraits/men/12.jpg', numComments: 0},
                {name: 'bill', picture: 'https://randomuser.me/api/portraits/men/13.jpg', numComments: 0},
                {name: 'larry', picture: 'https://randomuser.me/api/portraits/men/14.jpg', numComments: 1},
                {name: 'dirk', picture: 'https://randomuser.me/api/portraits/men/15.jpg', numComments: 5},
            ],
            newTag: '',
        },
        computed: {
            state() {
                return client.state;
            },
            // todo this is most likely obsolete
            formattedTags() {
                let fmtString = "";
                for (let tag of this.tags) {
                    fmtString += tag
                    fmtString += this.tags.indexOf(tag) + 1 < this.tags.length ? ', ' : ''
                }
                return fmtString;
            }
        },
        methods: {
            addTag: function() {
                // todo connect to API
                if (this.tags.includes(this.newTag)) {
                    console.log("new tag already in tags.")
                    return;
                }
                if ((this.newTag.length <= 20) && (this.newTag.length > 0)) {
                    this.tags.push(this.newTag)
                    this.newTag = '';
                }
                else {
                    console.log("tag requires length 1 <= x <= 20.")
                }
            },
            removeTag: function(tag) {
                // todo connect to API
                this.tags.splice(this.tags.indexOf(tag), 1)
            },
            goToProfile: function(username) {
                goToProfile(username)
            },
            /**
             * Get n most frequent contributors.
             * @param {Number} n. If n = -1, all are returned
             * */
            getMostFrequentContributors: function(n=-1) {
                n = n === -1 ? this.users.length : n;
                return [...this.users].sort((a, b) => b.numComments - a.numComments).slice(0, n);
            }
        }
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