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
                 return this.userData.userName === client.userData.userName
                 //return client.profileData.id === client.userData.id
            },
            profileData() {
                return client.profileData;
            },
            userData() {
                return client.userData;
            }
        },
        data: {    
            id: '',
            userName: '', 
            age: '',
            email: '',
            location: '',
            picture: '', 
            status: '', 
            interests: [],
            // id: client.userData.id,
            // name: client.userData.name, 
            // age: client.userData.age,
            // email: client.userData.email,
            // location: client.userData.location,
            // picture: client.userData.picture, 
            // tags: client.userData.tags,
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
        data: {
            commentBarChartData: {
                type: 'bar',
                data: {
                    labels: ['Gardening', 'Yoga', 'Cooking'],
                    datasets: [
                        {
                            label:' # Comments written',
                            data: [20, 5, 13],
                            backgroundColor:['#e74a3b',],
                        },
                        {
                            label:' # Threads opened',
                            data: [3, 4, 1],
                            backgroundColor:['#4e73df',],
                        }
                    ],
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Activities in your top 10 most popular communities',
                            fontSize: 20,
                            color: 'rgb(255, 255, 255)'
                        },
                        legend: {
                            display: true,
                            labels: {
                                color: 'rgb(255, 255, 255)',
                                borderColor: 'rgb(165,165,165)',
                            },   
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            ticks: {
                                color: 'rgb(255, 255, 255)',
                            },
                            grid: {
                                color: 'rgb(165,165,165)',
                            }
                        },
                        y: {
                            stacked: true,
                            ticks: {
                                color: 'rgb(255, 255, 255)',
                            },
                            grid: {
                                color: 'rgb(165,165,165)',
                            }
                        }
                    }
                }
            },
            activityLineChartData: {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets:[
                        {
                            label:' # Comments written',
                            data: [20, 9, 13, 6, 3],
                            backgroundColor:[
                                '#e74a3b',
                            ],
                            borderColor: 'rgb(165,165,165)',
                        }, 
                        {
                            label:' # Threads opened',
                            data: [3, 4, 1, 2, 1],
                            backgroundColor:[
                                '#4e73df',
                            ],
                            borderColor: 'rgb(165,165,165)',
                        }
                ],
                }, 
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total activities over time',
                            fontSize: 20,
                            color: 'rgb(255, 255, 255)'
                        },
                        legend: {
                            display: true,
                            labels: {
                                color: 'rgb(255, 255, 255)'
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            ticks: {
                                color: 'rgb(255, 255, 255)',
                            },
                            grid: {
                                color: 'rgb(165,165,165)',
                            }
                        },
                        y: {
                            stacked: true,
                            ticks: {
                                color: 'rgb(255, 255, 255)',
                            },
                            grid: {
                                color: 'rgb(165,165,165)',
                            }
                        }
                    }
                }
            }
        },
        computed: {
            state() {
                return client.state;
            },
        },
        // methods: {
        //     createChart: function(chartId, chartData) {
        //         createChart(chartId, chartData)
        //     },
        // },
        // mounted() {
        //     this.createChart('commentBarChart', this.commentBarChartData)
        //     this.createChart('activityLineChart', this.activityLineChartData)
        // }
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
            }
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
                // todo connect to db
                console.log("New picture uploaded")
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
            newStatus: '', 
       },
       computed: {
            state() {
                return client.state;
            },
            isOwnProfile() {
                return this.id === client.userData.id
            },
           userData() {
            return client.userData
            }
       },
       methods: {
            updateInfo: function() {

                // todo to check first that empty strings aren't sent!!!!

                console.log("about to fetch")
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
                        newStatus: this.newStatus
                    })
                }).then((res) => {
                    console.log("Should have sent updated info", this.newEmail,this.newAge, this.newLocation, this.newStatus)
                    if (!res.ok) {
                        throw new Error('Failed to add tag')
                    } else {
                        return res.json()
                    }
                }).then((jsn) => {
                    // trigger reload of the current user data
                    goToProfile(this.userData.id)
                    this.newEmail = '';
                    this.newAge = '';
                    this.newLocation = '';
                    this.newStatus = '';
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
