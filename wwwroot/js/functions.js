function ajaxFailAlert(jqxhr){
	console.log(jqxhr);
	if (jqxhr.status === 500) {
		alert(jqxhr.status + ' ' + jqxhr.statusText);	
	} else {
		jqxhr = JSON.parse(jqxhr.responseText);
	}
}