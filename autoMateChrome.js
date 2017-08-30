module.exports = function(RED) {
    var http = require("http");




    ////////////////////////////////////////////////////////////////////////////////

    ///////////////              chrome Driver status                       ///////////////

    ////////////////////////////////////////////////////////////////////////////////


    function chromeDriver_Statusx(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var host = config.host;
        var port = config.port;

        node.on('input', function(msg) {
            //msg.payload = msg.payload.toLowerCase();
            var app = {}
            app.host = host;
            app.port = 9515;
            app.path = '/status';
            app.headers = {
                'Content-Type': 'application/json'
            };
            var msg = msg;
            console.log("Msg : >>>>>>  : " + JSON.stringify(msg.payload));

            http.get(app, function(response) {
                response.setEncoding('utf8');
                console.log("Status code: >>>>>>  : " + response.statusCode);
                if (response.statusCode == 200) {
                    response.on('data', function(body) {
                        var datax = msg;
                        //console.log("Msg : >>>>>>  : " + JSON.stringify(msg));
                        //console.log("Msg : >>>>>>  : " + JSON.stringify(datax));
                        msg.payload = body;
                        node.send(msg);
                        node.status({ fill: "green", shape: "dot", text: "Connected" });
                    });
                } else {
                    response.on('data', function(body) {

                        //console.log("Msg : >>>>>>  : " + JSON.stringify(msg));
                        //console.log("Msg : >>>>>>  : " + JSON.stringify(datax));
                        msg.payload = body;
                        node.send(msg);
                        node.status({ fill: "red", shape: "ring", text: "Error: " + response.statusCode });
                    });
                }

            }).on('error', function(error) {
                node.status({ fill: "red", shape: "ring", text: "Disconnected" });
                node.send(error);
            });
        });
    }
    RED.nodes.registerType("chromeDriverStatusx", chromeDriver_Statusx);




    ////////////////////////////////////////////////////////////////////////////////

    ///////////////              Server configuration                ///////////////

    ////////////////////////////////////////////////////////////////////////////////



    function Chrome_Config(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var host = config.host;
        var port = config.port;
        var path = '/session/';
        var platformName = config.platformName;
        var OSversion = config.OSversion;
        var DeviceName = config.DeviceName;
        var FolderLocation = config.FolderLocation;
        var AppName = config.AppName;
        var flowContext = this.context().flow;
        flowContext.set('host', config.host);
        flowContext.set('port', config.port);
        node.on('input', function(msg) {
            msg.sessionId = "";
            //msg.payload = msg.payload.toLowerCase();
            var dCap = undefined;
            var dCap = '{"desiredCapabilities":{"browserName":"electron","chromeOptions":{"binary":"/Users/stephen/node_modules/spectron/lib/launcher.js","args":["spectron-path=/Applications/Pager_Console_X.app/Contents/MacOS/Pager_Console_X"]},"loggingPrefs":{"browser":"ALL","driver":"ALL"}}}';
            console.log("Device capabilities are: " + dCap);

            var options = {};
            options.hostname = host;
            options.port = '9515';
            options.path = '/session';
            options.method = 'POST';
            options.headers = {
                'Content-Type': 'application/json',
                'Content-Length': dCap.length
            };

            console.log("http options set to:  >>>>>>>>>>>>>>>>>>>>>>" + JSON.stringify(options));

            var req = http.request(options, function(response) {
                console.log('Status: ' + response.statusCode);
                console.log('Headers: ' + JSON.stringify(response.headers));
                response.setEncoding('utf8');
                if (response.statusCode == 200) {
                    response.on('data', function(body) {
                        console.log('Body: ' + body);
                        var sessionX = JSON.parse(body);
                        var sessionId = sessionX.sessionId;
                        console.log("SessionID set to:  >>>>>>>>>>>>>>>>>>>>>>" + sessionId);
                        flowContext.set('sessionId', sessionId);
                        node.send(sessionId);
                        node.status({
                            fill: "green",
                            shape: "dot",
                            text: "connected"
                        });
                    });
                } else {
                    response.on('data', function(body) {
                        console.log("Returned body : >>>>>   " + body);
                        var msgError = JSON.parse(body)

                        console.log("Returned body : >>>>>   " + JSON.stringify(msgError.value));
                        node.send("Error Message: " + msgError.value.message);
                        node.status({ fill: "red", shape: "ring", text: "Error: " + response.statusCode });
                    });
                }
            });
            req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
                node.send(e.message);
                node.status({
                    fill: "red",
                    shape: "ring",
                    text: "disconnected"
                });
            });
            // write data to request body
            req.write(dCap);
            req.end();

        });
        node.on('close', function() {
            // tidy up any state
            console.log("Done");
        });

    }
    RED.nodes.registerType("chromeConfig", Chrome_Config);




}