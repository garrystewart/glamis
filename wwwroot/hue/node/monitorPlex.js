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

// set up start

var jsonConfig = require('./config.json');
var jsonPlexCredits = require('./plexCredits.json');
var debugMode = false;
const delayAdjustment = 1000;

var plexSensor;
$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors`,
    async: false,
}).done(function (response) {
    for (var sensor in response) {
        if (response[sensor].name === 'plex') {
            plexSensor = sensor;
            break;
        }
    }
    main();
}).fail(function (err) {
    console.log(err.statusText);
});

// set up end

// main code start

function main() {

    var currentPlexSensorStatus;
    var logsEnabled = false;

    var playing = false;
    var progressMilliseconds = 0;
    var anticipatedTime = 0;

    setInterval(function () {
        if (playing) {
            if (progressMilliseconds > anticipatedTime) {
                console.log(' [INFORMATION]  Synchronising anticipated progress with actual progress');
                anticipatedTime = progressMilliseconds
            }
            anticipatedTime += 500;
        }

        $.ajax({
            url: `http://${jsonConfig.plex.host}/status/sessions`,
            async: true,
            data: {
                "X-Plex-Token": jsonConfig.plex.auth
            }
        }).done(function (xml) {
            if ($(xml).find('Video').length) {
                if (!logsEnabled) console.log(` [INFORMATION]  Looking for machineIdentifier ${jsonConfig.plex.machineIdentifier}...`);
                var machineFound = false;
                $(xml).find('Player').each(function (index, player) {
                    if ($(player).attr('machineIdentifier') === jsonConfig.plex.machineIdentifier) {
                        if (!logsEnabled) console.log(` [INFORMATION]  machineIdentifier ${jsonConfig.plex.machineIdentifier} found`);
                        machineFound = true;
                        var guid = $(player).parents('Video').attr('guid');
                        var id = guid.substr(guid.indexOf('tt') + 2, 7);
                        switch ($(player).attr('state')) {
                            case 'buffering':
                                if (!logsEnabled) console.log(` [STATUS]  ${jsonPlexCredits[id].title} buffering...`);
                                changePlexSensorStatus(1);
                                break;
                            case 'playing':
                                progressMilliseconds = Number($(player).parents('Video').attr('viewOffset'));
                                if (!playing) anticipatedTime = Number(progressMilliseconds);
                                playing = true;
                                var creditsMilliseconds = jsonPlexCredits[id].credits;
                                if (!logsEnabled) console.log(` [STATUS]  ${jsonPlexCredits[id].title} playing...`);
                                if (anticipatedTime < (creditsMilliseconds - delayAdjustment)) {
                                    changePlexSensorStatus(2);
                                } else {
                                    if (!logsEnabled) console.log(' [INFORMATION]  Credits detected');
                                    changePlexSensorStatus(4);
                                }
                                break;
                            case 'paused':
                                progressMilliseconds = $(player).parents('Video').attr('viewOffset');
                                //console.log(progressMilliseconds);
                                if (!logsEnabled) console.log(` [STATUS]  ${jsonPlexCredits[id].title} paused`);
                                changePlexSensorStatus(3);
                                break;
                            default:
                                console.log('\x1b[33m', '[WARNING]', '\x1b[37m', `unknown switch type (${$(player).attr('state')})`);
                        }
                        return false;
                    }
                });
                if (!machineFound) {
                    if (!logsEnabled) console.log(` [INFORMATION]  machineIdentifier ${jsonConfig.plex.machineIdentifier} not found`);
                    changePlexSensorStatus(0);
                }
            } else {
                if (!logsEnabled) console.log(' [STATUS]  No videos playing');
                changePlexSensorStatus(0);
            }
        }).fail(function (err) {
            console.log(err.statusText);
        });
    }, 500);

    function changePlexSensorStatus(status) {
        if (status !== 2 && status !== 4) playing = false;
        if (!debugMode) logsEnabled = true;
        if (currentPlexSensorStatus !== status) {
            currentPlexSensorStatus = status;
            if (!debugMode) logsEnabled = false;
            console.log('\x1b[33m', '[REQUEST]', '\x1b[37m', `Changing Plex sensor status to ${status}`);
            $.ajax({
                url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors/${plexSensor}/state`,
                method: 'PUT',
                async: true,
                data: JSON.stringify({
                    "status": status
                })
            }).done(function (response) {
                if (!checkHueResponseForErrors(response)) console.log('\x1b[32m', '[SUCCESS]', '\x1b[37m', `Plex sensor status changed to ${status}`);
            }).fail(function (err) {
                console.log(err.statusText);
            });
        }
    }

    function checkHueResponseForErrors(json) {
        var errFound = false;
        $(json).each(function (index, obj) {
            if ('error' in obj) {
                arrFound = true;
                console.log('\x1b[31m', '[ERROR]', '\x1b[37m', `type ${obj.error.type} ${obj.error.address} ${obj.error.description}`);
            }
        });
        if (errFound) {
            return true;
        } else {
            return false;
        }
    }

}