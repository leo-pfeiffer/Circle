import {client, joinRoom, search, setState} from "./clientUtils.js";

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
            goToProfile(username) {
                setState('profile')
            },
            goToCommunity(communityId) {
                setState('community')
                joinRoom(communityId)
            }
        }
    })
}


export const makeSearch = function () {
    makeSearchResultVue();
}