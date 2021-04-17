// mapbox access token used to access mapbox map
const ACCESS_TOKEN = "pk.eyJ1Ijoic29sc3RpY2UyMDIxIiwiYSI6ImNrbmVkdWVhaDAxcXMycHA2eHpoeHlrMDgifQ.s7QI2PagRL2g0ovswyyqtQ";
// the URL accessing the map
let MAP_URL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`;
const WEATHER_ACCESS_TOKEN = "XJPAKEZMXS2RTGNE2HXA7BSKP";
// the URL to get the weather information
let WEATHER_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/$_coordinate?key=${WEATHER_ACCESS_TOKEN}`;
// console.log(r);
const map = L.map('map').setView([51.505,-0.09], 13);
L.tileLayer(MAP_URL, {
    maxZoom: 23,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: ACCESS_TOKEN
}).addTo(map);

/**
 * Calculate the wind direction according to
 * its degree value
 * @param {*} degree 
 */
const getWindDirection = (degree) => {
    if (0 === degree || 360 === degree) {
        return "North";
    } else if (degree < 90) {
        return "Northeast";
    } else if (90 === degree) {
        return "East";
    } else if (degree < 180) {
        return "Southeast";
    } else if (180 === degree) {
        return "South";
    } else if (degree < 270) {
        return "Southwest";
    } else if (270 === degree) {
        return "West";
    } else if (degree < 360) {
        return "Northwest";
    }

    return "";
}

map.on('click', async function (e) {
    const coordinates = e.latlng;
    const coord = `${coordinates.lat},${coordinates.lng}`;
    const weatherRequestUrl = WEATHER_URL.replace("$_coordinate", coord);
    // console.log(weatherRequestUrl);
    const res = await fetch(weatherRequestUrl);
    const data = await res.json();
    const weatherInfo = data.currentConditions;
    // console.log(data);
    const popup = L.popup();
    let _html = "";
    const windDirection = getWindDirection(weatherInfo.winddir)
    _html += `<p class='info'>${weatherInfo.conditions}</p>`;
    _html += `<p class='info'>${data.description}</p>`;
    _html += `<div><img src="img/temp.png" width="15" height="15" /> <span class='info'>${weatherInfo.temp}°C</span></div>`;
    _html += `<div><img src="img/humidity.png" width="15" height="15" /> <span class='info'>${weatherInfo.humidity}%</span></div>`;
    _html += `<div><img src="img/precip.png" width="15" height="15" /> <span class='info'>${weatherInfo.precip}%</span></div>`;
    _html += `<div><img src="img/winddir.png" width="15" height="15" /> <span class='info'>${windDirection} wind</span></div>`;
    _html += `<div><img src="img/windspeed.png" width="15" height="15" /> <span class='info'>${weatherInfo.windspeed}m/s</span></div>`;
    _html += `<div><img src="img/visibility.png" width="15" height="15" /> <span class='info'>${weatherInfo.visibility}m</span></div>`;
    popup
        .setLatLng(e.latlng)
        .setContent(_html)
        .openOn(map);
});