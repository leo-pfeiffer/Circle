/**
 * Import all required files for Vue components and other behaviour.
 * */

import {makeLogin} from "./modules/login.js";

window.onload = () => {
    makeLogin();
}