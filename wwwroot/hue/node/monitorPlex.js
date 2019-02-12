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
var jsonPlexCredits = require('./plexCredits.json');
var intStoredState;

var intPlexSensor;

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors`,
    async: true,
}).done(function (response) {
    for (var sensor in response) {
        if (response[sensor].name === 'plex') {
            intPlexSensor = sensor;
            break;
        }
    }
}).fail(function (err) {
    console.log(err.statusText);
});

doPlexPoll();

function doPlexPoll() {
    $.ajax({
        url: `http://${jsonConfig.plex.host}/status/sessions`,
        async: true,
        data: {
            "X-Plex-Token": jsonConfig.plex.auth
        }
    }).done(function (xml) {
        if ($(xml).find('Video').length) {
            console.log(`PLEX - Videos found. Checking for machineIdentifier ${jsonConfig.plex.machineIdentifier}...`);
            var machineFound = false;
            $(xml).find('Player').each(function (index, player) {
                if ($(player).attr('machineIdentifier') === jsonConfig.plex.machineIdentifier) {
                    console.log(`PLEX - machineIdentifier ${jsonConfig.plex.machineIdentifier} found`);
                    machineFound = true;
                    switch ($(player).attr('state')) {
                        case 'buffering':
                            console.log($(player).parents('Video').attr('viewOffset'));
                            if (intStoredState !== 1) plexSensor(1);
                            intStoredState = 1;
                            break;
                        case 'playing':
                            var progressMilliseconds = $(player).parents('Video').attr('viewOffset');
                            var guid = $(player).parents('Video').attr('guid');
                            var id = guid.substr(guid.indexOf('tt') + 2, 7);
                            var creditsMilliseconds = jsonPlexCredits[id].credits;
                            console.log(progressMilliseconds);
                            console.log(creditsMilliseconds);
                            if (progressMilliseconds < creditsMilliseconds) {
                                if (intStoredState !== 2) plexSensor(2);
                                intStoredState = 2;
                            } else {
                                if (intStoredState !== 4) plexSensor(4);
                                intStoredState = 4;
                            }
                            break;
                        case 'paused':
                            console.log($(player).parents('Video').attr('viewOffset'));
                            if (intStoredState !== 3) plexSensor(3);
                            intStoredState = 3;
                            break;
                        default:
                            console.log(`unknown switch type (${$(player).attr('state')})`);
                    }

                    return false;
                }
            });
            if (!machineFound) {
                console.log(`PLEX - machineIdentifier ${jsonConfig.plex.machineIdentifier} not found`);
                if (intStoredState !== 0) plexSensor(0);
                intStoredState = 0;
            }
        } else {
            console.log('PLEX - No videos found');
            if (intStoredState !== 0) plexSensor(0);
            intStoredState = 0;
        }
    }).fail(function (err) {
        console.log(err.statusText);
    });
    doPlexPoll();
}

function plexSensor(status) {
    $.ajax({
        url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors/${intPlexSensor}/state`,
        method: 'PUT',
        async: true,
        data: JSON.stringify({
            "status": status
        })
    }).done(function (response) {
        console.log(response);
    }).fail(function (err) {
        console.log(err.statusText);
    });
}