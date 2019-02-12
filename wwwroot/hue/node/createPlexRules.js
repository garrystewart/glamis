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

const strGroupName = 'Downstairs';
const strSensorName = 'Living room';

var intPlexSensor;
var intGroupSensor;
var intGroupSensorCompanion;
var intGroup;
var strScene_playing;
var strScene_credits;

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/sensors`,
    async: false,
}).done(function (response) {
    for (var sensor in response) {
        if (response[sensor].name === `${strSensorName} motion`) {
            intGroupSensor = sensor;
        }
        if (response[sensor].name === `MotionSensor ${intGroupSensor}.Companion`) {
            intGroupSensorCompanion = sensor;
        }
        if (response[sensor].name === 'plex') {
            intPlexSensor = sensor;
        }
    }
}).fail(function (err) {
    console.log(err.statusText);
});

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/groups`,
    async: false,
}).done(function (response) {
    for (var group in response) {
        if (response[group].name === strGroupName) {
            intGroup = group;
        }
    }
}).fail(function (err) {
    console.log(err.statusText);
});

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/scenes`,
    async: false,
}).done(function (response) {
    for (var scene in response) {
        if (response[scene].name === 'plex_playing') {
            strScene_playing = scene;
        }
        if (response[scene].name === 'plex_credits') {
            strScene_credits = scene;
        }
    }
}).fail(function (err) {
    console.log(err.statusText);
});

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/rules`,
    method: 'POST',
    async: false,
    data: JSON.stringify({
        "name": "plex stopped",
        "conditions": [{
            "address": `/sensors/${intPlexSensor}/state/status`,
            "operator": "eq",
            "value": "0"
        }],
        "actions": [{
            "address": `/sensors/${intGroupSensor}/config`,
            "method": "PUT",
            "body": {
                "on": true
            }
        }, {
            "address": `/sensors/${intGroupSensorCompanion}/state`,
            "method": "PUT",
            "body": {
                "status": 0
            }
        }]
    })
}).done(function (response) {
    console.log(response);
}).fail(function (err) {
    console.log(err.statusText);
});

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/rules`,
    method: 'POST',
    async: false,
    data: JSON.stringify({
        "name": "plex playing",
        "conditions": [{
            "address": `/sensors/${intPlexSensor}/state/status`,
            "operator": "eq",
            "value": "2"
        }],
        "actions": [{
            "address": `/sensors/${intGroupSensor}/config`,
            "method": "PUT",
            "body": {
                "on": false
            }
        }, {
            "address": `/groups/${intGroup}/action`,
            "method": "PUT",
            "body": {
                "scene": strScene_playing
            }
        }]
    })
}).done(function (response) {
    console.log(response);
}).fail(function (err) {
    console.log(err.statusText);
});

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/rules`,
    method: 'POST',
    async: false,
    data: JSON.stringify({
        "name": "plex paused",
        "conditions": [{
            "address": `/sensors/${intPlexSensor}/state/status`,
            "operator": "eq",
            "value": "3"
        }],
        "actions": [{
                "address": `/sensors/${intGroupSensor}/config`,
                "method": "PUT",
                "body": {
                    "on": true
                }
            },
            {
                "address": `/sensors/${intGroupSensorCompanion}/state`,
                "method": "PUT",
                "body": {
                    "status": 0
                }
            }
        ]
    })
}).done(function (response) {
    console.log(response);
}).fail(function (err) {
    console.log(err.statusText);
});

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/rules`,
    method: 'POST',
    async: false,
    data: JSON.stringify({
        "name": "plex credits",
        "conditions": [{
            "address": `/sensors/${intPlexSensor}/state/status`,
            "operator": "eq",
            "value": "4"
        }],
        "actions": [{
                "address": `/sensors/${intGroupSensor}/config`,
                "method": "PUT",
                "body": {
                    "on": true
                }
            },
            {
                "address": `/sensors/${intGroupSensorCompanion}/state`,
                "method": "PUT",
                "body": {
                    "status": 0
                }
            },
            {
                "address": `/groups/${intGroup}/action`,
                "method": "PUT",
                "body": {
                    "scene": strScene_credits
                }
            }
        ]
    })
}).done(function (response) {
    console.log(response);
}).fail(function (err) {
    console.log(err.statusText);
});