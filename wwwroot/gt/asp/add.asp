<%@ Language= "Javascript" %> 
<script language="javascript" runat="server" src="../../js/server/json2.js"></script>
<script language="javascript" runat="server" src="../../js/server/functions.js"></script>
<script language="javascript" runat="server" src="../../js/prototypes.js"></script>
<script language="javascript" runat="server">
    var data = Request.Form('data');
    Response.Write(createTextFile('data blah', '/gt/data/blah/moreblah/yay/cars.json'));
    //writeJSON(data, '/gt/data/cars.json');
</script>