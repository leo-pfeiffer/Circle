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
        computed: {
            state() {
                return client.state;
            },
        },
    })
}

const makeCommentsChartVue = function() {
    const commentsStatsVude = new Vue({
        el: '#commentBarChart',
        data: {
            labels: ['Gardening', 'Yoga', 'Cooking'],
            datasets:[{
                    label:'Number of comments',
                    data: [
                            20,
                            5,
                            13
                    ],
            }]

        },
        computed: {
            state() {
                return client.state;
            },
        }, 
        methods: {
            createChart(el, data) {
              const ctx = document.getElementById('commentBarChart');
              const myChart = new Chart(ctx, {
                type: 'bar',
                data: data,
              });
            }
          },
        mounted: function() { this.createChart('commentBarChart', data); }
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




 export const makeProfile = function () {
     makeProfileInfoVue();
     makeUserStatsVue();
     makeProfilePictureUploadVue();
     makeCommentsChartVue();
 }
