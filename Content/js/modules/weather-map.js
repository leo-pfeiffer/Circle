/**
 * Create the weather map for the event detail view.
 * */

// mapbox access token used to access mapbox map
const ACCESS_TOKEN = "pk.eyJ1Ijoic29sc3RpY2UyMDIxIiwiYSI6ImNrbmVkdWVhaDAxcXMycHA2eHpoeHlrMDgifQ.s7QI2PagRL2g0ovswyyqtQ";

// the URL accessing the map
let MAP_URL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${ACCESS_TOKEN}`;
const WEATHER_ACCESS_TOKEN = "XJPAKEZMXS2RTGNE2HXA7BSKP";

// the URL to get the weather information
let WEATHER_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/$_coordinate?key=${WEATHER_ACCESS_TOKEN}`;
let WEATHER_URL_DATE = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/$_coordinate/$_startdate/$_enddate?key=${WEATHER_ACCESS_TOKEN}`;

let map;

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

const info = (weatherInfo) => {
    let _html = "";
    const windDirection = getWindDirection(weatherInfo.winddir)
    _html += `<div><img src="../../img/temp.png" width="15" height="15" /> <span class='weather-info'>${weatherInfo.temp}°F</span></div>`;
    _html += `<div><img src="../../img/humidity.png" width="15" height="15" /> <span class='weather-info'>${weatherInfo.humidity}%</span></div>`;
    _html += `<div><img src="../../img/precip.png" width="15" height="15" /> <span class='weather-info'>${weatherInfo.precip}%</span></div>`;
    _html += `<div><img src="../../img/winddir.png" width="15" height="15" /> <span class='weather-info'>${windDirection} wind</span></div>`;
    _html += `<div><img src="../../img/windspeed.png" width="15" height="15" /> <span class='weather-info'>${weatherInfo.windspeed}m/s</span></div>`;
    _html += `<div><img src="../../img/visibility.png" width="15" height="15" /> <span class='weather-info'>${weatherInfo.visibility}m</span></div>`;
    return _html;
}

export const makeMap = function(mapId) {

    map = L.map(mapId).setView([51.505, -0.09], 6);

    L.tileLayer(MAP_URL, {
        maxZoom: 23,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: ACCESS_TOKEN
    }).addTo(map);

    map.on('click', async function (e) {
        const coordinates = e.latlng;
        const coord = `${coordinates.lat},${coordinates.lng}`;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        console.log(startDate, endDate);
        if (startDate && endDate) {
            const weatherRequestUrl = WEATHER_URL_DATE.replace("$_coordinate", coord)
                .replace("$_startdate", startDate)
                .replace("$_enddate", endDate);
            const res = await fetch(weatherRequestUrl);
            const data = await res.json();
            if (data.days && data.days.length > 0) {
                const popup = L.popup();
                let _html = '';
                _html += `<div class='weather-container'>`;
                _html += '<p class="weather-info">Future weather forecast</p>';
                for (const day of data.days) {
                    _html += '<div>';
                    _html += `<div><span class='info'>Date</span>&nbsp;&nbsp;<span class='weather-info'>${day.datetime}</span></div>`;
                    _html += info(day);
                    _html += '</div>';
                    _html += '<hr/>';
                }
                _html += '</div>';
                popup.setLatLng(e.latlng)
                    .setContent(_html)
                    .openOn(map);
            }
        } else {
            const weatherRequestUrl = WEATHER_URL.replace("$_coordinate", coord);
            const res = await fetch(weatherRequestUrl);
            const data = await res.json();
            const weatherInfo = data.currentConditions;
            const popup = L.popup();
            let _html = "";
            _html += `<p class='weather-info'>${weatherInfo.conditions}</p>`;
            _html += `<p class='weather-info'>${data.description}</p>`;
            _html += info(weatherInfo);
            popup.setLatLng(e.latlng)
                .setContent(_html)
                .openOn(map);
        }
    });
}

export const destroyMap = function() {
    if (map && map.remove) {
        map.off();
        map.remove();
    }
}