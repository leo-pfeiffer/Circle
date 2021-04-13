import {client, goToCommunity, isDateMatch, timeOfDayFormatter} from "./clientUtils.js";

/**
 * This file contains the vue components of the calendar.
 * */

const makeMainCalendarVue = function() {
    const mainCalendarVue = new Vue({
        el: '#main-calendar',
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
            eventsOnSelectedDay() {
                if (this.selectedDate === null) {
                    return [];
                }
                return this.events.filter(el => isDateMatch(el.datetime, this.selectedDate))
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

export const makeCalendar = function () {
    makeMainCalendarVue();
}