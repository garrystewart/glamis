function ajaxFailAlert(jqxhr) {
	try {
		alert(JSON.parse(jqxhr.responseText).message);
	} catch (error) {
		alert(jqxhr.status + ' ' + jqxhr.statusText);
	}
}

function tdWrap(td, cls){
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