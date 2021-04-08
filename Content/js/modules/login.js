import { client } from './clientUtils.js'

const makeLoginVue = function() {
    const loginVue = new Vue({
        el: '#login',
        computed: {
            state() {
                return client.state;
            },
        }
    })
}

export const makeLogin = function () {
    makeLoginVue();
    console.log('hello')
}