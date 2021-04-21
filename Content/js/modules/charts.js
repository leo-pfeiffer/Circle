/**
 * This file contains all functions related to fetching the data  which creates the charts and creating the charts in the profile view and the community view. 
 * */

import {
    client
} from "./clientUtils.js";

/**
* Create a chart 
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
 * Get the stats for a specific community
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
        communityStats.Comments = jsn.numComments ? jsn.numComments.commentCount : 0;
        communityStats.Events = jsn.numEvents ? jsn.numEvents.eventCount : 0;
        communityStats.Threads = jsn.numThreads ? jsn.numThreads.threadCount : 0;
        return communityStats
    }).then(() => {
        communityChart = makeCommunityChart();
    }).catch(err => console.log(err))
}

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
 * Get the comments a user has made
 * */
export const getUserComments = function () {

    fetch('/api/get-user-comments/', {
        method: "GET",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        }
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get number of comments')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        console.log(jsn)
        userStats.Comments = jsn.commentCount;
        console.log(userStats)
        return userStats
    }).catch(err => console.log(err))

    fetch('/api/get-user-threads/', {
        method: "GET",
        headers: {
            "Authorization": "Basic " + client.userKey,
            "Content-Type": "application/json"
        }
    }).then((res) => {
        if (!res.ok) {
            throw new Error('Failed to get number of threads')
        } else {
            return res.json();
        }
    }).then((jsn) => {
        console.log(jsn)
        userStats.Threads = jsn.threadCount;
        console.log(userStats)
        return userStats
    }).then(() => {
        profileBarChart = makeProfileBarChart();
    }).catch(err => console.log(err))
}

export const makeProfileBarChart = function () {
  let data = {
      type: 'bar',
      data: {
          labels: Object.keys(userStats),
          datasets: [
            {
                data: Object.values(userStats),
                backgroundColor: [
                    '#e74a3b',
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
                  text: 'Your activities',
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

  if (profileBarChart) {
      profileBarChart.destroy()
  }

  return createChart('commentBarChart', data)
}

export const makeProfileLineChart = function () {
  let data = {
      type: 'line',
      data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], // todo
          datasets: [
              {
                  label: ' # Comments written',
                  data: [20, 9, 13, 6, 3],  // todo
                  backgroundColor: [
                      '#e74a3b',
                  ],
                  borderColor: 'rgb(165,165,165)',
              },
              {
                  label: ' # Threads opened',
                  data: [3, 4, 1, 2, 1],  // todo
                  backgroundColor: [
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

  if (profileLineChart) {
      profileLineChart.destroy()
  }

  return createChart('activityLineChart', data)
}

// initialise the community chart
let communityChart;
let profileBarChart;
let profileLineChart;


