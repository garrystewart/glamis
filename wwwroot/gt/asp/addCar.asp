<%@ Language= "Javascript" %>
    <script language="javascript" runat="server" src="../../js/server/json2.js"></script>
    <script language="javascript" runat="server" src="../../js/server/functions.js"></script>
    <script language="javascript" runat="server" src="../../js/server/prototypes.js"></script>
    <script language="javascript" runat="server" src="../../js/prototypes.js"></script>
    <script language="javascript" runat="server">
        var data = JSON.parse(Request.Form('data'));
        var path = '/gt/data/cars.json';
        var cars = JSON.parse(openTextFile(path));
        cars.push(data);
        openTextFile(path, JSON.stringify(cars));
    </script>