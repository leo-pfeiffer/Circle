/**
 * This file contains the vue components of a community.
 * */

import {
    client,
    formatDateTime, goToCommunity,
    goToProfile,
    isDateMatch,
    timeOfDayFormatter,
} from './clientUtils.js'

const makeCommunityHeaderVue = function() {
    const communityHeaderVue = new Vue({
        el: '#community-header',
        computed: {
            state() {
                return client.state;
            },
            communityData() {
                return client.communityData
            }
        },
    })
}

const makeNewEventModalVue = function() {
    const newEventModalVue = new Vue({
        el: '#new-event-modal',
        data: {
            title: '',
            description: '',
            datetime: '',
            location: '',
            link: '',
            message: '',
        },
        computed: {
            state() {
                return client.state;
            },
            communityData() {
                return client.communityData
            }
        },
        methods: {
            createEvent() {
                if (!(this.title && this.description && this.datetime)) {
                    this.message = "Please enter at least a title, description and time."
                } else if (this.datetime < new Date()){
                    this.message = "Event should be in the future."
                } else {
                    const payload = {
                        title: this.title,
                        description: this.description,
                        datetime: this.datetime,
                        location: this.location,
                        link: this.link,
                        communityId: this.communityData.id,
                    };
                    fetch('/api/create-event/', {
                        method: "POST",
                        headers: {
                            "Authorization": "Basic " + client.userKey,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    }).then((res) => {
                        if (!res.ok) {
                            throw new Error('Failed to create event')
                        } else {
                            return res.json()
                        }
                    }).then((jsn) => {
                        console.log(jsn)
                        this.title = ''
                        this.description = ''
                        this.datetime = ''
                        this.location = ''
                        this.link = ''
                        goToCommunity(this.communityData.id)
                    }).catch(err => {
                        console.log(err)
                        this.message = 'Failed to create event. Please try again.'
                    })
                }
            }
        },
    })
}

const makeCommunityCalendarVue = function() {
    const communityCalendarVue = new Vue({
        el: '#community-calendar',
        data: {
            selectedDate: null,
        },
        computed: {
            state() {
                return client.state;
            },
            attributes() {
                return [{
                    bar: {backgroundColor: 'blue'},
                    dates: this.communityData.events.map(el => new Date(el.datetime)),
                }]
            },
            communityData() {
                return client.communityData
            },
            /**
             * Return all events of the currently selected day sorted by time of event.
             * */
            eventsOnSelectedDay() {
                if (this.selectedDate === null) {
                    return [];
                }
                return this.communityData.events.filter(el => isDateMatch(new Date(el.datetime), this.selectedDate))
                    .sort((a, b) => a.datetime - b.datetime)
            }
        },
        methods: {
            /**
             * Return hour and minute in a nicer format
             * @param {Date | string} datetime
             * */
            timeOfDayFormatter: function(datetime) {
                return timeOfDayFormatter(new Date(datetime))
            }
        }
    })
}

const makeCommunityInfoVue = function() {
    const communityInfoVue = new Vue({
        el: '#community-info',
        data: {
            newTag: '',
        },
        computed: {
            state() {
                return client.state;
            },
            isMember() {
                return this.communityData.users.map(el => el.userName).includes(client.userData.name);
            },
            isAdmin() {
                return this.communityData.admin.userName === client.userData.name;
            },
            communityData() {
                return client.communityData
            },
        },
        methods: {
            addTag: function() {

                // todo connect to API
                if (this.communityData.tags.includes(this.newTag)) {
                    console.log("new tag already in tags.")
                    this.newTag = '';
                    return;
                }

                if ((this.newTag.length <= 20) && (this.newTag.length > 0)) {

                    fetch('/api/add-tag/', {
                        method: "POST",
                        headers: {
                            "Authorization": "Basic " + client.userKey,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            communityId: this.communityData.id,
                            tag: this.newTag
                        })
                    }).then((res) => {
                        if (!res.ok) {
                            throw new Error('Failed to add tag')
                        } else {
                            return res.json()
                        }
                    }).then((jsn) => {
                        // trigger reload of the current community data
                        goToCommunity(this.communityData.id)
                        this.newTag = '';
                    }).catch(err => console.log(err))
                }
                else {
                    console.log("tag requires length 1 <= x <= 20.")
                    this.newTag = '';
                }
            },
            removeTag: function(tag) {
                fetch('/api/remove-tag/', {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + client.userKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        communityId: this.communityData.id,
                        tag: tag
                    })
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to remove tag')
                    } else {
                        return res.json()
                    }
                }).then((jsn) => {
                    // trigger reload of the current community data
                    goToCommunity(this.communityData.id)
                    this.newTag = '';
                }).catch(err => console.log(err))

            },
            goToProfile: function(userId) {
                goToProfile(userId)
            },
            /**
             * Join the community
             * */
            join: function() {
                fetch('/api/join-community/', {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + client.userKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        communityId: this.communityData.id,
                    })
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to join community')
                    } else {
                        return res.json()
                    }
                }).then((jsn) => {
                    // trigger reload of the current community data
                    goToCommunity(this.communityData.id)
                }).catch(err => console.log(err))
            },
            /**
             * Leave the community.
             * */
            leave: function() {
                fetch('/api/leave-community/', {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + client.userKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        communityId: this.communityData.id,
                    })
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to leave community')
                    } else {
                        return res.json()
                    }
                }).then((jsn) => {
                    // trigger reload of the current community data
                    goToCommunity(this.communityData.id)
                }).catch(err => console.log(err))
            },
        },
    })
}

