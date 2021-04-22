/**
 * This file contains the vue components of the search results.
 * */

import { client, goToCommunity, goToProfile, search, setState } from "./clientUtils.js";

/**
 * This function contains functionality to handle the search componenet.  
 * */
const makeSearchResultVue = function () {
    const searchResultVue = new Vue({
        el: "#search-results",
        computed: {
            state() {
                return client.state;
            },
            searchTerm() {
                return search.term;
            },
            searchType() {
                return search.type;
            },
            communityResults() {
                return search.communityResults;
            },
            userResults() {
                return search.userResults;
            }
        },
        methods: {
            goToProfile(userId) {
                goToProfile(userId)
                setState('profile')
            },
            goToCommunity(communityId) {
                goToCommunity(communityId)
            }
        }
    })
}


export const makeSearch = function () {
    makeSearchResultVue();
}