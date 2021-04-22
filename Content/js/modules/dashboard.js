/**
 * This file contains the vue components of the dashboard.
 * */

import {
    client, eventData, formatDateTime,
    goToCommunity, goToProfile,
    isDateMatch,
    mostRecentActivities,
    mostRecentCommunities,
    timeOfDayFormatter,
    updateCalendar
} from './clientUtils.js'

/**
* To make the Dashboard Header
* */
const makeDashboardHeaderVue = function () {
    const dashboardHeaderVue = new Vue({
        el: '#dashboard-header',
        computed: {
            state() {
                return client.state;
            },

        },
    })
}

/**
* To display the most recently active community 
* */
const makeShortlistVue = function () {
    const shortlistVue = new Vue({
        el: '#shortlist',
        computed: {
            state() {
                return client.state;
            },
            shortListedCommunities() {
                return mostRecentCommunities.communities
            }
        },
        data: {
        },
        methods: {
            goToCommunity: function (communityId) {
                goToCommunity(communityId)
            },
        },
    })
}

/**
* To display the most recently activity in the feed. 
* */
const makeFeedVue = function () {
    const feedVue = new Vue({
        el: '#feed',
        data: {},
        computed: {
            state() {
                return client.state;
            },
            mostRecentActivities() {

                // format the datetime
                const activities = []
                mostRecentActivities.activities.forEach(obj => {
                    obj.comment.time = formatDateTime(obj.comment.time)
                    activities.push(obj)
                })

                return activities;
            }
        },
        methods: {
            goToCommunity: function (communityId) {
                goToCommunity(communityId);
            },
        }
    })
}
/**
* To display calendar in the dashboard
* */
const makeCalendarPreviewVue = function () {
    const makeCalendarPreview = new Vue({
        el: '#calendar-preview',
        data: {
            selectedDate: null,
        },
        computed: {
            state() {
                return client.state;
            },
            attributes() {
                return [{
                    bar: { backgroundColor: 'blue' },
                    dates: this.events.map(el => el.datetime),
                }]
            },
            events() {
                return updateCalendar.events
            },

            /**
             * Return all events of the currently selected day sorted by time of event.
             * */
            eventsOnSelectedDay() {
                if (this.selectedDate === null) {
                    return [];
                }
                return this.events.filter(el => isDateMatch(new Date(el.datetime), this.selectedDate))
                    .sort((a, b) => a.datetime - b.datetime)
            }
        },
        methods: {
            goToCommunity: function (communityId) {
                goToCommunity(communityId)
            },
            /**
             * Return hour and minute in a nicer format
             * @param {Date} datetime
             * */
            timeOfDayFormatter: function (datetime) {
                return timeOfDayFormatter(datetime)
            },
            setSelectedEvent: function (event) {
                eventData.event = event
            },
            goToProfile: function (userId) {
                goToProfile(userId)
            },
        }
    })
}

/**
* To display/get random jokes 
* */
const makeJokeVue = function () {
    const jokeVue = new Vue({
        el: '#have-a-laugh',
        data: {
            joke: "You're a smart cookie",
        },
        computed: {
            state() {
                return client.state;
            },
        },
        methods: {
            getJoke() {
                fetch('/api/proxy/joke')
                    .then(res => res.json())
                    .then(jsn => {
                        this.joke = jsn.joke;
                    })
                    .catch(err => console.log(err))
            }
        },
        mounted() {
            this.getJoke();
        }
    })
}


export const makeDashboard = function () {
    makeShortlistVue();
    makeFeedVue();
    makeCalendarPreviewVue();
    makeDashboardHeaderVue();
    makeJokeVue();
}