/**
 * Import all required files for Vue components and other behaviour.
 * */

import {makeLogin} from "./modules/login.js";
import {makePage} from "./modules/page.js";
import {makeDashboard} from "./modules/dashboard.js";
import {makeCommunity} from "./modules/community.js";
import {makeProfile} from "./modules/profile.js";
import {makeLogout} from "./modules/logout.js";
import {makeSearch} from "./modules/search.js";
import {makeCalendar} from "./modules/calendar.js";
import {resetMap} from "./modules/weather-map.js";

window.onload = () => {
    makeLogin();
    makePage();
    makeDashboard();
    makeCommunity();
    makeProfile();
    makeLogout();
    makeSearch();
    makeCalendar();

    $('#view-event-modal').on('hide.bs.modal', function(){
        setTimeout(function() {
            resetMap();
        }, 300);
    });

}