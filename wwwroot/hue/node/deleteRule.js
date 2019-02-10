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
const rule = 71;

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/rules/${rule}`,
    method: 'DELETE',
    async: false
}).done(function (response) {
    console.log(response);
}).fail(function (err) {
    console.log(err.statusText);
});