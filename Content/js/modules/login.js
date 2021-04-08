import {client, setState} from './clientUtils.js'

const makeLoginVue = function() {
    const loginVue = new Vue({
        el: '#login',
        computed: {
            state() {
                return client.state;
            },
        },
        methods: {
            login: function() {
                setState('dashboard');
                console.log('should transition to dashboard')
            }
        }
    })
}

export const makeLogin = function () {
    makeLoginVue();
}