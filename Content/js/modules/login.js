/**
 * This file contains the vue components of the login.
 * */

import {client, setState} from './clientUtils.js'

const toggleEntryType = function() {

}

const makeLoginVue = function() {
    const loginVue = new Vue({
        el: '#login',
        data: {
            entryType: 'login',
            username: "",
            password: "",
            passwordConfirm: "",
            email: "",
            gender: "",
            age: "",
            location: "",
            message: "",
        },
        computed: {
            state() {
                return client.state;
            },
            confirmPasswordMessage() {
                if ((this.entryType === 'register') &&
                    (this.password !== this.passwordConfirm) &&
                    (this.passwordConfirm !== "")) {
                    return "Passwords don't match"
                } else {
                    return ""
                }
            }
        },
        methods: {
            login: function() {

                this.message = "";

                // set the user key
                client.userKey = btoa(this.username + ':' + this.password)

                // todo get login response from API
                let status = this.username === 'fail' ? 'fail' : 'success';
                let loginResponse = {status: status, username: this.username}

                if (loginResponse.status === 'success') {
                    console.log('Login successful')

                    // direct user to dashboard
                    setState('dashboard');
                    client.username = loginResponse.username
                    // todo process other elements in loginResponse
                } else {
                    console.log('Login failed.')
                    this.message = "Wrong username or password."
                }
            },
            register: function() {
                // todo send user information to API and register the user

                this.message = ""

                // todo API call to register a new user
                let status = this.username === 'fail' ? 'fail' : 'success';
                let registerResponse = {status: status, username: this.username}

                if (registerResponse.status === 'success') {
                    console.log('Registration successful.')
                    this.message = "Registration successful. Please login.";
                    this.toggleEntryType();
                } else {
                    console.log('Registration failed.')
                    this.message = "Registration failed. Please try again.";
                }
            },
            toggleEntryType: function() {
                // reset data
                this.username = "";
                this.password = "",
                this.passwordConfirm = "";
                this.email = "";
                this.gender = "";
                this.age = "";
                this.location = "";

                this.entryType = this.entryType === 'login' ? 'register': 'login';
            }
        }
    })
}

export const makeLogin = function () {
    makeLoginVue();
}