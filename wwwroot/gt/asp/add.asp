<%@ Language= "Javascript" %> 
<script language="javascript" runat="server" src="../../js/server/json2.js"></script>
<script language="javascript" runat="server" src="../../js/server/functions.js"></script>
<script language="javascript" runat="server">
    var data = Request.Form('data');
    writeJSON(data, '/gt/data/cars.json');
</script>