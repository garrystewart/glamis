$(function () {
    var ip = '192.168.0.83';
    var username = '3EDLjI53lNqL14auInL0Xb7xd3Mg6inL4uc7oxTR';
    var interval = 1000;
    var devMode = false;
    var intRequests = 0;
    var intThrottle;
    var blnRequestTrend;
    /*var opts = {
        percentColors: [
            [0.0, "#a9d70b"],
            [0.50, "#f9c802"],
            [1.0, "#ff0000"]
        ],
        staticLabels: {
            font: "10px sans-serif", // Specifies font
            labels: [100, 130, 150, 220.1, 260, 300], // Print labels at these values
            color: "#000000", // Optional: Label text color
            fractionDigits: 0 // Optional: Numerical precision. 0=round off.
        },
        angle: -0.2, // The span of the gauge arc
        lineWidth: 0.2, // The line thickness
        radiusScale: 1, // Relative radius
        pointer: {
            length: 0.6, // // Relative to gauge radius
            strokeWidth: 0.035, // The thickness
            color: '#000000' // Fill color
        },
        limitMax: false, // If false, max value increases automatically if value > maxValue
        limitMin: false, // If true, the min value of the gauge will be fixed
        colorStart: '#6FADCF', // Colors
        colorStop: '#8FC0DA', // just experiment with them
        strokeColor: '#E0E0E0', // to see which ones work best for you
        generateGradient: true,
        highDpiSupport: true, // High resolution support

    };
    var target_requests = document.getElementById('gauge_requests'); // your canvas element
    var gauge_requests = new Gauge(target_requests).setOptions(opts); // create sexy gauge!
    var target_throttle = document.getElementById('gauge_throttle'); // your canvas element
    var gauge_throttle = new Gauge(target_throttle).setOptions(opts); // create sexy gauge!
    gauge_requests.maxValue = 300; // set max gauge value
    gauge_throttle.maxValue = 300; // set max gauge value
    gauge_requests.setMinValue(0); // Prefer setter over gauge.minValue = 0
    gauge_throttle.setMinValue(0); // Prefer setter over gauge.minValue = 0
    gauge_requests.animationSpeed = 126; // set animation speed (32 is default value)
    gauge_throttle.animationSpeed = 126; // set animation speed (32 is default value)*/
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

                    var html = '';
                    html += '<tr>';
                    html += '<td><span class="mr-2" id="presence_' + sensor + '">' + returnFA_circle(sensorList[sensor].state.presence) + '</span><span id="name_' + sensor + '">' + sensorList[sensor].name + '</span></td>';
                    html += '<td id="lastupdated_' + sensor + '">' + timeElapsed(sensorList[sensor].state.lastupdated, 'minute') + '</td>';
                    html += '</tr>';
                    $('table tbody').append(html);
                    html = '';

                    timeout(sensor);
                }
            }
            intThrottle = Object.keys(objSensors).length;
            $('#throttleValue').val(intThrottle);
            console.log(timestamp() + ' Monitoring motion sensors...');
            if (devMode) console.log(objSensors);

            function timeout(sensor) {
                setTimeout(function () {
                    timeout(sensor);
                    //requestsUpdate(true);
                    $.ajax({
                        url: 'http://' + ip + '/api/' + username + '/sensors/' + sensor,
                        success: function (intervalSensor) {
                            //requestsUpdate();
                            if (devMode) console.log(intervalSensor);
                            if (moment(intervalSensor.state.lastupdated).isAfter(objSensors[sensor].state.lastupdated) &&
                                intervalSensor.state.presence !== false) {
                                console.log(timestamp() + ' Motion detected (' + intervalSensor.name + ')');
                                objSensors[sensor].state.lastupdated = intervalSensor.state.lastupdated;
                            }
                            $('#name_' + sensor).text(intervalSensor.name);
                            $('#presence_' + sensor).html(returnFA_circle(intervalSensor.state.presence));
                            $('#lastupdated_' + sensor).text(timeElapsed(sensorList[sensor].state.lastupdated, 'minute'));
                        },
                        error: function (err) {
                            //requestsUpdate();
                            console.error(timestamp() + ' Unable to request sensor');
                            console.error(timestamp() + err);
                        }
                    });
                //}, throttleValue(Object.keys(objSensors).length));
            }, 1000);
            }

            function requestsUpdate(add) {
                var intRunning = Number($('#running').text());
                if (add) {
                    intRunning++;
                    blnRequestTrend = true;
                } else {
                    intRunning--;
                    blnRequestTrend = false;
                }
                $('#running').text(intRunning);
                //gauge_requests.set(intRunning);
            }

            function throttleValue(concurrent) {
                console.log(typeof Number($('#running').text()));
                if (Number($('#running').text()) > concurrent) {
                    if (!blnRequestTrend) {
                        console.warn('Increasing web request throttle...');
                        intThrottle++;
                    }
                } else if (Number($('#running').text()) < concurrent) {
                    if (blnRequestTrend) {
                        console.log('Reducing web request throttle...');
                        intThrottle--;
                    }
                }
                $('#throttleValue').val(intThrottle);
                //gauge_throttle.set(intThrottle);
                return intThrottle;
            }
        },
        error: function (err) {
            console.error(timestamp() + ' Unable to request sensors');
            console.error(timestamp() + err);
        }
    });
});