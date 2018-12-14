$(function () {
    var ip = '192.168.0.83';
    var username = '3EDLjI53lNqL14auInL0Xb7xd3Mg6inL4uc7oxTR';
    var interval = 1000;
    var devMode = false;
    console.log(timestamp() + ' Requesting sensors from Philips Hue Bridge...');
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/sensors',
        success: function (sensorList) {
            console.log(timestamp() + ' Sensors received');
            if (devMode) console.log(sensorList);
            console.log(timestamp() + ' Checking for motion sensors...');
            var objSensors = {};
            for (var sensor in sensorList) {
                if (sensorList[sensor].productname === 'Hue motion sensor') {
                    console.log(timestamp() + ' Motion sensor found (' + sensorList[sensor].name + ')');
                    var objState = {
                        lastupdated: sensorList[sensor].state.lastupdated,
                        presence: sensorList[sensor].state.presence
                    };
                    var objSensor = {
                        state: objState
                    }
                    objSensors[sensor] = objSensor;
                    setInterval(function (sensor) {
                        $.ajax({
                            url: 'http://' + ip + '/api/' + username + '/sensors/' + sensor,
                            success: function (intervalSensor) {
                                if (devMode) console.log(intervalSensor);
                                if (moment(intervalSensor.state.lastupdated).isAfter(objSensors[sensor].state.lastupdated) &&
                                    intervalSensor.state.presence !== false) {
                                    console.log(timestamp() + ' Motion detected (' + intervalSensor.name + ')');
                                    objSensors[sensor].state.lastupdated = intervalSensor.state.lastupdated;
                                }
                            },
                            error: function (err) {
                                console.error(timestamp() + ' Unable to request sensor');
                                console.error(timestamp() + err);
                            }
                        });
                    }, interval, sensor);
                }
            }
            console.log(timestamp() + ' Monitoring motion sensors...');
            if (devMode) console.log(objSensors);
        },
        error: function (err) {
            console.error(timestamp() + ' Unable to request sensors');
            console.error(timestamp() + err);
        }
    });
});