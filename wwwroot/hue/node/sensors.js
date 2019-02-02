const version = 0.1;
const request = require('request');
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
//log('Getting lights...');
request({
    url: `http://${hue.ip}/api/${hue.auth}/lights`,
    method: 'GET'
}, function (err, httpResponse, jsonLights) {
    /*jsonLights = JSON.parse(jsonLights);
    log('Got lights');
    log('Switching off all lights...');
    for (var light in jsonLights) {
        log(`Switching off ${jsonLights[light].name}...`);
        new request({
            url: `http://${hue.ip}/api/${hue.auth}/lights/${light}/state`,
            method: 'PUT',
            form: JSON.stringify({
                "on": false
            })
        }, function (err, httpResponse, body) {
            log(`Switched off ${jsonLights[light].name}`);
        });
    }
    log('Switched off all lights');*/
    log('Getting sensors...');
    request(`http://${hue.ip}/api/${hue.auth}/sensors`, function (err, httpResponse, jsonSensors) {
        log('Got sensors');
        jsonSensors = JSON.parse(jsonSensors);
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
                request(`http://${hue.ip}/api/${hue.auth}/sensors`, function (err, httpResponse, jsonSensors) {
                    log('Got sensors');
                    jsonSensors = JSON.parse(jsonSensors);
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
                });
            }, timeout.temperature)
        }

        function checkMotionSensors() {
            setTimeout(function () {
                request(`http://${hue.ip}/api/${hue.auth}/sensors`, function (err, httpResponse, jsonSensors) {
                    if (err === null) {
                        jsonSensors = JSON.parse(jsonSensors);
                        for (var sensor in jsonMotionSensors) {
                            if (sensor === '50') { // PLEX @ Spare Room
                                var time = new moment().subtract(30, 'seconds');
                                if (moment(jsonSensors[sensor].state.lastupdated).isAfter(time)) {                                    
                                    doRequest(sensor);
                                    function doRequest(sensor) {
                                        log('PLEX - Getting data...');
                                        request({
                                            url: `http://${plex.host}/status/sessions`,
                                            method: 'GET',
                                            qs: {
                                                "X-Plex-Token": plex.auth
                                            },
                                        }, function (err, httpResponse, xml) {
                                            if (err === null) {
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
                                            } else {
                                                log('Error');
                                            }
                                        });
                                    }
                                } else {
                                    isMotionDetected(sensor);
                                }
                            } else {
                                isMotionDetected(sensor);
                            }
                        }
                        checkMotionSensors();
                    } else {
                        log('Error');
                    }

                    function isMotionDetected(sensor) {
                        if ( /*moment(jsonSensors[sensor].state.lastupdated).isAfter(jsonMotionSensors[sensor].state.lastupdated) && */ jsonSensors[sensor].state.presence !== false) {
                            jsonMotionSensors[sensor].state.lastupdated = jsonSensors[sensor].state.lastupdated;
                            motionDetected(sensor);
                        }
                    }
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
                    request({
                        url: `http://${hue.ip}/api/${hue.auth}/groups/${options.group.id}/action`,
                        method: 'PUT',
                        form: JSON.stringify({
                            "hue": options[`time${int}`].hue,
                            "sat": options[`time${int}`].sat,
                            "on": true,
                            "bri": options[`time${int}`].bri
                        })
                    }, function (err, httpResponse, body) {
                        body = JSON.parse(body);
                        if (err === null) {
                            if ('error' in body) {
                                log(body);
                            } else {
                                global[`groupOn${options.group.id}`] = true;
                                log(`Switched ${options.group.name} lights to ${options[`time${int}`].name} mode`);
                                if (typeof global[`timeout${options.group.name}`] === 'object') {
                                    clearTimeout(global[`timeout${options.group.name}`]);
                                }
                                log(`Switching off ${options.group.name} lights in ${options[`time${int}`].timeout}ms`);
                                global[`timeout${options.group.name}`] = setTimeout(function () {
                                    log(`Switching off ${options.group.name} lights...`);
                                    request({
                                        url: `http://${hue.ip}/api/${hue.auth}/groups/${options.group.id}/action`,
                                        method: 'PUT',
                                        form: JSON.stringify({
                                            "on": false
                                        })
                                    }, function (err, httpResponse, body) {
                                        body = JSON.parse(body);
                                        if (err === null) {
                                            if ('error' in body) {
                                                log(body);
                                            } else {
                                                global[`groupOn${options.group.id}`] = false;
                                                log(`Switched off ${options.group.name} lights`);
                                            }
                                        } else {
                                            log('Error');
                                        }
                                    });
                                }, options[`time${int}`].timeout);
                            }
                        } else {
                            log('Error');
                        }
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
    });
});

function putGroup(options, callback){
    request({
        url: `http://${hue.ip}/api/${hue.auth}/groups/${options.group.id}/action`,
        method: 'PUT',
        form: JSON.stringify(options.form)
    }, function (err, httpResponse, body) {
        callback = {err, httpResponse, body}
    });
}

function log(msg) {
    console.log(`${timestamp()} ${msg}`);
}

function timestamp() {
    var now = new moment();
    return `[${now.format('HH:mm:ss')}]`;
}