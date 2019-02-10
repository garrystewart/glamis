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
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors`,
    method: 'POST',
    async: false,
    data: JSON.stringify({
        "name": "plex",
        "type": "CLIPGenericStatus",
        "modelid": "XXplex",
        "manufacturername": "XXplex",
        "swversion": "0",
        "uniqueid": "XXplex"
    })
}).done(function (response) {
    console.log(response);
}).fail(function (err) {
    console.log(err.statusText);
});