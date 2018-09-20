var username = 'DcpBX2e6CNpKvNmVNNAnpx2weGbyxiDa8ul49NKG';
var ip = '192.168.0.12';

var knownModels = {
    "LCT015": {
        "icon": "e27_waca",
        "ct": {
            "min": 153,
            "max": 500
        }
    },
    "LWB010": {
        "icon": "e27_white"
    },
    "RS 125": {
        "icon": "gu10"
    },
    "RS 128 T": {
        "icon": "gu10",
        "ct": {
            "min": 200,
            "max": 454
        }
    }
};

$.get('http://' + ip + '/api/' + username, function (data) {
    console.log(data);
    var html = '';
    for (var light in data.lights) {
        html += '<tr>';
        html += '<td class="light">' + light + '</td>';
        html += '<td>' + data.lights[light].manufacturername + '</td>';
        html += '<td>' + data.lights[light].productname + '</td>';
        html += '<td class="modelid">' + data.lights[light].modelid + '<img src="img/Product icons/Products outline/SVG/' + knownModels[data.lights[light].modelid].icon + '.svg"></td>';
        html += '<td class="name">' + data.lights[light].name + '</td>';
        html += '<td>' + data.lights[light].type + '</td>';
        html += '<td>' + data.lights[light].uniqueid + '</td>';
        html += '<td><button type="button" class="btn btn-primary on">' + data.lights[light].state.on + '</button></td>';
        html += '<td><input type="range" name="bri" min="0" max="254" value="' + data.lights[light].state.bri + '"><span class="bri">' + data.lights[light].state.bri + '</span></td>';
        if (typeof data.lights[light].state.hue !== 'undefined') {
            html += '<td><input type="range" name="hue" min="0" max="65535" value="' + data.lights[light].state.hue + '"><span class="hue">' + data.lights[light].state.hue + '</span></td>';
        } else {
            html += '<td></td>';
        }
        if (typeof data.lights[light].state.sat !== 'undefined') {
            html += '<td><input type="range" name="sat" min="0" max="254" value="' + data.lights[light].state.sat + '"><span class="sat">' + data.lights[light].state.sat + '</span></td>';
        } else {
            html += '<td></td>';
        }
        if (typeof data.lights[light].state.effect !== 'undefined') {
            html += '<td><button type="button" class="btn btn-primary effect">' + data.lights[light].state.effect + '</button></td>';
        } else {
            html += '<td></td>';
        }
        if (typeof data.lights[light].state.cy !== 'undefined') {
            html += '<td class="xy">' + data.lights[light].state.xy + '</td>';
        } else {
            html += '<td></td>';
        }
        if (typeof data.lights[light].state.ct !== 'undefined') {
            var min = 153;
            var max = 500;
            if (typeof knownModels[data.lights[light].modelid].ct !== 'undefined') {
                min = knownModels[data.lights[light].modelid].ct.min;
                max = knownModels[data.lights[light].modelid].ct.max;
            }
            html += '<td><input type="range" name="ct" min="' + min + '" max="' + max + '" value="' + data.lights[light].state.ct + '"><span class="ct">' + data.lights[light].state.ct + '</span></td>';
        } else {
            html += '<td></td>';
        }
        html += '<td>';
        html += '<select class="alert form-control">';
        if (data.lights[light].state.alert === 'none') {
            html += '<option value="none" selected>none</option>';
        } else {
            html += '<option value="none">none</option>';
        }
        if (data.lights[light].state.alert === 'select') {
            html += '<option value="select" selected>select</option>';
        } else {
            html += '<option value="select">select</option>';
        }
        if (data.lights[light].state.alert === 'lselect') {
            html += '<option value="lselect" selected>lselect</option>';
        } else {
            html += '<option value="lselect">lselect</option>';
        }
        html += '</select>';
        html += '</td>';
        if (typeof data.lights[light].state.colormode !== 'undefined') {
            html += '<td>' + data.lights[light].state.colormode + '</td>';
        } else {
            html += '<td></td>';
        }
        html += '<td>' + data.lights[light].state.mode + '</td>';
        html += '<td>' + data.lights[light].state.reachable + '</td>';
        html += '<td>' + data.lights[light].swupdate.state + '</td>';
        html += '<td>' + data.lights[light].swupdate.lastinstall + '</td>';
        html += '<td>' + data.lights[light].swversion + '</td>';
        html += '<td>' + data.lights[light].config.archetype + '</td>';
        html += '<td>' + data.lights[light].config.function+'</td>';
        html += '<td>' + data.lights[light].config.direction + '</td>';
        html += '<td>' + data.lights[light].capabilities.certified + '</td>';
        html += '</tr>';
    }
    $('#tblLights tbody').append(html);
    html = '';
}).fail(function () {
    alert('error');
});

