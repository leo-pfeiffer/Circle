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
            picture: null,
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

                fetch('/api/login',{
                    headers: {
                        "Authorization": "Basic " + client.userKey,
                        "Content-Type": "application/json"
                    },
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Login failed.')
                    } else {
                        return res.json()
                    }
                }).then((jsn) => {

                    // todo save entire User object to client.userData for convenience
                    client.userData.name = jsn.user.userName;
                    client.userData.id = jsn.user.id

                    // direct user to dashboard
                    setState('dashboard');
                }).catch(err => {
                    console.log('Login failed.', err)
                    this.message = "Wrong username or password."
                })
            },
            register: function() {

                this.message = ''

                if (this.confirmPasswordMessage === "") {
                    fetch('/api/register', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            username: this.username,
                            password: this.password,
                            email: this.email,
                            gender: this.gender,
                            age: this.age,
                            location: this.location,
                            picture: this.picture,
                        })
                    }).then((res) => {
                        if (res.status === 409) {
                            this.message = "Registration failed. Username taken. Try again.";
                            throw new Error('Registration failed.')
                        } else if (!res.ok) {
                            this.message = "Registration failed. Try again.";
                            throw new Error('Registration failed.')
                        }
                        else {
                            return res.json()
                        }
                    }).then((jsn) => {
                        console.log('Registration successful.')
                        this.message = "Registration successful. Please login.";
                        this.toggleEntryType();
                    }).catch((err) => console.log(err))
                }
            },
            saveUploadedPicture: function(event) {
                if (!event.target.files.length) return;
                const imgFile = event.target.files[0]

                // create a new file reader
                const reader = new FileReader();

                // onload set imgUpload to the relevant file
                reader.onload = (e) => {
                    this.picture = e.target.result;
                }

                // read the imgFile in as data URL
                reader.readAsDataURL(imgFile);
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
                this.picture = null;

                this.entryType = this.entryType === 'login' ? 'register': 'login';
            }
        }
    })
}

export const makeLogin = function () {
    makeLoginVue();
}