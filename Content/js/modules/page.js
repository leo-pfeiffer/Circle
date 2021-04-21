/**
 * This file contains vue components that are present in multiple state such as the sidebar or the header.
 * */

import {
    client,
    destroySocket, eventData, getUpdateCalendar,
    goToCommunity, goToProfile,
    joinRoom,
    search,
    setState,
    allCommunities, mostRecentCommunities
} from "./clientUtils.js";

const makeHeaderVue = function() {
    const headerVue = new Vue({
        el: "#header",
        computed: {
            state() {
                return client.state;
            },
            searchTerm: {
                get: function() {
                    return search.term;
                },
                set: function(searchRequest) {
                    search.term = searchRequest;
                }
            },
            username() {
                return client.userData.name;
            }
        },
        watch: {
            searchTerm() {
                this.search()
            }
        },
        methods: {
            goToProfile: function() {
                goToProfile(client.userData.id)
            },
            goToSearch: function() {
                setState('search')
            },
            logout: function() {
                setState('logout')
                destroySocket();
            },
            search: function() {
                // don't do anything if no search term was entered
                if (search.term === '') return;
                search.type = 'search'
                console.log('searching')

                fetch("/api/get-search-results/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Basic " + client.userKey,
                    },
                    body: JSON.stringify({searchTerm: search.term})
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to create new community.')
                    }
                    else {
                        return res.json()
                    }
                }).then((jsn) => {
                    search.communityResults = jsn.communityResults
                    search.userResults = jsn.userResults
                    console.log(search.communityResults)
                    console.log(search.userResults)
                }).catch((err) => {
                    console.log(err)
                })

                this.goToSearch();
            },
            getRecommendations: function () {
                search.type = 'recommendation'

                fetch("/api/get-recommendation/", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Basic " + client.userKey,
                    },
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to get recommendation.')
                    }
                    else {
                        return res.json()
                    }
                }).then((jsn) => {
                    console.log(jsn)
                    search.communityResults = jsn.communities || []
                    this.goToSearch();
                }).catch((err) => {
                    console.log(err)
                })
            }
        },
    })
}

const makeNewCommunityModalVue = function () {
    const newCommunityModalVue = new Vue({
        el: '#new-community-modal',
        data: {
            newCommunity: {
                name: null,
                description: null,
                tags: null,
                picture: null,
            },
            message: '',
            success: false,
            availableIcons: [],
        },
        methods: {
            createNewCommunity: async function() {

                // make sure all the required data is entered
                if (this.newCommunity.name === null || this.newCommunity.name === '' ||
                    this.newCommunity.description === null || this.newCommunity.description === '' ||
                    this.newCommunity.tags === null || this.newCommunity.tags === ''
                ) {
                    this.message = 'Please fill out all the required fields.'
                    this.success = false;

                    // reset this message and status after 5 seconds
                    setTimeout(this.resetMessageAndStatus, 5000);
                    return;
                }

                // split tags into list
                this.newCommunity.tags = this.newCommunity.tags.split(' ').filter(el => el !== "")

                fetch('/api/create-community/', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Basic " + client.userKey,
                    },
                    body: JSON.stringify({
                        communityName: this.newCommunity.name,
                        description: this.newCommunity.description,
                        tags: this.newCommunity.tags,
                        picture: this.newCommunity.picture,
                    })
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to create new community.')
                    }
                    else {
                        return res.json()
                    }
                }).then((jsn) => {
                    this.message = 'Community created. You can now close this popup.'
                    setTimeout(this.resetMessageAndStatus, 5000);
                    this.resetNewCommunity();
                }).catch((err) => {
                    console.log(err)
                    this.message = 'There was an error. Please check your entries.';
                    setTimeout(this.resetMessageAndStatus, 5000);
                })

            },
            resetMessageAndStatus: function() {
                this.message = ''
                this.success = false;
            },
            resetNewCommunity: function() {
                this.newCommunity = {
                    name: null,
                    description: null,
                    tags: null,
                    picture: null,
                }
            },
            saveUploadedPicture: function(event) {
                if (!event.target.files.length) return;
                const imgFile = event.target.files[0]

                // create a new file reader
                const reader = new FileReader();

                // onload set imgUpload to the relevant file
                reader.onload = (e) => {
                    this.newCommunity.picture = e.target.result;
                }

                // read the imgFile in as data URL
                reader.readAsDataURL(imgFile);
            }
        },
    })
}

const makeSidenavVue = function() {
    const sidenavVue = new Vue({
        el: "#sidenav",
        data: {
            // communities: [
            //     {name: 'Tennis', lastActive: new Date(2021, 1, 1), admin: 'test', id: '123'},
            //     {name: 'Gardening', lastActive: new Date(2020, 1, 1), admin: 'test', id: '436'},
            //     {name: 'Painting', lastActive: new Date(2019, 1, 1), admin: 'eliza', id: '343'},
            //     {name: 'Cooking', lastActive: new Date(2018, 1, 1), admin: 'maurice', id: '444'},
            //     {name: 'Dog breeding', lastActive: new Date(2017, 1, 1), admin: 'natalie', id: '555'},
            //     {name: 'Frogs', lastActive: new Date(2016, 1, 1), admin: 'oscar', id: '666'},
            //     {name: 'Haute horlogerie', lastActive: new Date(2015, 1, 1), admin: 'test', id: '777'},
            // ]
        },
        computed: {
            state() {
                return client.state;
            },
            communities(){
                return allCommunities.communities
            },
            getRecentCommunitiesToDisplay(){
                return mostRecentCommunities.recentCommunities
            }
        },
        methods: {
            goToProfile: function() {
                // go to own profile
                goToProfile(client.userData.id)
            },
            goToCommunity: function(communityId) {
                console.log(communityId,"community")
                goToCommunity(communityId)
            },
            goToCalendar: function() {
                setState('calendar');
            },
            goToDashboard: function() {
                setState('dashboard');
            },
            /**
             * Get all communities with only the relevant information (name, id)
             * */
            getAllCommunitiesToDisplay: function() {
                return this.communities.map(el => {
                    return {name: el.name, id: el.id}
                })
            },
            /**
             * Get owned communities with only the relevant information (name, id)
             * */
            getOwnedCommunitiesToDisplay: function() {
                return this.communities.filter(el => el.admin === client.username)
                    .map(el => {
                        return {name: el.name, id: el.id}
                    })
            },
        }
    })
}

const makeViewEventVue = function() {
    const viewEventVue = new Vue({
        el: "#view-event-modal",
        computed: {
            state() {
                return client.state
            },
            event() {
                return eventData.event;
            },
            isOrganiser() {
                return client.userData.id === this.event.organiser.id
            }
        },
        methods: {
            cancelEvent: function() {
                if (!this.isOrganiser) {
                    console.log('Only organiser can cancel an event.')
                    return;
                }

                fetch('/api/remove-event/', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Basic " + client.userKey,
                    },
                    body: JSON.stringify({
                        communityId: this.event.community.id,
                        eventId: this.event.id
                    })
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to remove event.')
                    }
                    else {
                        return res.json()
                    }
                }).then(() => {
                    getUpdateCalendar()
                    console.log('event removed')
                }).catch((err) => console.log(err))
            }
        }
    })
}

export const makePage = function() {
    makeHeaderVue();
    makeSidenavVue();
    makeNewCommunityModalVue();
    makeViewEventVue();
}
