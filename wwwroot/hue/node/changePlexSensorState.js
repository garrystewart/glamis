var jsdom = require("jsdom");
const {
    JSDOM
} = jsdom;
const {
    window
} = new JSDOM();
const {
    document
} = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);

var jsonConfig = require('./config.json');

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors/100/state`,
    method: 'PUT',
    async: false,
    data: JSON.stringify({
        "status": 1
    })
}).done(function (response) {
    console.log(response);
}).fail(function (err) {
    console.log(err.statusText);
});