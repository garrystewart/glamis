const version = 0.1;
const moment = require('moment');
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
const hue = {
    "ip": "192.168.0.10",
    "auth": "3EDLjI53lNqL14auInL0Xb7xd3Mg6inL4uc7oxTR"
}
const plex = {
    "host": "plex.glamis.casa",
    "auth": "519pREE6zNyxCqVoxiDb",
    "machineIdentifier": "knr89e14lyk4g4n6tvo3xqfo",
}
const timeout = {
    "motion": 1000,
    "plex": 10000,
    "temperature": 300000
}
log(`Initialising hue.glamis.casa version ${version}`);
log('Getting sensors...');
$.ajax({
    url: `http://${hue.ip}/api/${hue.auth}/sensors`,
}).done(function (jsonSensors) {
    if (!checkHueResponseForErrors(jsonSensors)) {
        log('Got sensors');
        var jsonMotionSensors = {};
        var jsonTemperatureSensors = {};
        for (var sensor in jsonSensors) {
            switch (jsonSensors[sensor].productname) {
                case 'Hue motion sensor':
                    log(`Found motion sensor (${jsonSensors[sensor].name})`);
                    var jsonState = {
                        "state": {
                            "lastupdated": jsonSensors[sensor].state.lastupdated
                        }
                    }
                    jsonMotionSensors[sensor] = jsonState;
                    jsonMotionSensors[sensor].name = jsonSensors[sensor].name;
                    break;
                case 'Hue temperature sensor':
                    log(`Found temperature sensor (${jsonSensors[sensor].name.replace(' Temp', '')})`);
                    var jsonState = {
                        "state": {
                            "temperature": {
                                "min": jsonSensors[sensor].state.temperature,
                                "max": jsonSensors[sensor].state.temperature,
                                "current": jsonSensors[sensor].state.temperature
                            }
                        }
                    }
                    jsonTemperatureSensors[sensor] = jsonState;
                    jsonTemperatureSensors[sensor].name = jsonSensors[sensor].name;
                    break;
            }
        }
        log('Initialised');
        checkTemperatureSensors();
        checkMotionSensors();

        function checkTemperatureSensors() {
            setTimeout(function () {
                log('Checking temperature sensors...');
                log('Getting sensors...');
                $.ajax({
                    url: `http://${hue.ip}/api/${hue.auth}/sensors`,
                }).done(function (jsonSensors) {
                    if (!checkHueResponseForErrors(jsonSensors)) {
                        log('Got sensors');
                        for (var sensor in jsonTemperatureSensors) {
                            if (jsonSensors[sensor].state.temperature < jsonTemperatureSensors[sensor].state.temperature.min) {
                                jsonTemperatureSensors[sensor].state.temperature.min = jsonSensors[sensor].state.temperature;
                            }
                            if (jsonSensors[sensor].state.temperature > jsonTemperatureSensors[sensor].state.temperature.max) {
                                jsonTemperatureSensors[sensor].state.temperature.max = jsonSensors[sensor].state.temperature;
                            }
                            log(`${jsonSensors[sensor].name.replace(' Temp', '')} ${jsonSensors[sensor].state.temperature / 100}C (min: ${jsonTemperatureSensors[sensor].state.temperature.min / 100}C, max: ${jsonTemperatureSensors[sensor].state.temperature.max / 100}C)`);
                        }
                        log('Checked temperature sensors');
                        log(`Checking temperature sensors in ${timeout.temperature}ms`);
                        checkTemperatureSensors();
                    }
                }).fail(function () {
                    console.error('Error');
                });
            }, timeout.temperature)
        }

        function checkMotionSensors() {
            setTimeout(function () {
                $.ajax({
                    url: `http://${hue.ip}/api/${hue.auth}/sensors`,
                }).done(function (jsonSensors) {
                    if (!checkHueResponseForErrors(jsonSensors)) {
                        for (var sensor in jsonMotionSensors) {
                            /*if (sensor === '50') { // PLEX @ Spare Room
                                var time = new moment().subtract(30, 'seconds');
                                if (moment(jsonSensors[sensor].state.lastupdated).isAfter(time)) {
                                    doRequest(sensor);
        
                                    function doRequest(sensor) {
                                        log('PLEX - Getting data...');
                                        $.ajax({
                                            url: `http://${plex.host}/status/sessions`,
                                            data: {
                                                "X-Plex-Token": plex.auth
                                            }
                                        }).done(function(xml){
                                            if ($(xml).find('Video').length) {
                                                log(`PLEX - Videos found. Checking for machineIdentifier ${plex.machineIdentifier}...`);
                                                var ps4Found = false;
                                                $(xml).find('Player').each(function (index, player) {
                                                    if ($(player).attr('machineIdentifier') === plex.machineIdentifier) {
                                                        log(`PLEX - machineIdentifier ${plex.machineIdentifier} found`);
                                                        ps4Found = true;
                                                        return false;
                                                    }
                                                });
                                                if (!ps4Found) {
                                                    log(`PLEX - machineIdentifier ${plex.machineIdentifier} not found`);
                                                    isMotionDetected(sensor);
                                                }
                                            } else {
                                                log('PLEX - No videos found');
                                                console.log(`passing in ${sensor}`);
                                                isMotionDetected(sensor);
                                            }
                                        }).fail(function(){
                                            console.error('Error');
                                        });
                                    }
                                } else {
                                    isMotionDetected(sensor);
                                }
                            } else {*/
                            isMotionDetected(sensor);
                            //}
                        }
                        checkMotionSensors();

                        function isMotionDetected(sensor) {
                            if ( /*moment(jsonSensors[sensor].state.lastupdated).isAfter(jsonMotionSensors[sensor].state.lastupdated) && */ jsonSensors[sensor].state.presence !== false) {
                                jsonMotionSensors[sensor].state.lastupdated = jsonSensors[sensor].state.lastupdated;
                                motionDetected(sensor);
                            }
                        }
                    }
                }).fail(function () {
                    console.error('Error');
                });
            }, timeout.motion);
        }

        function motionDetected_isBetween(options) {
            var now = new moment();
            var time1 = new moment(`${now.format('YYYY-MM-DD')}T${options.time1.time}`);
            var time2 = new moment(`${now.format('YYYY-MM-DD')}T${options.time2.time}`);
            if (now.isBetween(time1, time2, 'seconds')) {
                motionDetected_action('1');
            } else {
                motionDetected_action('2');
            }

            function motionDetected_action(int) {
                if (!global[`groupOn${options.group.id}`]) {
                    log(`Switching ${options.group.name} lights to ${options[`time${int}`].name} mode...`);
                    $.ajax({
                        url: `http://${hue.ip}/api/${hue.auth}/groups/${options.group.id}/action`,
                        method: 'PUT',
                        dataType: 'json',
                        data: JSON.stringify({
                            "hue": options[`time${int}`].hue,
                            "sat": options[`time${int}`].sat,
                            "on": true,
                            "bri": options[`time${int}`].bri
                        })
                    }).done(function (body) {
                        if (!checkHueResponseForErrors(body)) {
                            global[`groupOn${options.group.id}`] = true;
                            log(`Switched ${options.group.name} lights to ${options[`time${int}`].name} mode`);
                            if (typeof global[`timeout${options.group.name}`] === 'object') {
                                clearTimeout(global[`timeout${options.group.name}`]);
                            }
                            log(`Switching off ${options.group.name} lights in ${options[`time${int}`].timeout}ms`);
                            global[`timeout${options.group.name}`] = setTimeout(function () {
                                log(`Switching off ${options.group.name} lights...`);
                                $.ajax({
                                    url: `http://${hue.ip}/api/${hue.auth}/groups/${options.group.id}/action`,
                                    method: 'PUT',
                                    data: JSON.stringify({
                                        "on": false
                                    })
                                }).done(function (body) {
                                    if (!checkHueResponseForErrors(body)) {
                                        global[`groupOn${options.group.id}`] = false;
                                        log(`Switched off ${options.group.name} lights`);
                                    }
                                }).fail(function () {
                                    console.error('Error');
                                });
                            }, options[`time${int}`].timeout);
                        }
                    }).fail(function () {
                        console.error('Error');
                    });
                }
            }
        }

        function motionDetected(sensor) {
            var now = new moment();
            log(`Motion detected (${jsonMotionSensors[sensor].name})`);
            switch (sensor) {
                case '46': // bedroom  
                    motionDetected_isBetween({
                        "time1": {
                            "time": "07:00:00",
                            "name": "day",
                            "hue": 0,
                            "sat": 0,
                            "bri": 254,
                            "timeout": 300000,
                        },
                        "time2": {
                            "time": "22:00:00",
                            "name": "night",
                            "hue": 0,
                            "sat": 254,
                            "bri": 0,
                            "timeout": 30000,
                        },
                        "group": {
                            "id": 8,
                            "name": "Bedroom"
                        }
                    });
                    break;
                case '11': // kitchen  
                    motionDetected_isBetween({
                        "time1": {
                            "time": "07:00:00",
                            "name": "day",
                            "hue": 0,
                            "sat": 0,
                            "bri": 254,
                            "timeout": 120000,
                        },
                        "time2": {
                            "time": "23:59:59",
                            "name": "night",
                            "hue": 0,
                            "sat": 254,
                            "bri": 0,
                            "timeout": 30000,
                        },
                        "group": {
                            "id": 1,
                            "name": "Kitchen"
                        }
                    });
                    break;
                case '8': // hallway     
                    motionDetected_isBetween({
                        "time1": {
                            "time": "07:00:00",
                            "name": "day",
                            "hue": 0,
                            "sat": 0,
                            "bri": 254,
                            "timeout": 30000,
                        },
                        "time2": {
                            "time": "23:59:59",
                            "name": "night",
                            "hue": 0,
                            "sat": 254,
                            "bri": 0,
                            "timeout": 30000,
                        },
                        "group": {
                            "id": 5,
                            "name": "Hallway"
                        }
                    });
                    break;
                case '14': // hallway                
                    motionDetected_isBetween({
                        "time1": {
                            "time": "07:00:00",
                            "name": "day",
                            "hue": 0,
                            "sat": 0,
                            "bri": 254,
                            "timeout": 30000,
                        },
                        "time2": {
                            "time": "23:59:59",
                            "name": "night",
                            "hue": 0,
                            "sat": 254,
                            "bri": 0,
                            "timeout": 30000,
                        },
                        "group": {
                            "id": 5,
                            "name": "Hallway"
                        }
                    });
                    break;
                case '55': // bathroom                
                    motionDetected_isBetween({
                        "time1": {
                            "time": "07:00:00",
                            "name": "day",
                            "hue": 0,
                            "sat": 0,
                            "bri": 254,
                            "timeout": 60000,
                        },
                        "time2": {
                            "time": "23:59:59",
                            "name": "night",
                            "hue": 0,
                            "sat": 254,
                            "bri": 0,
                            "timeout": 30000,
                        },
                        "group": {
                            "id": 4,
                            "name": "Bathroom"
                        }
                    });
                    break;
                case '50': // spare room
                    motionDetected_isBetween({
                        "time1": {
                            "time": "07:00:00",
                            "name": "day",
                            "hue": 0,
                            "sat": 0,
                            "bri": 254,
                            "timeout": 900000,
                        },
                        "time2": {
                            "time": "22:00:00",
                            "name": "night",
                            "hue": 0,
                            "sat": 254,
                            "bri": 0,
                            "timeout": 30000,
                        },
                        "group": {
                            "id": 7,
                            "name": "Spare_room"
                        }
                    });
                    break;
            }
        }
    }
}).fail(function () {
    log('Error');
});

function log(msg) {
    console.log(`${timestamp()} ${msg}`);
}

function timestamp() {
    var now = new moment();
    return `[${now.format('HH:mm:ss')}]`;
}

function checkHueResponseForErrors(json) {
    var errFound = false;
    $(json).each(function (index, obj) {
        if ('error' in obj) {
            arrFound = true;
            log(`[ERROR] type ${obj.error.type} ${obj.error.address} ${obj.error.description}`);
        }
    });
    if (errFound) {
        return true;
    } else {
        return false;
    }
}