/**
 * This file contains all functions related to fetching the data  which creates the charts and creating the charts in the profile view and the community view. 
 * */

import {
    client
} from "./clientUtils.js";

/**
* Create a chart.js chart.
 * @param {string} chartId
 * @param{Object} chartData
* */
const createChart = function (chartId, chartData) {
  const ctx = document.getElementById(chartId);
  return new Chart(ctx, {
      type: chartData.type,
      data: chartData.data,
      options: chartData.options,
  });
}

/**
 * Community Stats for graph
 * @type{Object}
 * */
 let communityStats = {
    Comments: 0,
    Threads: 0,
    Events: 0,
  };

/**
 * Get the stats for a specific community.
 * @param {string} communityId
 * */
export const getCommunityStats = function (communityId) {

    fetch('/api/get-community-stats/', {
        method: "POST",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            communityId: communityId
        })
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get most recent activities')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        // parse the data
        communityStats.Comments = jsn.numComments ? jsn.numComments.commentCount : 0;
        communityStats.Events = jsn.numEvents ? jsn.numEvents.eventCount : 0;
        communityStats.Threads = jsn.numThreads ? jsn.numThreads.threadCount : 0;
        return communityStats
    }).then(() => {
        // create the chart
        communityChart = makeCommunityChart();
    }).catch(err => console.log(err))
}

/**
 * Wrapper method around createChart to create the community chart.
 * */
export const makeCommunityChart = function () {
  let data = {
      type: 'doughnut',
      data: {
          labels: Object.keys(communityStats),
          datasets: [
              {
                  data: Object.values(communityStats),
                  backgroundColor: [
                      '#e74a3b',
                      '#4e73df',
                      '#1cc88a'
                  ],
                  borderColor: 'rgb(165,165,165)',
              }
          ],
      },
      options: {
          plugins: {
              title: {
                  display: true,
                  text: 'Total community activity',
                  fontSize: 20,
                  color: 'rgb(255, 255, 255)'
              },
              legend: {
                  display: true,
                  labels: {
                      color: 'rgb(255, 255, 255)'
                  }
              }
          }
      }
  }

  // make sure the old chart is destroyed first
  if (communityChart) {
      communityChart.destroy()
  }

  return createChart('activityDoughnutChart', data)
}


/**
 * User Stats for graph
 * @type{Object}
 * */
 let userStats = {
    Comments: 0,
    Threads: 0,
  };

/**
 * Get the comments a user has made.
 * */
export const getUserComments = function () {

    // Collect the number of comments per community initiated by the current profile user
    fetch('/api/get-user-comments/', {
        method: "POST",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: client.profileData.id,
        })
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get number of comments')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        userStats.Comments = jsn;
        return userStats
    }).then(() => {
        // create the chart
        profileCommentBarChart = makeProfileCommentBarChart();
    }).catch(err => console.log(err))


    // Collect the number of threads per community initiated by the current profile user
    fetch('/api/get-user-threads/', {
        method: "POST",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: client.profileData.id,
        })
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get number of threads')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        userStats.Threads = jsn;
        return userStats
    }).then(() => {
        // create the chart
        profileThreadBarChart = makeProfileThreadBarChart();
    }).catch(err => console.log(err))
}

/**
 * Wrapper method around createChart to create the comment bar chart on the profile.
 * */
export const makeProfileCommentBarChart = function () {
  let data = {
      type: 'bar',
      data: {
          labels: userStats.Comments.map(el => el.communityName),
          datasets: [
            {
                data: userStats.Comments.map(el => el.commentCount),
                backgroundColor: ['#17a2b8'],
                borderColor: 'rgb(165,165,165)',
            }
        ],
      },
      options: {
          plugins: {
              title: {
                  display: true,
                  text: 'Comments written by you',
                  fontSize: 20,
                  color: 'rgb(255, 255, 255)'
              },
              legend: {
                  display: false,
                  labels: {
                      color: 'rgb(255, 255, 255)',
                      borderColor: 'rgb(165,165,165)',
                  },
              }
          },
          scales: {
              x: {
                  //stacked: true,
                  ticks: {
                      color: 'rgb(255, 255, 255)',
                  },
                  grid: {
                      color: 'rgb(165,165,165)',
                  }
              },
              y: {
                 // stacked: true,
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

  if (profileCommentBarChart) {
      profileCommentBarChart.destroy()
  }

  return createChart('commentBarChart', data)
}

/**
 * Wrapper method around createChart to create the thread bar chart on the profile.
 * */
export const makeProfileThreadBarChart = function () {
    let data = {
        type: 'bar',
        data: {
            labels: userStats.Threads.map(el => el.communityName),
            datasets: [
                {
                    data: userStats.Threads.map(el => el.threadCount),
                    backgroundColor: ['#17a2b8'],
                    borderColor: 'rgb(165,165,165)',
                }
            ],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Threads started by you',
                    fontSize: 20,
                    color: 'rgb(255, 255, 255)'
                },
                legend: {
                    display: false,
                    labels: {
                        color: 'rgb(255, 255, 255)',
                        borderColor: 'rgb(165,165,165)',
                    },
                }
            },
            scales: {
                x: {
                    //stacked: true,
                    ticks: {
                        color: 'rgb(255, 255, 255)',
                    },
                    grid: {
                        color: 'rgb(165,165,165)',
                    }
                },
                y: {
                    // stacked: true,
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

    // destroy the previous chart
    if (profileThreadBarChart) {
        profileThreadBarChart.destroy()
    }

    return createChart('threadBarChart', data)
}


// initialise the charts
let communityChart;
let profileCommentBarChart;
let profileThreadBarChart;


