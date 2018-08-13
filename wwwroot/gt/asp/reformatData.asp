<%@ Language= "Javascript" %>
    <script language="javascript" runat="server" src="../../js/server/json2.js"></script>
    <script language="javascript" runat="server" src="../../js/server/functions.js"></script>
    <script language="javascript" runat="server" src="../../js/server/prototypes.js"></script>
    <script language="javascript" runat="server" src="../../js/prototypes.js"></script>
    <script language="javascript" runat="server">
        var path = '/gt/data/cars.json';
        var cars = JSON.parse(openTextFile(path));
        for (var i = 0; i < cars.length; i++) {
            var obj = {
                "country": "",
                "manufacturer": "",
                "model": "",
                "year": "",
                "components": {
                    "engine": {
                        "displacement": "",
                        "maxPower": {
                            "bhp": "",
                            "rpm": ""
                        },
                        "maxTorque": {
                            "kgfm": "",
                            "rpm": ""
                        }
                    },
                    "drivetrain": ""
                },
                "measurements": {
                    "dimensions": {
                        "length": "",
                        "width": "",
                        "height": ""
                    },
                    "weight": ""
                },
                "gt": {
                    "category": "",
                    "stats": {
                        "maxSpeed": "",
                        "acceleration": "",
                        "braking": "",
                        "cornering": "",
                        "stability": ""
                    }
                }
            }
            obj.country = cars[i].country;
            obj.manufacturer = cars[i].manufacturer;
            obj.model = cars[i].model;
            obj.year = cars[i].year;

            obj.components.engine.displacement = cars[i].displacement;
            obj.components.engine.maxPower.bhp = cars[i].maxPower.bhp;
            obj.components.engine.maxPower.rpm = cars[i].maxPower.rpm;
            obj.components.engine.maxTorque.kgfm = cars[i].maxTorque.kgfm;
            obj.components.engine.maxTorque.rpm = cars[i].maxTorque.rpm;
            obj.components.drivetrain = cars[i].drivetrain;

            obj.measurements.dimensions.length = cars[i].length;
            obj.measurements.dimensions.width = cars[i].width;
            obj.measurements.dimensions.height = cars[i].height;
            obj.measurements.weight = cars[i].weight;

            obj.gt.category = cars[i].category;
            obj.gt.stats.maxSpeed = cars[i].maxSpeed;
            obj.gt.stats.acceleration = cars[i].acceleration;
            obj.gt.stats.braking = cars[i].braking;
            obj.gt.stats.cornering = cars[i].cornering;
            obj.gt.stats.stability = cars[i].stability;

            cars[i] = obj;
        }
        openTextFile(path, JSON.stringify(cars));
    </script>