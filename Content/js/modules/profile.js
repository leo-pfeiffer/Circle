/**
 * This file contains the vue components of the user profile.
 * */

 import {client, setState, createChart} from './clientUtils.js'
//  import {client, createChart} from './clientUtils.js'

 const makeProfileInfoVue = function() {
     const profileInfoVue = new Vue({
        el: '#profileInfo',
        computed: {
             state() {
                 return client.state;
             },
            isOwnProfile() {
                 // todo proabbly change this to ID instead of username but for that we need to add API connection first
                 return this.name === client.userData.username
            }
        },
        data: {    
            id: "123456789",
            name: "Lena123", 
            age: "25",
            email: "lena1@23.com",
            location: "London",
            picture: 'https://randomuser.me/api/portraits/women/8.jpg', 
            status: "To plant a garden is to believe in tomorrow", 
            tags: ["swimming", "plants", "gardening", "veggie"],
            newTag: ''
        },
        methods: {
            addTag: function() {
                // todo connect to API
                if (this.tags.includes(this.newTag)) {
                    console.log("new tag already in tags.")
                    return;
                }
                if ((this.newTag.length <= 20) && (this.newTag.length > 0)) {
                    this.tags.push(this.newTag)
                    this.newTag = '';
                }
                else {
                    console.log("tag requires length 1 <= x <= 20.")
               }
            },
            removeTag: function(tag) {
            // todo connect to API
            this.tags.splice(this.tags.indexOf(tag), 1)
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
                    datasets:[
                    {
                        label:' # Comments written',
                        data: [20, 5, 13],
                        backgroundColor:[
                            '#1cc88a',
                          ],
                    }, 
                    {
                        label:' # Threads opened',
                        data: [3, 4, 1],
                        backgroundColor:[
                            '#4e73df',
                          ],
                    }
                ],
                }, 
                options: {
                    scales: {
                        yAxes: [{ stacked: true}],
                    },
                    title: {
                      display:true,
                      text:'Top active communities by number of comments written',
                      fontSize:20
                    },
                    legend: {
                      display:true,
                      position:'right',
                      labels:{
                        fontColor:'#white'
                      }
                    }
                },
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
                            '#1cc88a',
                          ],
                    }, 
                    {
                        label:' # Threads opened',
                        data: [3, 4, 1, 2, 1],
                        backgroundColor:[
                            '#4e73df',
                          ],
                    }
                ],
                }, 
                options: {
                    title: {
                      display:true,
                      text:'Top active communities by number of comments written',
                      fontSize:20
                    },
                    legend: {
                      display:true,
                      position:'right',
                      labels:{
                        fontColor:'#white'
                      }
                    }
                },

            }
        },
        computed: {
            state() {
                return client.state;
            },
        },
        methods: {
            createChart: function(chartId, chartData) {
                createChart(chartId, chartData)
            },
        },
        mounted() {
            this.createChart('commentBarChart', this.commentBarChartData)
            this.createChart('activityLineChart', this.activityLineChartData)
        }
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
            // newEmail: email,
            // newAge: age,
            // newLocation: location,
            // newStatus: status, 
       },
       computed: {
            state() {
                return client.state;
            },
            isOwnProfile() {
                // todo probably change this to ID instead of username but for that we need to add API connection first
                return this.name === client.userData.username
           }
       },
       methods: {
            updateInfo: function(event) {
                // Todo post to DB; fetch and display updated info
                console.log("Info updated")
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
