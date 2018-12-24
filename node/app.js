const request = require('request');
const moment = require('moment');
const fs = require('fs');

const _ip = '192.168.0.83';
const _username = '3EDLjI53lNqL14auInL0Xb7xd3Mg6inL4uc7oxTR';

var _timeout = 1000;

log(`Requesting all sensors from ${_ip}...`);
request('http://' + _ip + '/api/' + _username + '/sensors', function (err, res, objAllSensors) {
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
});

function sensorCheck(intSensor, objMotionSensors) {
	setTimeout(function () {
		request('http://' + _ip + '/api/' + _username + '/sensors/' + intSensor, function (err, res, objThisSensor) {
			if (!err) {
				objThisSensor = JSON.parse(objThisSensor);
				if (moment(objThisSensor.state.lastupdated).isAfter(objMotionSensors[intSensor].state.lastupdated) &&
				objThisSensor.state.presence !== false) {
					log(`Motion detected (${objThisSensor.name})`);
					objMotionSensors[intSensor].state.lastupdated = objThisSensor.state.lastupdated;
				}
				sensorCheck(intSensor, objMotionSensors);
			} else {
				log(err);
				sensorCheck(intSensor, objMotionSensors);
			}
		});
	}, _timeout);
}

function log(message) {
	console.log(`${timestamp()} ${message}`);
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