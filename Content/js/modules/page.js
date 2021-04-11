/**
 * This file contains vue components that are present in multiple state such as the sidebar or the header.
 * */

import {client, goToCommunity, resetClient, setState} from "./clientUtils.js";

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
}
