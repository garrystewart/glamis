function ajaxFailAlert(jqxhr){
	jqxhr = JSON.parse(jqxhr.responseText);
	console.warn(jqxhr.message);
	alert(jqxhr.message);
}