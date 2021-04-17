/**
 * This file contains the vue components of a community.
 * */

import {
    client,
    formatDateTime,
    goToProfile,
    isDateMatch,
    timeOfDayFormatter, 
    createChart
} from './clientUtils.js'

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
            selectedDate: null,
            // todo get from API (only for current community)
            events: [
                {title: 'Brunch', desciption: 'Just brunch.. ', community: {name: 'Gardening', id: 1}, organiser: {username: 'lebron', id: 123}, datetime: new Date(2021, 3, 1, 10, 0)},
                {title: 'Lunch', desciption: 'Just lunch.. ', community: {name: 'Gardening', id: 1}, organiser: {username: 'lebron', id: 123}, datetime: new Date(2021, 3, 10, 13, 0)},
                {title: 'Breakfast', desciption: 'Just breakhast.. ', community: {name: 'Gardening', id: 1}, organiser: {username: 'lebron', id: 123}, datetime: new Date(2021, 3, 10, 9, 0)},
                {title: 'Tea', desciption: 'Just tea.. ', community: {name: 'Gardening', id: 1}, organiser: {username: 'lebron', id: 123}, datetime: new Date(2021, 3, 22, 17, 0)},
                {title: 'Brunch', desciption: 'Just brunch.. ', community: {name: 'Gardening', id: 1}, organiser: {username: 'lebron', id: 123}, datetime: new Date(2021, 3, 6, 10, 0)},
                {title: 'Brunch', desciption: 'Just brunch.. ', community: {name: 'Gardening', id: 1}, organiser: {username: 'lebron', id: 123}, datetime: new Date(2021, 3, 16, 11, 0)},
            ],
        },
        computed: {
            state() {
                return client.state;
            },
            attributes() {
                return [{
                    bar: {backgroundColor: 'blue'},
                    dates: this.events.map(el => el.datetime),
                }]
            },
            /**
             * Return all events of the currently selected day sorted by time of event.
             * */
            eventsOnSelectedDay() {
                if (this.selectedDate === null) {
                    return [];
                }
                return this.events.filter(el => isDateMatch(el.datetime, this.selectedDate))
                    .sort((a, b) => a.datetime - b.datetime)
            }
        },
        methods: {
            /**
             * Return hour and minute in a nicer format
             * @param {Date} datetime
             * */
            timeOfDayFormatter: function(datetime) {
                return timeOfDayFormatter(datetime)
            }
        }
    })
}

const makeCommunityInfoVue = function() {
    const communityInfoVue = new Vue({
        el: '#community-info',
        data: {
            id: "someId",
            name: "Gardening",
            admin: "michaeljordan23",
            symbol: 'fas fa-seedling',
            description: 'This is a community about gardening, which seems to be a very interesting pass time for some. If ' +
                'you are one of them, please join! 🪴🌵',
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
            activityPieChartData: {
                type: 'doughnut',
                data: {
                    labels: ['Comments', 'Threads', 'Events'],
                    datasets:[
                    {
                        data: [99, 12, 6],
                        backgroundColor:[
                            '#1cc88a',
                            '#4e73df',
                            '#e83e8c'
                          ],
                    }
                ],
                }, 
                options: {
                    title: {
                      display:true,
                      text:'Communitiy Activity',
                      fontSize:20
                    },
                    legend: {
                      display:true,
                      position:'right',
                      labels:{
                        fontColor:'#white'
                      }
                    }
                },
            },
        },
        computed: {
            state() {
                return client.state;
            },
            isMember() {
                return this.users.map(el => el.name).includes(client.userData.name);
            },
            isAdmin() {
                return this.admin === client.userData.name
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
            goToProfile: function(userId) {
                goToProfile(userId)
            },
            /**
             * Get n most frequent contributors.
             * @param {Number} n. If n = -1, all are returned
             * */
            getMostFrequentContributors: function(n=-1) {
                n = n === -1 ? this.users.length : n;
                return [...this.users].sort((a, b) => b.numComments - a.numComments).slice(0, n);
            },
            /**
             * Join the community
             * */
            join: function() {
                // todo join via API
                let apiResponse = {status: 'success'}
                if (apiResponse.status === 'success') {
                    this.users.push({name: client.userData.name, picture: client.userData.picture})
                }
            },
            createChart: function(chartId, chartData) {
                createChart(chartId, chartData)
            },
        },
        mounted() {
            this.createChart('activityDoughnutChart', this.activityPieChartData)
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
                    title: "Spaceships",
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
                    title: "Gigafactory",
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
                    title: "Jack and Jill went up a hill",
                    text: "... you know how it goes.",
                    author: "whoami",
                    time: "30/07/2016, 5:41",
                    comments: []
                },
            ],
            newComments: {},
            newThread: {
                title: '',
                text: '',
            },
            newThreadMessage: '',
        },
        computed: {
            state() {
                return client.state;
            },
        },
        methods: {
            submitNewThread: function() {
                if ((this.newThread.title.trim() !== '') && (this.newThread.text.trim() !== '')) {
                    // todo push to API

                    let thread = {
                        text: this.newThread.text,
                        title: this.newThread.title,
                        time: formatDateTime(new Date()),
                        author: client.userData.name,
                        community: client.communityData.name,
                        comments: []
                    }

                    this.threads.push(thread);

                    console.log("New thread: ", thread.title)

                    this.newThread = {title: '', text: ''}

                } else {
                    this.newThread = {title: '', text: ''}
                    this.newThreadMessage = 'Please enter both a title and a text.'
                    setTimeout(this.resetNewThreadMessage, 5000);
                }
            },
            resetNewThreadMessage: function() {
                this.newThreadMessage = '';
            },
            uploadThreadPicture: function() {
                console.log("Picture for thread uploaded")
            },
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
            },
        }
    })
}

export const makeCommunity = function () {
    makeCommunityHeaderVue();
    makeCommunityFeedVue();
    makeCommunityCalendarVue();
    makeCommunityInfoVue();
}