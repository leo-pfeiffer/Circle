import {
    client,
    eventData,
    goToCommunity,
    goToProfile,
    isDateMatch,
    timeOfDayFormatter,
    updateCalendar
} from "./clientUtils.js";

/**
 * This file contains the vue components of the calendar.
 * */

const makeMainCalendarVue = function () {
    const mainCalendarVue = new Vue({
        el: '#main-calendar',
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
            goToProfile: function (userId) {
                goToProfile(userId)
            },
            /**
             * Return hour and minute in a nicer format
             * @param {Date} datetime
             * */
            timeOfDayFormatter: function (datetime) {
                return timeOfDayFormatter(datetime)
            },
            setSelectedEvent: function(event) {
                eventData.event = event
            }

        }
    })
}

export const makeCalendar = function () {
    makeMainCalendarVue();
}