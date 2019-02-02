const request = require('request');
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
const plex = {
    "host": "plex.glamis.casa",
    "auth": "519pREE6zNyxCqVoxiDb",
    "machineIdentifier": "knr89e14lyk4g4n6tvo3xqfo",
}
/*request({
    url: `http://${plex.host}/status/sessions`,
    method: 'GET',
    qs: {
        "X-Plex-Token": plex.auth
    },
}, function (err, httpResponse, xml) {
    //console.log(xml);
    console.log($(xml).attr('size'));
    $(xml).children().each(function(index, child){
        console.log($(child).attr('size'));
    });
    $(xml).find('Player').each(function(index, player){
        console.log($(player));
        console.log($(player).attr('state'));
    });
});*/


$.ajax({
    url: `http://${plex.host}/status/sessions?X-Plex-Token=${plex.auth}`,
    dataType: 'text',
    success: function(data){
        console.log(data);
    },
    error: function(){
        console.log('fail');
    }
});