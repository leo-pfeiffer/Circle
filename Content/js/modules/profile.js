/**
 * This file contains the vue components of the user profile.
 * */

 import {
    client, 
    setState,
    goToProfile
} from './clientUtils.js'


 const makeProfileInfoVue = function() {
     const profileInfoVue = new Vue({
        el: '#profileInfo',
        computed: {
            state() {
                 return client.state;
            },
            isOwnProfile() {
                return client.profileData.id === client.userData.id
            },
            profileData() {
                return client.profileData;
            },
            userData() {
                return client.userData;
            }
        },
        data: {    
            id: client.userData.id,
            name: client.userData.userName,
            age: client.userData.age,
            email: client.userData.userEmail,
            location: client.userData.location,
            picture: client.userData.picture,
            tags: client.userData.interests,
            newTag: ''
        },
        methods: {
            addTag: function() {
                if (this.userData.interests.includes(this.newTag)) {
                    console.log("new tag already in tags.")
                    return;
                }
                if ((this.newTag.length <= 20) && (this.newTag.length > 0)) {
                    fetch('/api/add-tag-user/', {
                        method: "POST",
                        headers: {
                            "Authorization": "Basic " + client.userKey,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userId: this.userData.id,
                            tag: this.newTag
                        })
                    }).then((res) => {
                        if (!res.ok) {
                            throw new Error('Failed to add tag')
                        } else {
                            return res.json()
                        }
                    }).then((jsn) => {
                        // trigger reload of the current user data
                        goToProfile(this.userData.id)
                        this.newTag = '';
                    }).catch(err => console.log(err))
                }
                else {
                    console.log("tag requires length 1 <= x <= 20.")
               }
            },
            removeTag: function(tag) {
                fetch('/api/remove-tag-user/', {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + client.userKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: this.userData.id,
                        tag: tag
                    })
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to remove tag')
                    } else {
                        return res.json()
                    }
                }).then((jsn) => {
                    // trigger reload of the current community data
                    goToProfile(this.userData.id)
                    this.newTag = '';
                }).catch(err => console.log(err))
            }
        }
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

const makeProfilePictureUploadVue = function() {
    const profileInfoVue = new Vue({
       el: '#profile-picture-upload-modal',
       data: {
            newPicture: null, 
       },
       computed: {
            state() {
                return client.state;
            },
            userData() {
                return client.userData
            },
            isOwnProfile() {
                return client.profileData.id === client.userData.id
            },
       },
       methods: {
            saveUploadedPicture: function(event) {
                if (!event.target.files.length) return;
                const imgFile = event.target.files[0]
            
                // create a new file reader
                const reader = new FileReader();
            
                // onload set imgUpload to the relevant file
                reader.onload = (e) => {
                    this.newPicture = e.target.result;
                }
            
                // read the imgFile in as data URL
                reader.readAsDataURL(imgFile);
            }, 
            uploadPicture: function() {
                fetch('/api/update-user-profile-picture/', {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + client.userKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: this.userData.id,
                        newPicture: this.newPicture, 
                    })
                }).then((res) => {
                    console.log("Should have sent picture", this.newPicture)
                    if (!res.ok) {
                        throw new Error('Failed to send picture')
                    } else {
                        return res.json()
                    }
                }).then((jsn) => {
                    // trigger reload of the current user data
                    goToProfile(this.userData.id)
                    this.newPicture = '';
                }).catch(err => console.log(err))
            }
       },
    })
}

const makeUpdateProfileInfoVue = function() {
    const profileInfoVue = new Vue({
       el: '#profile-info-modal',
       data: {
            newEmail: '',
            newAge: '',
            newLocation: '',
       },
       computed: {
            state() {
                return client.state;
            },
            isOwnProfile() {
                return client.profileData.id === client.userData.id
            },
           userData() {
            return client.userData
            }
       },
       methods: {
            updateInfo: function() {
                //checking if strings are empty and assigning previous values if empty
                if(this.newEmail === ''){
                    this.newEmail = client.profileData.userEmail
                }
                if (this.newAge === ''){
                    this.newAge = client.profileData.age
                }
                if (this.newLocation === ''){
                    this.newLocation = client.profileData.location
                }
                fetch('/api/update-user-info/', {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + client.userKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: this.userData.id,
                        newEmail: this.newEmail,
                        newAge: this.newAge,
                        newLocation: this.newLocation, 
                    })
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Failed to add updated info')
                    } else {
                        return res.json()
                    }
                }).then((jsn) => {
                    // trigger reload of the current user data
                    goToProfile(this.userData.id)
                    this.newEmail = '';
                    this.newAge = '';
                    this.newLocation = '';
                }).catch(err => console.log(err))
            }
       },
    })
}


 export const makeProfile = function () {
     makeProfileInfoVue();
     makeUserStatsVue();
     makeProfilePictureUploadVue();
     makeUpdateProfileInfoVue();
 }
