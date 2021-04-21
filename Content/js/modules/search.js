import {client, goToCommunity, goToProfile, joinRoom, search, setState} from "./clientUtils.js";

/**
 * This file contains the vue components of the search results.
 * */
const makeSearchResultVue = function() {
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