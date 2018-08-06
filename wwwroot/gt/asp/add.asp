<%@ Language= "Javascript" %> 
<script language="javascript" runat="server" src="../../js/server/json2.js"></script>
<script language="javascript" runat="server" src="../../js/server/functions.js"></script>
<script language="javascript" runat="server" src="../../js/prototypes.js"></script>
<script language="javascript" runat="server">
    var data = Request.Form('data');
    var path = '/gt/data/cars.json';
    if (fileExists(path)) {
        var cars_json = openTextFile(path);
        for (var car in cars_json){
            if (cars_json[car].make === data.make && cars_json[car].model === data.model){
                httpResponse(400, 'car already added');
            }
        }
        cars_json[data.make].model = data.model;
        openTextFile(path, cars_json);
    } else {
        createTextFile(path, data);
    }
</script>