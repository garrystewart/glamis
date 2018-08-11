<%@ Language= "Javascript" %>
    <script language="javascript" runat="server" src="../../js/server/json2.js"></script>
    <script language="javascript" runat="server" src="../../js/server/functions.js"></script>
    <script language="javascript" runat="server" src="../../js/server/prototypes.js"></script>
    <script language="javascript" runat="server" src="../../js/prototypes.js"></script>
    <script language="javascript" runat="server">
        var form = JSON.parse(Request.Form('data').item());
        var path = '/gt/data/cars.json';
        if (fileExists(path)) {
            var cars = JSON.parse(openTextFile(path));
            var makeFound = false;
            for (var make in cars) {
                if (make.toLowerCase() === form.make.toLowerCase()) {
                    httpResponse(400, 'make already added');
                }
            }
            cars[form.make] = {};
            openTextFile(path, JSON.stringify(cars));
        } else {
            var cars = {};
            cars[form.make] = {};
            createTextFile(path, JSON.stringify(cars));
        }
    </script>