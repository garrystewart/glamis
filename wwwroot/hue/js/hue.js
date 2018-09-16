var username = 'DcpBX2e6CNpKvNmVNNAnpx2weGbyxiDa8ul49NKG';
var ip = '192.168.0.12';

$.get('http://' + ip + '/api/' + username, function (data) {
    console.log(data);
    var html = '';
    for (var light in data.lights) {
        html += '<tr>';
        html += '<td class="light">' + light + '</td>';
        html += '<td class="name">' + data.lights[light].manufacturername + '</td>';
        html += '<td class="name">' + data.lights[light].productname + '</td>';
        html += '<td class="name">' + data.lights[light].modelid + '<img src="img/Product icons/Products outline/SVG/' + icons[data.lights[light].modelid] + '.svg"></td>';
        html += '<td class="name">' + data.lights[light].name + '</td>';
        html += '<td>' + data.lights[light].type + '</td>';
        html += '<td>' + data.lights[light].uniqueid + '</td>';
        html += '<td class="on">' + data.lights[light].state.on + '</td>';
        html += '<td><input type="range" name="bri" min="1" max="254" value="' + data.lights[light].state.bri + '"><span class="bri">' + data.lights[light].state.bri + '</span></td>';
        if (data.lights[light].state.hue) {
            html += '<td><input type="range" name="hue" min="0" max="65535" value="' + data.lights[light].state.hue + '"><span class="hue">' + data.lights[light].state.hue + '</span></td>';
        } else {
            html += '<td></td>';
        }
        if (data.lights[light].state.sat) {
            html += '<td><input type="range" name="sat" min="0" max="254" value="' + data.lights[light].state.sat + '"><span class="sat">' + data.lights[light].state.sat + '</span></td>';
        } else {
            html += '<td></td>';
        }        
        html += '<td class="effect">' + data.lights[light].state.effect + '</td>';
        html += '<td class="xy">' + data.lights[light].state.xy + '</td>';
        html += '<td class="ct">' + data.lights[light].state.ct + '</td>';
        html += '<td class="alert">' + data.lights[light].state.alert + '</td>';
        html += '<td>' + data.lights[light].state.colormode + '</td>';
        html += '<td>' + data.lights[light].state.mode + '</td>';
        html += '<td>' + data.lights[light].state.reachable + '</td>';
        html += '<td>' + data.lights[light].swupdate.state + '</td>';
        html += '<td>' + data.lights[light].swupdate.lastinstall + '</td>';
        html += '<td>' + data.lights[light].swversion + '</td>';
        html += '<td>' + data.lights[light].config.archetype + '</td>';
        html += '<td>' + data.lights[light].config.function + '</td>';
        html += '<td>' + data.lights[light].config.direction + '</td>';
        html += '</tr>';
    }
    $('#tblLights tbody').append(html);
    html = '';
}).fail(function () {
    alert('error');
});

var icons = {
    "LCT015": "e27_waca",
    "LWB010": "e27_white",
    "RS 125": "gu10",
    "RS 128 T": "gu10"
}

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
    } else {
        alert('invalid');
        return false;
    }
    var light = $(this).siblings('.light').text();
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
    console.log(bri);
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
    if (bri < 1 || bri > 254) {
        alert('bri must be between 1 and 254');
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
    console.log(hue);
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
    console.log(sat);
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

$('tbody').on('click', '.alert', function () {
    var alert = prompt('alert', $(this).text());
    var light = $(this).siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "alert": alert
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).text(data[0].success['/lights/' + light + '/state/alert']);
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
    var effect = prompt('effect', $(this).text());
    var light = $(this).siblings('.light').text();
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

$('tbody').on('click', '.ct', function () {
    var ct = prompt('ct', $(this).text());
    if (ct < 153 || ct > 500) {
        alert('ct must be between 153 and 500');
        return false;
    }
    var light = $(this).siblings('.light').text();
    var thisItem = this;
    $.ajax({
        url: 'http://' + ip + '/api/' + username + '/lights/' + light + '/state',
        method: 'put',
        data: JSON.stringify({
            "ct": Number(ct)
        }),
        success: function (data) {
            if (data[0].success) {
                $(thisItem).text(data[0].success['/lights/' + light + '/state/ct']);
            } else {
                alert(data[0].error.description);
            }
        },
        error: function () {
            alert('error');
        }
    });
});