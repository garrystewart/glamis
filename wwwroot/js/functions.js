function ajaxFailAlert(jqxhr) {
	try {
		alert(JSON.parse(jqxhr.responseText).message);
	} catch (error) {
		alert(jqxhr.status + ' ' + jqxhr.statusText);
	}
}

function tdWrap(td, cls) {
	var open;
	if (typeof cls !== 'undefined') {
		open = '<td class="' + cls + '">';
	} else {
		open = '<td>';
	}
	if (typeof td === 'undefined') {
		return open + '</td>';
	} else {
		return open + td + '</td>';
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

function returnFA_circle(state){
	return (state) ? '<i class="fas fa-circle"></i>' : '<i class="far fa-circle"></i>';
}

function timeElapsed(iso, unit){
	var now = moment();
	iso = moment(iso);
	return moment.duration(-Math.abs(now.diff(iso, unit)), unit).humanize(true);
}

function log(message) {
	console.log(`${timestamp()} message`);
}