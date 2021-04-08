/**
 * Import all required files for Vue components and other behaviour.
 * */

import {makeLogin} from "./modules/login.js";
import {makePage} from "./modules/page.js";
import {makeDashboard} from "./modules/dashboard.js";

window.onload = () => {
    makeLogin();
    makePage();
    makeDashboard();
}