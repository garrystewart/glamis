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
            for (var make in cars) {
                if (make.toLowerCase() === form.make.toLowerCase() && Object.keys(cars[make]).toString().toLowerCase() ===
                    form.model.toLowerCase()) {
                    httpResponse(400, 'car already added');
                }
            }
            cars[form.make] = {};
            cars[form.make][form.model] = {};
            openTextFile(path, JSON.stringify(cars));
        } else {
            var cars = {};
            cars[form.make] = {};
            cars[form.make][form.model] = {};
            createTextFile(path, JSON.stringify(cars));
        }
    </script>