/**
 * This file contains vue components that are present in multiple state such as the sidebar or the header.
 * */

import {
    client,
    destroySocket,
    goToCommunity, goToProfile,
    joinRoom,
    search,
    setState
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
            }
        },
        methods: {
            goToProfile: function() {
                goToProfile(client.userData.userId)
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
                // todo call to api -> save response in observable -> access it from search vue
                this.goToSearch();
            },
            getRecommendations: function () {
                search.type = 'recommendation'
                // todo call to api -> get recommendations for current user
                this.goToSearch();
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

                // todo send this.newCommunity data to API
                let apiResponse = {status: 'success'}
                if (apiResponse.status === 'success') {
                    this.message = 'Community created. You can now close this popup.'
                    this.success = true;

                    // reset this message and status after 5 seconds
                    setTimeout(this.resetMessageAndStatus, 5000);

                    this.resetNewCommunity();
                } else {
                    this.message = 'There was an error. Please check your entries.'
                    this.success = false;

                    // reset this message and status after 5 seconds
                    setTimeout(this.resetMessageAndStatus, 5000);
                }
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
            communities: [
                {name: 'Tennis', lastActive: new Date(2021, 1, 1), admin: 'test', id: '123'},
                {name: 'Gardening', lastActive: new Date(2020, 1, 1), admin: 'test', id: '436'},
                {name: 'Painting', lastActive: new Date(2019, 1, 1), admin: 'eliza', id: '343'},
                {name: 'Cooking', lastActive: new Date(2018, 1, 1), admin: 'maurice', id: '444'},
                {name: 'Dog breeding', lastActive: new Date(2017, 1, 1), admin: 'natalie', id: '555'},
                {name: 'Frogs', lastActive: new Date(2016, 1, 1), admin: 'oscar', id: '666'},
                {name: 'Haute horlogerie', lastActive: new Date(2015, 1, 1), admin: 'test', id: '777'},
            ]
        },
        computed: {
            state() {
                return client.state;
            }
        },
        methods: {
            goToProfile: function() {
                // go to own profile
                goToProfile(client.userData.userId)
            },
            goToCommunity: function(communityId) {
                goToCommunity(communityId)
            },
            goToCalendar: function() {
                setState('calendar');
            },
            goToDashboard: function() {
                setState('dashboard');
            },
            /**
             * Get n most recently active communities.
             * @param {Number} n
             * */
            getRecentCommunities: function(n) {
                return [...this.communities].sort((a, b) => b.lastActive - a.lastActive).slice(0, n)
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
            /**
             * Get 5 most recently active communities with only the relevant information (name, id)
             * */
            getRecentCommunitiesToDisplay: function() {
                let communities = this.getRecentCommunities(4);
                return communities.map(el => {
                    return {name: el.name, id: el.id}
                })
            },
        }
    })
}

export const makePage = function() {
    makeHeaderVue();
    makeSidenavVue();
    makeNewCommunityModalVue();
}
