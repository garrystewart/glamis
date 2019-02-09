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
var jsonSerials = require('./serials.json');
var jsonLights = require('./lights.json');

findLights();
function findLights(){
    $(jsonSerials).each(function(index, serial){
        $.ajax({
            url: `http://${jsonConfig.hostname}/api/${jsonConfig.auth}/lights`,
            method: 'POST',
            async: false,
            data: JSON.stringify({
                deviceid: [serial]
            })
        }).done(function(response){
            console.log(response);
        }).fail(function(err){
            console.log(err.statusText);
        });
    });
    console.log('Waiting 40 seconds...');
    setTimeout(function(){
        $.getJSON(`http://${jsonConfig.hostname}/api/${jsonConfig.auth}/lights`, function(response){
            var intTotalLights = Object.keys(jsonLights).length;
            var intLightsFound = Object.keys(response).length;
            if (intLightsFound < intTotalLights) {
                console.log(`${intLightsFound}/${intTotalLights} lights found. Searching again...`);
                findLights();
            } else {
                console.log(`${intLightsFound}/${intTotalLights} lights found`);
            }
        }).fail(function(err){
            console.log(err.statusText);
        });
    }, 40000);
}