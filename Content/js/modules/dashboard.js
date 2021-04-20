/**
 * This file contains the vue components of the dashboard.
 * */

import {client, goToCommunity, isDateMatch, mostRecentActivities, timeOfDayFormatter} from './clientUtils.js'

const makeDashboardHeaderVue = function() {
    const dashboardHeaderVue = new Vue({
        el: '#dashboard-header',
        computed: {
            state() {
                return client.state;
            },
        },
    })
}


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
            goToCommunity: function(communityId) {
                goToCommunity(communityId);
            },
        }
    })
}

 const makeCalendarPreviewVue = function() {
     const makeCalendarPreview = new Vue({
         el: '#calendar-preview',
         data: {
             selectedDate: null,
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
             goToCommunity: function(communityId) {
                 goToCommunity(communityId)
             },
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

const makeJokeVue = function() {
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