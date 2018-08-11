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
                    makeFound = true;
                }
                for (var model in cars[make]) {
                    if (makeFound && model.toLowerCase() === form.model.toLowerCase()) {
                        httpResponse(400, 'car already added');
                    }
                }
            }
            if (!makeFound) {
                cars[form.make] = {};
            }
            cars[form.make][form.model] = {};
            openTextFile(path, JSON.stringify(cars));
        } else {
            var cars = {};
            cars[form.make] = {};
            cars[form.make][form.model] = {};
            createTextFile(path, JSON.stringify(cars));
        }
    </script>