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
var jsonGroups = require('./groups.json');

$(jsonGroups).each(function (index, group) {
    $.ajax({
        url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/groups`,
        method: 'POST',
        async: false,
        data: JSON.stringify({
            "name": group.name,
            "type": "LightGroup",
            "lights": findLightIdsByMacs(group.lights)
        })
    }).done(function (response) {
        console.log(response);
    }).fail(function (err) {
        console.log(err.statusText);
    });
});

function findLightIdsByMacs(arrMacs) {
    var arrIds = [];
    $.ajax({
        url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/lights`,
        async: false
    }).done(function (response) {        
        $(arrMacs).each(function (index, mac) {
            for (var light in response) {
                if (response[light].uniqueid === mac) {
                    arrIds.push(light);
                    break;
                }
            }
        });
    }).fail(function (err) {
        console.log(err);
    });
    return arrIds;
}