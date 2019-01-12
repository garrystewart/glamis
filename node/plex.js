const request = require('request');
const convert = require('xml-js');
const plex = {
    "host": "plex.glamis.casa",
    "auth": "519pREE6zNyxCqVoxiDb",
    "port": 32400,
    "timeout": 10000,
    "machine": "knr89e14lyk4g4n6tvo3xqfo"
}
const hue = {
    "ip": "192.168.0.83",
    "auth": "3EDLjI53lNqL14auInL0Xb7xd3Mg6inL4uc7oxTR"
}
timeout();
function timeout(){
    setTimeout(function(){
        request(`http://${plex.host}:${plex.port}/status/sessions?X-Plex-Token=${plex.auth}`, function (err, res, xml) {
            if (!err) {
                var json = convert.xml2json(xml);
                console.log(JSON.stringify(json));
                /*for (var key in json){
console.log(key);
                }*/
                //console.log(JSON.stringify(xml));
                /*var $ = cheerio.load(xml);
                if ($('MediaContainer').children().length) {
                    $('MediaContainer').find('Player').each(function(index, player){
                        var newish = cheerio.load($(player));
                        console.log($(newish))
                        console.log($(this).attr('machineIdentifier'));
                        console.log(plex.machine);
                        if ($(this).attr('machineIdentifier') === plex.machine) {
                            switch ($(this).attr('state')) {
                                case 'playing':
                                    console.log('playing');
                                    break;
                                case 'paused':
                                    console.log('paused');
                                default:
                                    console.error('switch error');
                                    break;
                            }
                        } else {
                            return false;
                        }
                    });
                } else {
                    console.log('no video playing');
                }*/
                //console.log(xml);
                timeout();
            } else {
                console.log(err);
                timeout();
            }
        });
    }, plex.timeout);
}