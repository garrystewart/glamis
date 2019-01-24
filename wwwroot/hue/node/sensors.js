const version = 0.1;
const request = require('request');
const moment = require('moment');
const hue = {
    "ip": "192.168.0.10",
    "auth": "3EDLjI53lNqL14auInL0Xb7xd3Mg6inL4uc7oxTR"
}
const motionTimeout = 1000;
const temperatureTimeout = 300000;
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
                    log(`Checking temperature sensors in ${temperatureTimeout}ms`);
                    checkTemperatureSensors();
                });
            }, temperatureTimeout)
        }

        function checkMotionSensors() {
            setTimeout(function () {
                request(`http://${hue.ip}/api/${hue.auth}/sensors`, function (err, httpResponse, jsonSensors) {
                    jsonSensors = JSON.parse(jsonSensors);
                    for (var sensor in jsonMotionSensors) {
                        if (moment(jsonSensors[sensor].state.lastupdated).isAfter(jsonMotionSensors[sensor].state.lastupdated) && jsonSensors[sensor].state.presence !== false) {
                            jsonMotionSensors[sensor].state.lastupdated = jsonSensors[sensor].state.lastupdated;
                            motionDetected(sensor);
                        }
                    }
                    checkMotionSensors();
                });
            }, motionTimeout);
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
                    if (err === null) {
                        log(body);
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
                                if (err === null) {
                                    log(body);
                                    log(`Switched off ${options.group.name} lights`);
                                } else {
                                    log('Error');
                                }
                            });
                        }, options[`time${int}`].timeout);
                    } else {
                        log('Error');
                    }
                });
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
                            "id": 8,
                            "name": "Bedroom"
                        }
                    });
                    /*var time1 = new moment(`${now.format('YYYY-MM-DD')}T07:00:00`);
                    var time2 = new moment(`${now.format('YYYY-MM-DD')}T22:00:00`);
                    if (now.isBetween(time1, time2, 'seconds')) {
                        log('Switching bedroom light to day mode...');
                        request({
                            url: `http://${hue.ip}/api/${hue.auth}/lights/12/state`,
                            method: 'PUT',
                            form: JSON.stringify({
                                "hue": 0,
                                "sat": 0,
                                "on": true,
                                "bri": 254
                            })
                        }, function (err, httpResponse, body) {
                            if (err === null) {
                                log(body);
                                log('Switched bedroom light to day mode');
                                log('Switching off bedroom light in 60000ms');
                                if (typeof timeoutBedroom === 'object') {
                                    clearTimeout(timeoutBedroom);
                                }
                                timeoutBedroom = setTimeout(function () {
                                    log('Switching off bedroom light...');
                                    request({
                                        url: `http://${hue.ip}/api/${hue.auth}/lights/12/state`,
                                        method: 'PUT',
                                        form: JSON.stringify({
                                            "on": false
                                        })
                                    }, function (err, httpResponse, body) {
                                        if (err === null) {
                                            log(body);
                                            log('Switched off bedroom light');
                                        } else {
                                            log('Error');
                                        }
                                    });
                                }, 60000);
                            } else {
                                log('Error');
                            }
                        });
                    } else {
                        log('Switching bedroom light to night mode...');
                        request({
                            url: `http://${hue.ip}/api/${hue.auth}/lights/12/state`,
                            method: 'PUT',
                            form: JSON.stringify({
                                "hue": 0,
                                "sat": 254,
                                "on": true,
                                "bri": 0
                            })
                        }, function (err, httpResponse, body) {
                            if (err === null) {
                                log(body);
                                log('Switched bedroom light to night mode');
                                log('Switching off bedroom light in 30000ms');
                                timeoutBedroom = setTimeout(function () {
                                    log('Switching off bedroom light...');
                                    request({
                                        url: `http://${hue.ip}/api/${hue.auth}/lights/12/state`,
                                        method: 'PUT',
                                        form: JSON.stringify({
                                            "on": false
                                        })
                                    }, function (err, httpResponse, body) {
                                        if (err === null) {
                                            log(body);
                                            log('Switched off bedroom light');
                                        } else {
                                            log('Switched off bedroom light');
                                        }
                                    });
                                }, 30000);
                            } else {
                                log('Error');
                            }
                        });
                    }*/
                    break;
                case '11': // kitchen                
                    var time1 = new moment(`${now.format('YYYY-MM-DD')}T07:00:00`);
                    var time2 = new moment(`${now.format('YYYY-MM-DD')}T23:59:59`);
                    if (now.isBetween(time1, time2, 'seconds')) {
                        log('Switching kitchen lights to day mode...');
                        request({
                            url: `http://${hue.ip}/api/${hue.auth}/groups/1/action`,
                            method: 'PUT',
                            form: JSON.stringify({
                                "hue": 0,
                                "sat": 0,
                                "on": true,
                                "bri": 254
                            })
                        }, function (err, httpResponse, body) {
                            if (err === null) {
                                log(body);
                                log('Switched kitchen lights to day mode');
                                log('Switching off kitchen lights in 900000ms');
                                timeoutKitchen = setTimeout(function () {
                                    log('Switching off kitchen lights...');
                                    request({
                                        url: `http://${hue.ip}/api/${hue.auth}/groups/1/action`,
                                        method: 'PUT',
                                        form: JSON.stringify({
                                            "on": false
                                        })
                                    }, function (err, httpResponse, body) {
                                        if (err === null) {
                                            log(body);
                                            log('Switched off kitchen lights');
                                        } else {
                                            log('Error');
                                        }
                                    });
                                }, 900000);
                            } else {
                                log('Error');
                            }
                        });
                    } else {
                        log('Switching kitchen lights to night mode...');
                        request({
                            url: `http://${hue.ip}/api/${hue.auth}/groups/1/action`,
                            method: 'PUT',
                            form: JSON.stringify({
                                "hue": 0,
                                "sat": 254,
                                "on": true,
                                "bri": 0
                            })
                        }, function (err, httpResponse, body) {
                            if (err === null) {
                                log(body);
                                log('Switched kitchen lights to night mode');
                                log('Switching off kitchen lights in 30000ms');
                                timeoutKitchen = setTimeout(function () {
                                    log('Switching off kitchen lights...');
                                    request({
                                        url: `http://${hue.ip}/api/${hue.auth}/groups/1/action`,
                                        method: 'PUT',
                                        form: JSON.stringify({
                                            "on": false
                                        })
                                    }, function (err, httpResponse, body) {
                                        if (err === null) {
                                            log(body);
                                            log('Switched off kitchen lights');
                                        } else {
                                            log('Error');
                                        }
                                    });
                                }, 30000);
                            } else {
                                log('Error');
                            }
                        });
                    }
                    break;
                case '8': // hallway                
                    var time1 = new moment(`${now.format('YYYY-MM-DD')}T07:00:00`);
                    var time2 = new moment(`${now.format('YYYY-MM-DD')}T23:59:59`);
                    if (now.isBetween(time1, time2, 'seconds')) {
                        log('Switching hallway lights to day mode...');
                        request({
                            url: `http://${hue.ip}/api/${hue.auth}/groups/5/action`,
                            method: 'PUT',
                            form: JSON.stringify({
                                "hue": 0,
                                "sat": 0,
                                "on": true,
                                "bri": 254
                            })
                        }, function (err, httpResponse, body) {
                            if (err === null) {
                                log(body);
                                log('Switched hallway lights to day mode');
                                log('Switching off hallway lights in 900000ms');
                                timeoutHallway = setTimeout(function () {
                                    log('Switching off hallway lights...');
                                    request({
                                        url: `http://${hue.ip}/api/${hue.auth}/groups/5/action`,
                                        method: 'PUT',
                                        form: JSON.stringify({
                                            "on": false
                                        })
                                    }, function (err, httpResponse, body) {
                                        if (err === null) {
                                            log(body);
                                            log('Switched off hallway lights');
                                        } else {
                                            log('Error');
                                        }
                                    });
                                }, 900000);
                            } else {
                                log('Error');
                            }
                        });
                    } else {
                        log('Switching hallway lights to night mode...');
                        request({
                            url: `http://${hue.ip}/api/${hue.auth}/groups/5/action`,
                            method: 'PUT',
                            form: JSON.stringify({
                                "hue": 0,
                                "sat": 254,
                                "on": true,
                                "bri": 0
                            })
                        }, function (err, httpResponse, body) {
                            if (err === null) {
                                log(body);
                                log('Switched hallway lights to night mode');
                                log('Switching off hallway lights in 30000ms');
                                timeoutHallway = setTimeout(function () {
                                    log('Switching off hallway lights...');
                                    request({
                                        url: `http://${hue.ip}/api/${hue.auth}/groups/5/action`,
                                        method: 'PUT',
                                        form: JSON.stringify({
                                            "on": false
                                        })
                                    }, function (err, httpResponse, body) {
                                        if (err === null) {
                                            log(body);
                                            log('Switched off hallway lights');
                                        } else {
                                            log('Error');
                                        }
                                    });
                                }, 30000);
                            } else {
                                log('Error');
                            }
                        });
                    }
                    break;
                case '14': // hallway                
                    var time1 = new moment(`${now.format('YYYY-MM-DD')}T07:00:00`);
                    var time2 = new moment(`${now.format('YYYY-MM-DD')}T23:59:59`);
                    if (now.isBetween(time1, time2, 'seconds')) {
                        log('Switching hallway lights to day mode...');
                        request({
                            url: `http://${hue.ip}/api/${hue.auth}/groups/5/action`,
                            method: 'PUT',
                            form: JSON.stringify({
                                "hue": 0,
                                "sat": 0,
                                "on": true,
                                "bri": 254
                            })
                        }, function (err, httpResponse, body) {
                            if (err === null) {
                                log(body);
                                log('Switched hallway lights to day mode');
                                log('Switching off hallway lights in 900000ms');
                                timeoutHallway = setTimeout(function () {
                                    log('Switching off hallway lights...');
                                    request({
                                        url: `http://${hue.ip}/api/${hue.auth}/groups/5/action`,
                                        method: 'PUT',
                                        form: JSON.stringify({
                                            "on": false
                                        })
                                    }, function (err, httpResponse, body) {
                                        if (err === null) {
                                            log(body);
                                            log('Switched off hallway lights');
                                        } else {
                                            log('Error');
                                        }
                                    });
                                }, 900000);
                            } else {
                                log('Error');
                            }
                        });
                    } else {
                        log('Switching hallway lights to night mode...');
                        request({
                            url: `http://${hue.ip}/api/${hue.auth}/groups/5/action`,
                            method: 'PUT',
                            form: JSON.stringify({
                                "hue": 0,
                                "sat": 254,
                                "on": true,
                                "bri": 0
                            })
                        }, function (err, httpResponse, body) {
                            if (err === null) {
                                log(body);
                                log('Switched hallway lights to night mode');
                                log('Switching off hallway lights in 30000ms');
                                timeoutHallway = setTimeout(function () {
                                    log('Switching off hallway lights...');
                                    request({
                                        url: `http://${hue.ip}/api/${hue.auth}/groups/5/action`,
                                        method: 'PUT',
                                        form: JSON.stringify({
                                            "on": false
                                        })
                                    }, function (err, httpResponse, body) {
                                        if (err === null) {
                                            log(body);
                                            log('Switched off hallway lights');
                                        } else {
                                            log('Error');
                                        }
                                    });
                                }, 30000);
                            } else {
                                log('Error');
                            }
                        });
                    }
                    break;
            }
        }
    });
});

function log(msg) {
    console.log(`${timestamp()} ${msg}`);
}

function timestamp() {
    var now = new moment();
    return `[${now.format('HH:mm:ss')}]`;
}