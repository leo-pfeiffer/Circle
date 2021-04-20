/**
 * This file contains the vue components of the dashboard.
 * */

import {
    client,
    goToCommunity,
    isDateMatch,
    mostRecentActivities,
    mostRecentCommunities,
    timeOfDayFormatter,
    updateCalendar
} from './clientUtils.js'

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


const makeShortlistVue = function () {
    const shortlistVue = new Vue({
        el: '#shortlist',
        computed: {
            state() {
                return client.state;
            },
            shortListedCommunities() {
                console.log(mostRecentCommunities.communities.map(el => el.id))
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

const makeFeedVue = function () {
    const feedVue = new Vue({
        el: '#feed',
        data: {},
        computed: {
            state() {
                return client.state;
            },
            mostRecentActivities() {
                return mostRecentActivities.activities;
            }
        },
        methods: {
            goToCommunity: function (communityId) {
                goToCommunity(communityId);
            },
        }
    })
}

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
                    dates: this.events.map(el => new Date (el.datetime)),
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

        }
    })
}

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