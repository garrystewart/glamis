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
const scenes = [
    "UUNrdI8lPoNBo8n"
]

$(scenes).each(function (index, scene) {
    $.ajax({
        url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/scenes/${scene}`,
        method: 'DELETE',
        async: false
    }).done(function (response) {
        console.log(response);
    }).fail(function (err) {
        console.log(err.statusText);
    });
});