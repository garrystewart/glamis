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
const plexSensor = 100;
const hueGroup = 4;
const hueGroupSensor = 71;

$.ajax({
    url: `http://${jsonConfig.hue.hostname}/api/${jsonConfig.hue.auth}/rules`,
    method: 'POST',
    async: false,
    data: JSON.stringify({
        "name": "plex stopped",
        "conditions": [{
            "address": `/sensors/${plexSensor}/state/status`,
            "operator": "eq",
            "value": "0"
        }],
        "actions": [{
            "address": `/sensors/${hueGroupSensor}/config`,
            "method": "PUT",
            "body": {
                "on": "true"
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
        "name": "plex buffering",
        "conditions": [{
            "address": `/sensors/${plexSensor}/state/status`,
            "operator": "eq",
            "value": "1"
        }],
        "actions": [{
                "address": `/sensors/${hueGroupSensor}/config`,
                "method": "PUT",
                "body": {
                    "on": "false"
                }
            },
            {
                "address": `/groups/${hueGroup}/action`,
                "method": "PUT",
                "body": {
                    "on": true,
                    "bri": 144,
                    "hue": 8402,
                    "sat": 140
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
        "name": "plex playing",
        "conditions": [{
            "address": `/sensors/${plexSensor}/state/status`,
            "operator": "eq",
            "value": "2"
        }],
        "actions": [{
                "address": `/sensors/${hueGroupSensor}/config`,
                "method": "PUT",
                "body": {
                    "on": "false"
                }
            },
            {
                "address": `/groups/${hueGroup}/action`,
                "method": "PUT",
                "body": {
                    "on": true,
                    "bri": 1,
                    "hue": 8402,
                    "sat": 140
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
        "name": "plex paused",
        "conditions": [{
            "address": `/sensors/${plexSensor}/state/status`,
            "operator": "eq",
            "value": "1"
        }],
        "actions": [{
            "address": `/sensors/${hueGroupSensor}/config`,
            "method": "PUT",
            "body": {
                "on": "true"
            }
        }]
    })
}).done(function (response) {
    console.log(response);
}).fail(function (err) {
    console.log(err.statusText);
});