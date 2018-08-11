function ajaxFailAlert(jqxhr) {
	try {
		alert(JSON.parse(jqxhr.responseText).message);
	} catch (error) {
		alert(jqxhr.status + ' ' + jqxhr.statusText);
	}
}