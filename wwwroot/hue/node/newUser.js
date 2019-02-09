// use this file after factory reset to generate a new user

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

$.post('http://bridge.hue.glamis.casa/api', JSON.stringify({
    devicetype: "node"
}), function (response) {
    console.log(response); 
}).fail(function (err) {
    console.log(err.statusText);
});