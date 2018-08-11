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
            for (var model in cars[form.make]) {
                if (model.toLowerCase() === form.model.toLowerCase()) {
                    if (model.toLowerCase() === form.model.toLowerCase()) {
                        httpResponse(400, 'model already added');
                    }
                }
            }
            cars[form.make][form.model] = {};
            openTextFile(path, JSON.stringify(cars));
        } else {
            httpResponse(400, 'no makes found');
        }
    </script>