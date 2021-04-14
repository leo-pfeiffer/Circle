import {client, search, setState} from "./clientUtils.js";

/**
 * This file contains the vue components of the search results.
 * */

const makeSearchResultVue = function() {
    const searchResultVue = new Vue({
        el: "#search-results",
        data: {

        },
        computed: {
            state() {
                return client.state;
            },
            searchTerm() {
                return search.term;
            },
            searchType() {
                return search.type;
            }
        },
        methods: {
            setState: function(newState) {
                setState(newState)
            },
            goToProfile(username) {
                // todo
            },
            goToCommunity(communityId) {
                // todo
            }
        }
    })
}


export const makeSearch = function () {
    makeSearchResultVue();
}