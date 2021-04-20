/**
 * This file contains the vue components of a community.
 * */

import {
    client,
    formatDateTime,
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
                return this.communityData.users.map(el => el.name).includes(client.userData.name);
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
             * Join the community
             * */
            join: function() {
                // todo join via API
                let apiResponse = {status: 'success'}
                if (apiResponse.status === 'success') {
                    this.users.push({name: client.userData.name, picture: client.userData.picture})
                }
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