const makeCommunityFeedVue = function() {
    const communityFeedVue = new Vue({
        el: '#community-feed',
        data: {
            // todo Threads should be sorted by most recent first -> maybe make computed property for this
            newComments: {},
            newThread: {
                title: '',
                text: '',
            },
            newThreadMessage: '',
            threadPicture: null,
        },
        computed: {
            state() {
                return client.state;
            },
            communityData() {
                return client.communityData
            }
        },
        methods: {
            saveThreadPicture: function(event) {
                if (!event.target.files.length) return;
                const imgFile = event.target.files[0]
            
                // create a new file reader
                const reader = new FileReader();
            
                // onload set imgUpload to the relevant file
                reader.onload = (e) => {
                    this.threadPicture = e.target.result;
                }
            
                // read the imgFile in as data URL
                reader.readAsDataURL(imgFile);
            }, 
            uploadThreadPicture: function() {
                console.log("Picture for thread uploaded")
            },
            submitNewThread: function() {
                if ((this.newThread.title.trim() !== '') && (this.newThread.text.trim() !== '')) {
                    // todo push to API

                    let thread = {
                        text: this.newThread.text,
                        title: this.newThread.title,
                    }

                    fetch('/api/create-thread/', {
                        method: "POST",
                        headers: {
                            "Authorization": "Basic " + client.userKey,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            communityId: this.communityData.id,
                            thread: thread,
                        })
                    }).then((res) => {
                        if (!res.ok) {
                            throw new Error('Failed to add thread')
                        } else {
                            return res.json()
                        }
                    }).then((jsn) => {
                        // trigger reload of the current community data
                        console.log(jsn)
                        goToCommunity(this.communityData.id)
                        this.newThread = {title: '', text: ''}
                    }).catch(err => console.log(err))

                } else {
                    this.newThread = {title: '', text: ''}
                    this.newThreadMessage = 'Please enter both a title and a text.'
                    setTimeout(this.resetNewThreadMessage, 5000);
                }
            },
            resetNewThreadMessage: function() {
                this.newThreadMessage = '';
            },
            submitNewComment: function(threadId) {
                if (this.newComments.hasOwnProperty(threadId) && this.newComments[threadId].length > 0) {

                    fetch('/api/create-comment/', {
                        method: "POST",
                        headers: {
                            "Authorization": "Basic " + client.userKey,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            communityId: this.communityData.id,
                            text: this.newComments[threadId],
                            threadId: threadId
                        })
                    }).then((res) => {
                        if (!res.ok) {
                            throw new Error('Failed to add comment')
                        } else {
                            return res.json()
                        }
                    }).then((jsn) => {
                        // trigger reload of the current community data
                        goToCommunity(this.communityData.id)
                        this.newComments[threadId] = "";
                    }).catch(err => console.log(err))
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
    makeNewEventModalVue();
}