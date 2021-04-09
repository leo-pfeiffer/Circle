/**
 * Import all required files for Vue components and other behaviour.
 * */

import {makeLogin} from "./modules/login.js";
import {makePage} from "./modules/page.js";
import {makeDashboard} from "./modules/dashboard.js";
import {makeCommunity} from "./modules/community.js";
import {makeProfile} from "./modules/profile.js";
import {makeLogout} from "./modules/logout.js";

window.onload = () => {
    makeLogin();
    makePage();
    makeDashboard();
    makeCommunity();
    makeProfile();
    makeLogout();
}