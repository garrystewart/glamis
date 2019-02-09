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
var jsonLights = require('./lights.json');

$.getJSON(`http://bridge.hue.glamis.casa/api/${jsonConfig.auth}/lights`, function (response) {
    for (var light in response){
        $.ajax({
            url: `http://bridge.hue.glamis.casa/api/${jsonConfig.auth}/lights/${light}`,
            async: false,
            method: 'PUT',
            data: JSON.stringify({
                name: jsonLights[response[light].uniqueid].name
            })
        }).done(function(response){
            console.log(response);
        }).fail(function(err){
            console.log(err.statusText);
        });
    }
}).fail(function (err) {
    console.log(err.statusText);
});