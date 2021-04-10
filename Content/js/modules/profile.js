/**
 * This file contains the vue components of the user profile.
 * */

 import {client, setState} from './clientUtils.js'

 const makeProfileInfoVue = function() {
     const profileInfoVue = new Vue({
         el: '#profileInfo',
         computed: {
             state() {
                 return client.state;
             },
         },
             data() {
                 return {
                    picture: 'https://randomuser.me/api/portraits/women/8.jpg' 
         }
        },
     })
 }
 
 const makeUserStatsVue = function() {
    const userStatsVue = new Vue({
        el: '#userStats',
        computed: {
            state() {
                return client.state;
            },
        },
    })
}

 export const makeProfile = function () {
     makeProfileInfoVue();
     makeUserStatsVue();
 }
