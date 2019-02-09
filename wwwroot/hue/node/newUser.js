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

$.post(`http://${jsonConfig.hostname}/api`, JSON.stringify({
    devicetype: "node"
}), function (response) {
    console.log(response); 
}).fail(function (err) {
    console.log(err.statusText);
});