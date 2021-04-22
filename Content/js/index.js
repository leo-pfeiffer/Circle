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
import {makeMap, destroyMap} from "./modules/weather-map.js";

window.onload = () => {
    makeLogin();
    makePage();
    makeDashboard();
    makeCommunity();
    makeProfile();
    makeLogout();
    makeSearch();
    makeCalendar();


    // ===== Set up the weather map on the View Event / New Event modals using jQuery ====

    // Make the weather map when the modal opens
    $('#new-event-modal').on('show.bs.modal', function(){
        setTimeout(function() {
            makeMap('weather-map-new-event');
        }, 300);
    });

    $('#view-event-modal').on('show.bs.modal', function(){
        setTimeout(function() {
            makeMap('weather-map-view-event');
        }, 300);
    });

    // ... and destroy it when the modal closes
    $('#new-event-modal').on('hide.bs.modal', function(){
        setTimeout(function() {
            destroyMap();
        }, 300);
    });

    $('#view-event-modal').on('hide.bs.modal', function(){
        setTimeout(function() {
            destroyMap();
        }, 300);
    });



}