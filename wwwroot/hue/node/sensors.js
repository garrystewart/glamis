const request = require('request');
const moment = require('moment');
const hue = {
    "ip": "192.168.0.83",
    "auth": "3EDLjI53lNqL14auInL0Xb7xd3Mg6inL4uc7oxTR"
}
const motionTimeout = 1000;
const temperatureTimeout = 300000;
console.log('Getting sensors...');
request(`http://${hue.ip}/api/${hue.auth}/sensors`, function (err, httpResponse, jsonSensors) {
    console.log('Got sensors');
    console.log('Initialising...');
    jsonSensors = JSON.parse(jsonSensors);
    var jsonMotionSensors = {};
    var arrTemperatureSensors = [];
    var jsonTemperatureSensors = {};
    for (var sensor in jsonSensors) {
        switch (jsonSensors[sensor].productname) {
            case 'Hue motion sensor':
                console.log(`Found motion sensor (${jsonSensors[sensor].name})`);
                var jsonState = {
                    "state": {
                        "lastupdated": jsonSensors[sensor].state.lastupdated
                    }
                }
                jsonMotionSensors[sensor] = jsonState;
                jsonMotionSensors[sensor].name = jsonSensors[sensor].name;
                break;
            case 'Hue temperature sensor':
                console.log(`Found temperature sensor (${jsonSensors[sensor].name})`);
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
    console.log('Initialised');
    checkTemperatureSensors();
    checkMotionSensors();

    function checkTemperatureSensors() {
        setTimeout(function () {
            console.log('Checking temperature sensors...');
            console.log('Getting sensors...');
            request(`http://${hue.ip}/api/${hue.auth}/sensors`, function (err, httpResponse, jsonSensors) {
                console.log('Got sensors');
                jsonSensors = JSON.parse(jsonSensors);
                for (var sensor in jsonTemperatureSensors) {
                    if (jsonSensors[sensor].state.temperature < jsonTemperatureSensors[sensor].state.temperature.min) {
                        jsonTemperatureSensors[sensor].state.temperature.min = jsonSensors[sensor].state.temperature;
                    }
                    if (jsonSensors[sensor].state.temperature > jsonTemperatureSensors[sensor].state.temperature.max) {
                        jsonTemperatureSensors[sensor].state.temperature.max = jsonSensors[sensor].state.temperature;
                    }
                    console.log(`${jsonSensors[sensor].name.replace(' Temp', '')} ${jsonSensors[sensor].state.temperature / 100}C (min: ${jsonTemperatureSensors[sensor].state.temperature.min / 100}C, max: ${jsonTemperatureSensors[sensor].state.temperature.max / 100}C)`);
                }
                console.log('Checked temperature sensors');
                console.log(`Checking temperature sensors in ${temperatureTimeout}ms`);
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

    function motionDetected(sensor) {
        console.log(`Motion detected (${jsonMotionSensors[sensor].name})`);
        var now = new moment();
        switch (sensor) {
            case '46': // bedroom                
                var time1 = new moment(`${now.format('YYYY-MM-DD')}T07:00:00`);
                var time2 = new moment(`${now.format('YYYY-MM-DD')}T22:00:00`);
                if (now.isBetween(time1, time2, 'hours')) {
                    console.log('Switching bedroom light to day mode...');
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
                        console.log('Switched bedroom light to day mode');
                        console.log('Switching off bedroom light in 900000ms');
                        timeoutBedroom = setTimeout(function () {
                            console.log('Switching off bedroom light...');
                            request({
                                url: `http://${hue.ip}/api/${hue.auth}/lights/12/state`,
                                method: 'PUT',
                                form: JSON.stringify({
                                    "on": false
                                })
                            }, function (err, httpResponse, body) {
                                console.log('Switched off bedroom light');
                            });
                        }, 900000);
                    });
                } else {
                    console.log('Switching bedroom light to night mode...');
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
                        console.log('Switched bedroom light to night mode');
                        console.log('Switching off bedroom light in 30000ms');
                        timeoutBedroom = setTimeout(function () {
                            console.log('Switching off bedroom light...');
                            request({
                                url: `http://${hue.ip}/api/${hue.auth}/lights/12/state`,
                                method: 'PUT',
                                form: JSON.stringify({
                                    "on": false
                                })
                            }, function (err, httpResponse, body) {
                                console.log('Switched off bedroom light');
                            });
                        }, 30000);
                    });
                }
                break;
        }
    }
});