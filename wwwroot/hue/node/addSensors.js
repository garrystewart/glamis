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
var jsonSensors = require('./sensors.json');

console.log('Walk round and trigger each sensor!');

doScan();
function doScan() {
    $.ajax({
        url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors`,
        method: 'POST',
        async: false
    }).done(function (response) {
        console.log(response);
        checkTotalSensors();
    }).fail(function (err) {
        console.log(err.statusText);
    });
}

function activeCheck(){
    var checking;
    $.ajax({
        url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors/new`,
        async: false
    }).done(function (response) {
        console.log(response);
        (response.lastscan === 'active') ? checking = true : checking = false
    }).fail(function (err) {
        console.log(err.statusText);
    });
    return checking;
}

function checkTotalSensors(){
    $.ajax({
        url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors`,
        async: false
    }).done(function (response) {
        var intTotalSensors = Object.keys(jsonSensors).length * 3;
        var intSensorsFound = 0;
        for (var sensor in response){
            if (typeof response[sensor].uniqueid !== 'undefined') {
                for (var uniqueid in jsonSensors){
                    if (~response[sensor].uniqueid.indexOf(uniqueid)) {
                        intSensorsFound++;
                        break;
                    }
                }                
            }
        }
        if (intSensorsFound < intTotalSensors) {
            console.log(`${intSensorsFound}/${intTotalSensors} sensors found. Continuing search...`);
            if (activeCheck()) {
                console.log('Scanning still active. Waiting 40 seconds...');
                setTimeout(function(){
                    checkTotalSensors();
                }, 40000);
            } else {
                doScan();
            }
        } else {
            console.log(`${intSensorsFound}/${intTotalSensors} sensors found`);
        }
    }).fail(function (err) {
        console.log(err.statusText);
    });    
}