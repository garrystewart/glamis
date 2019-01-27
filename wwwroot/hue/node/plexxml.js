const request = require('request');
const jsdom = require('jsdom');
const plex = {
    "host": "plex.glamis.casa",
    "auth": "519pREE6zNyxCqVoxiDb",
    "machineIdentifier": "knr89e14lyk4g4n6tvo3xqfo",
}
request({
    url: `http://${plex.host}/status/sessions`,
    method: 'GET',
    qs: {
        "X-Plex-Token": plex.auth
    },
}, function (err, httpResponse, xml) {
    console.log(xml);
});