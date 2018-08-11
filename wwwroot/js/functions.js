function ajaxFailAlert(jqxhr) {
	console.log(jqxhr);
	alert(jqxhr.status + ' ' + jqxhr.statusText);
}