$('tbody').on('click', '.name', function () {
    var name = prompt('name', $(this).text());
    var light = $(this).siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light,
        method: 'put',
        data: JSON.stringify({
            "name": name
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).text(data[0].success['/lights/' + light + '/name']);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('click', '.on', function () {
    var on;
    if ($(this).text() === 'false') {
        on = true;
    } else if ($(this).text() === 'true') {
        on = false;
    }
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "on": on
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).text(data[0].success['/lights/' + light + '/state/on']);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('unable to get data');
        }
    });
});

$('tbody').on('input', '[name="bri"]', function () {
    var bri = $(this).val();
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "bri": Number(bri)
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).siblings('span.bri').text(data[0].success['/lights/' + light + '/state/bri']);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('click', '.bri', function () {
    var bri = prompt('bri', $(this).text());
    if (bri < 0 || bri > 254) {
        alert('bri must be between 0 and 254');
        return false;
    }
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "bri": Number(bri)
        }),
        success: function (data) {
            if (data[0].success) {
                var returnVal = data[0].success['/lights/' + light + '/state/bri'];
                $(thisItem).text(returnVal);
                $(thisItem).siblings('input').val(returnVal);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('input', '[name="hue"]', function () {
    var hue = $(this).val();
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "hue": Number(hue)
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).siblings('span.hue').text(data[0].success['/lights/' + light + '/state/hue']);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('click', '.hue', function () {
    var hue = prompt('hue', $(this).text());
    if (hue < 0 || hue > 65535) {
        alert('hue must be between 0 and 65535');
        return false;
    }
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "hue": Number(hue)
        }),
        success: function (data) {
            if (data[0].success) {
                var returnVal = data[0].success['/lights/' + light + '/state/hue'];
                $(thisItem).text(returnVal);
                $(thisItem).siblings('input').val(returnVal);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('input', '[name="sat"]', function () {
    var sat = $(this).val();
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "sat": Number(sat)
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).siblings('span.sat').text(data[0].success['/lights/' + light + '/state/sat']);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('click', '.sat', function () {
    var sat = prompt('sat', $(this).text());
    if (sat < 0 || sat > 254) {
        alert('sat must be between 0 and 254');
        return false;
    }
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "sat": Number(sat)
        }),
        success: function (data) {
            if (data[0].success) {
                var returnVal = data[0].success['/lights/' + light + '/state/sat'];
                $(thisItem).text(returnVal);
                $(thisItem).siblings('input').val(returnVal);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('click', '.effect', function () {
    var effect;
    if ($(this).text() === 'none') {
        effect = 'colorloop';
    } else if ($(this).text() === 'colorloop') {
        effect = 'none';
    }
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "effect": effect
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).text(data[0].success['/lights/' + light + '/state/effect']);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('input', '[name="ct"]', function () {
    var ct = $(this).val();
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "ct": Number(ct)
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).siblings('span.ct').text(data[0].success['/lights/' + light + '/state/ct']);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('click', '.ct', function () {
    var ct = prompt('ct', $(this).text());
    var modelid = $(this).parent().siblings('.modelid').text();
    var min = 153;
    var max = 500;
    if (typeof knownModels[modelid].ct !== 'undefined') {
        min = knownModels[modelid].ct.min;
        max = knownModels[modelid].ct.max;
    }
    if (ct < min || ct > max) {
        alert('ct must be between ' + min + ' and ' + max);
        return false;
    }
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "ct": Number(ct)
        }),
        success: function (data) {
            if (data[0].success) {
                var returnVal = data[0].success['/lights/' + light + '/state/ct'];
                $(thisItem).text(returnVal);
                $(thisItem).siblings('input').val(returnVal);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});

$('tbody').on('change', '.alert', function () {
    var alert = $(this).val();
    var light = $(this).parent().siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "alert": alert
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).val(data[0].success['/lights/' + light + '/state/alert']);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});