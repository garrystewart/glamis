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

$(jsonSerials).each(function(index, serial){
    $.ajax({
        url: `http://bridge.hue.glamis.casa/api/${jsonConfig.auth}/lights`,
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
    $.getJSON(`http://bridge.hue.glamis.casa/api/${jsonConfig.auth}/lights`, function(response){
        console.log(`${Object.keys(response).length}/${Object.keys(jsonLights).length} lights found`);
    }).fail(function(err){
        console.log(err.statusText);
    });
}, 40000);