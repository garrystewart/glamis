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
var jsonPlexScenes = require('./plexScenes.json');
var jsonLights = findLightIdsByMacs();

$(jsonPlexScenes).each(function(index, scene){
    $.ajax({
        url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/scenes`,
        method: 'POST',
        async: false,
        data: JSON.stringify(buildData(scene))
    }).done(function (response) {
        console.log(response);
    }).fail(function (err) {
        console.log(err.statusText);
    });
});

function findLightIdsByMacs() {
    var objLights = {};
    $(jsonPlexScenes).each(function (index, scene) {
        $.ajax({
            url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/lights`,
            async: false
        }).done(function (response) {
            $(scene.lights).each(function (index, mac) {
                for (var light in response) {
                    if (response[light].uniqueid === mac) {
                        objLights[mac] = light;
                        break;
                    }
                }
            });
        }).fail(function (err) {
            console.log(err);
        });
    });
    return objLights;
}

function buildData(scene) {
    var arrLights = [];
    $(scene.lights).each(function (index, mac) {
        arrLights.push(jsonLights[mac]);
    });
    scene.lights = arrLights;
    var objLightStates = {};
    for (var mac in scene.lightstates) {
        var objToInsert = scene.lightstates[mac];
        objLightStates[jsonLights[mac]] = objToInsert;
    }
    scene.lightstates = objLightStates;
    console.log(scene);
    return scene;
}