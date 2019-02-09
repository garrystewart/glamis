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

$.getJSON(`http://${jsonConfig.hostname}/api/${jsonConfig.auth}/sensors`, function (response) {
    for (var sensor in response) {
        if (typeof response[sensor].uniqueid !== 'undefined') {
            var uniqueid = response[sensor].uniqueid;
            var uniqueidWithoutExt = uniqueid.substring(0, uniqueid.length - 5);
            var type;
            switch (uniqueid.substring(uniqueid.length - 4)) {
                case '0402':
                    type = 'temperature';
                    break;
                case '0406':
                    type = 'motion';
                    break;
                case '0400':
                    type = 'ambient light';
                    break;
                default:
                    console.log('unknown switch type');
            }
            $.ajax({
                url: `http://${jsonConfig.hostname}/api/${jsonConfig.auth}/sensors/${sensor}`,
                async: false,
                method: 'PUT',
                data: JSON.stringify({
                    name: `${jsonSensors[uniqueidWithoutExt].name} ${type}`
                })
            }).done(function (response) {
                console.log(response);
            }).fail(function (err) {
                console.log(err.statusText);
            });
        }
    }
}).fail(function (err) {
    console.log(err.statusText);
});