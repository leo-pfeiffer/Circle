/**
 * This file contains the vue components of the dashboard.
 * */

import {client, goToCommunity, isDateMatch, joinRoom, timeOfDayFormatter} from './clientUtils.js'

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


export const makeDashboard = function () {
    makeShortlistVue();
    makeFeedVue();
    makeCalendarPreviewVue();
    makeDashboardHeaderVue();
}