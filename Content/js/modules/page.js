/**
 * This file contains vue components that are present in multiple state such as the sidebar or the header.
 * */

import {client, getAvailableIcons, goToCommunity, resetClient, setState} from "./clientUtils.js";

const makeHeaderVue = function() {
    const headerVue = new Vue({
        el: "#header",
        computed: {
            state() {
                return client.state;
            }
        },
        methods: {
            setState: function(newState) {
                setState(newState)
            },
            logout: function() {
                resetClient();
                setState('logout')
            },
        }
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
                symbol: null,
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

                // set default value for symbol if none is entered
                this.newCommunity.symbol = this.newCommunity.symbol === null ? 'fas fa-users' : this.newCommunity.symbol

                // split tags into list
                this.newCommunity.tags = this.newCommunity.tags.split(' ').filter(el => el !== "")

                // todo send this.newCommunity data to API
                let apiResponse = {status: 'success'}
                if (apiResponse.status === 'success') {
                    this.message = 'Community created. You can now close this popup.'
                    this.success = true;

                    // reset this message and status after 5 seconds
                    setTimeout(this.resetMessageAndStatus, 5000);
                } else {
                    this.message = 'There was an error. Please check your entries.'
                    this.success = false;

                    // reset this message and status after 5 seconds
                    setTimeout(this.resetMessageAndStatus, 5000);
                }
            },
            resetMessageAndStatus: function() {
                console.log('hello!')
                this.message = ''
                this.success = false;
            },
        },
        created: async function() {
            let availableIcons = await getAvailableIcons();
            this.availableIcons = availableIcons.slice(0, 10);
            console.log(this.availableIcons)
        }
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
            setState: function(newState) {
                setState(newState)
                console.log(`transitioned to ${newState}`)
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
            goToCommunity: function(communityId) {
                goToCommunity(communityId)
            },
        }
    })
}

export const makePage = function() {
    makeHeaderVue();
    makeSidenavVue();
    makeNewCommunityModalVue();
}
