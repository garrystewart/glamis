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
var jsonRooms = require('./rooms.json');

$(jsonRooms).each(function (index, room) {
    $.ajax({
        url: `http://${jsonConfig.hostname}/api/${jsonConfig.auth}/groups`,
        method: 'POST',
        async: false,
        data: JSON.stringify({
            "name": room.name,
            "type": "Room",
            "class": room.Class,
            "lights": findLightIdsByMacs(room.lights)
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
        url: `http://${jsonConfig.hostname}/api/${jsonConfig.auth}/lights`,
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