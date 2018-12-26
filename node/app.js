const request = require('request');
const moment = require('moment');
const fs = require('fs');

const ip = '192.168.0.83';
const username = '3EDLjI53lNqL14auInL0Xb7xd3Mg6inL4uc7oxTR';

var _timeout = 30000;

// test modes - eventually  be written into config file that Alexa can access
var _mode = {
	"halloween": false,
	"visitor": false,
	"film": false,
	"cooking": false,
	"bath": false
}

//TODO: bypass disabled devices, monitor again once enabled
//TODO: rewrite for one http request instead of individual ones
getHueJSON({
	"ip": ip,
	"username": username,
	"api": "sensors"
}, function(response){
	console.log(response);
});

function getHueJSON(options, callback) {
	// validation start
	if (typeof options.ip === 'undefined') {
		log('ip undefined', 'error');
		callback(false);
	}
	if (typeof options.username === 'undefined') {
		log('username undefined', 'error');
		callback(false);
	}
	if (typeof options.which !== 'undefined' && typeof options.api === 'undefined') {
		log('api undefined', 'error');
		callback(false);
	}
	// validation end
	var api;
	if (typeof options.api !== 'undefined') {
		switch (options.api) {
			case 'sensors':
				api = '/sensors';
				break;		
			default:
				log('unknown api', 'error');
				break;
		}
	}
	log(`Requesting JSON from ${ip}...`);
	request(`http://${options.ip}/api/${options.username}${api}`, function (err, res, json) {
		if (!err) {
			log('Request successful');
			callback(JSON.parse(json));
		} else {
			log(err, 'error');
			callback(false);
		}
	});
}
/*request('http://' + _ip + '/api/' + _username + '/sensors', function (err, res, objAllSensors) {
	if (!err) {
		log('Request successful');
		log('Checking for motion sensors...');
		objAllSensors = JSON.parse(objAllSensors);
		var objMotionSensors = {};
		for (var intSensor in objAllSensors) {
			if (objAllSensors[intSensor].productname === 'Hue motion sensor') {
				log(`Motion sensor found (${objAllSensors[intSensor].name})`);
				var objSensorState = {
					lastupdated: objAllSensors[intSensor].state.lastupdated,
					presence: objAllSensors[intSensor].state.presence
				};
				var objSensor = {
					state: objSensorState
				}
				objMotionSensors[intSensor] = objSensor;
				sensorCheck(intSensor, objMotionSensors);
			}
		}
		log('Monitoring motion sensors...');
	} else {
		log(err);
	}
});*/

function sensorCheck(intSensor, objMotionSensors) {
	setTimeout(function () {
		request('http://' + _ip + '/api/' + _username + '/sensors/' + intSensor, function (err, res, objThisSensor) {
			if (!err) {
				objThisSensor = JSON.parse(objThisSensor);
				/*if (objThisSensor.state.lastupdated === 'none' && objMotionSensors[intSensor].state.lastupdated !== 'none') {
					log(`Motion sensor disabled (${objMotionSensors[intSensor].name})`);
				} else if (objMotionSensors[intSensor].state.lastupdated === 'none' && objThisSensor.state.lastupdated !== 'none') {
					log(`Motion sensor enabled (${objMotionSensors[intSensor].name})`);
					continueSensorCheck();
				} else {
					continueSensorCheck();
				}*/
				continueSensorCheck();
				sensorCheck(intSensor, objMotionSensors);

				function continueSensorCheck() {
					if (moment(objThisSensor.state.lastupdated).isAfter(objMotionSensors[intSensor].state.lastupdated) &&
						objThisSensor.state.presence !== false) {
						objMotionSensors[intSensor].state.lastupdated = objThisSensor.state.lastupdated;
						log(`Motion detected (${objThisSensor.name}) @ ${objMotionSensors[intSensor].state.lastupdated}`);
					}
				}
			} else {
				log(err);
				sensorCheck(intSensor, objMotionSensors);
			}
		});
	}, _timeout);
}

function log(message, type) {
	if (typeof type === 'undefined') type = 'log';
	try {
		console[type](`${timestamp()} ${message}`);
	} catch (err) {
		console.error(err);
	}
}

function timestamp(nosecs) {
	var now = new Date();
	return '[' + pad(now.getHours(), 2) + ':' + pad(now.getMinutes(), 2) + ((nosecs === true) ? '' : ':' + pad(now.getSeconds(), 2)) + ']';
}

function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}