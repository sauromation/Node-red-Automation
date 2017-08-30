module.exports = function(RED) {
    var http = require("http");


    ////////////////////////////////////////////////////////////////////////////////

    ///////////////              Server status                       ///////////////

    ////////////////////////////////////////////////////////////////////////////////


    function Server_Status(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var host = config.host;
        var port = config.port;

        node.on('input', function(msg) {
            //msg.payload = msg.payload.toLowerCase();
            var app = {}
            app.host = host;
            app.port = port;
            app.path = '/wd/hub/status';
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
    RED.nodes.registerType("svrStatus", Server_Status);





    ////////////////////////////////////////////////////////////////////////////////

    ///////////////              Server configuration                ///////////////

    ////////////////////////////////////////////////////////////////////////////////



    function Server_Config(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var host = config.host;
        var port = config.port;
        var path = '/wd/hub/session/';
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
            var dCap = '{"desiredCapabilities":{"browserName":"","appium-version":"","platformName":"' + platformName + '","platformVersion":"' + OSversion + '","deviceName":"' + DeviceName + '","app":"' + FolderLocation + AppName + '","autoAcceptAlerts":"true"}}';
            console.log("Device capabilities are: " + dCap);

            var options = {};
            options.hostname = host;
            options.port = port;
            options.path = '/wd/hub/session/';
            options.method = 'POST';
            options.headers = {
                'Content-Type': 'application/json'
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
    RED.nodes.registerType("svrConfig", Server_Config);



    ////////////////////////////////////////////////////////////////////////////////

    ///////////////                Native or Webview                 ///////////////

    ////////////////////////////////////////////////////////////////////////////////



    function set_Context(config) {
        RED.nodes.createNode(this, config);
        var contextX = config.searchvalue;
        var node = this;
        var flowContext = this.context().flow;


        node.on('input', function(msg) {
            //msg.payload = msg.payload.toLowerCase();
            //var dCap = undefined;
            var dCap = '{"name":"NATIVE_APP"}';
            if (contextX != "NATIVE_APP" && msg.context != undefined) {
                dCap = '{"name":"' + msg.context + '"}';
            } else {
                dCap = '{"name":"NATIVE_APP"}';
            }

            console.log("Selecting context: >>>>>>>  " + dCap);
            var host = flowContext.get('host');
            var port = flowContext.get('port');
            var sessionId = flowContext.get('sessionId');
            console.log("This is the session ID in the context node: >>>>>>>>   " + sessionId);

            var options = {};
            options.hostname = host;
            options.port = port;
            options.path = '/wd/hub/session/' + sessionId + "/context";
            options.method = 'POST';
            options.headers = {
                'Content-Type': 'application/json'
            };

            //console.log("http options set to:  " + JSON.stringify(options));
            var req = http.request(options, function(response) {
                console.log('Status: ' + response.statusCode);
                console.log('Headers: ' + JSON.stringify(response.headers));
                response.setEncoding('utf8');
                if (response.statusCode == 200) {
                    response.on('data', function(body) {
                        console.log('Body: ' + body);
                        var bodyx = JSON.parse(body);
                        console.log("Body returned:  >>>>>>>>>   " + bodyx);
                        node.send(body);
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




    }
    RED.nodes.registerType("setContext", set_Context);




    ////////////////////////////////////////////////////////////////////////////////

    ///////////////                Select something                  ///////////////

    ////////////////////////////////////////////////////////////////////////////////


    function select_Element(config) {
        RED.nodes.createNode(this, config);
        var searchvalue = config.searchvalue;
        var item = config.item;
        var node = this;
        var flowContext = this.context().flow;
        console.log("This is the searchvalue: >>>>>>>>   " + searchvalue);


        node.on('input', function(msg) {
            //msg.payload = msg.payload.toLowerCase();
            var dCap = undefined;
            var dCap = '{"using":"' + searchvalue + '","value":"' + item + '"}';
            console.log("Selecting context: " + dCap);
            var host = flowContext.get('host');
            var port = flowContext.get('port');
            var sessionId = flowContext.get('sessionId');
            console.log("This is the session ID in the context node: >>>>>>>>   " + sessionId);

            var options = {};
            options.hostname = host;
            options.port = port;
            options.path = '/wd/hub/session/' + sessionId + "/element";
            options.method = 'POST';
            options.headers = {
                'Content-Type': 'application/json'
            };

            //console.log("http options set to:  " + JSON.stringify(options));

            var req = http.request(options, function(response) {
                //console.log('Status: ' + response.statusCode);
                //console.log('Headers: ' + JSON.stringify(response.headers));
                response.setEncoding('utf8');
                response.on('data', function(body) {
                    node.send(body);
                    console.log("Element Found: >>>>>>>>   " + body);
                    var elementX = JSON.parse(body);
                    this.elementID = elementX.value.ELEMENT;
                    flowContext.set('elementID', this.elementID);
                    console.log("Element is:  >>>>>>>>>>>>>>>>>>>>>>  " + this.elementID);
                    node.send(this.elementID);
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: "connected"
                    });
                });
            }).on('error', function(e) {
                console.log('problem with request: ' + e);
                //node.send(e.message);
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
    RED.nodes.registerType("selectElement", select_Element);


    ////////////////////////////////////////////////////////////////////////////////

    ///////////////              get_context                      ///////////////

    ////////////////////////////////////////////////////////////////////////////////


    function get_Context(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var host = config.host;
        var port = config.port;
        var flowContext = this.context().flow;

        node.on('input', function(msg) {
            //msg.payload = msg.payload.toLowerCase();
            var sessionId = flowContext.get('sessionId');
            var app = {}
            app.host = flowContext.get('host');
            app.port = flowContext.get('port');
            app.path = '/wd/hub/session/' + sessionId + "/contexts";
            var msg = msg;
            console.log("Msg : >>>>>>  : " + JSON.stringify(msg.payload));

            http.get(app, function(response) {
                response.setEncoding('utf8');
                console.log("Status code: >>>>>>  : " + response.statusCode);
                if (response.statusCode == 200) {
                    response.on('data', function(body) {
                        var bodyx = JSON.parse(body);
                        var datax = msg;
                        console.log("get context Native?: >>>>>>  : " + JSON.stringify(bodyx.value[0]));
                        console.log("get context Body : >>>>>>  : " + JSON.stringify(bodyx.value[1]));
                        msg.context = bodyx.value[1];
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
    RED.nodes.registerType("getContext", get_Context);




    ////////////////////////////////////////////////////////////////////////////////

    ///////////////              getmmmm              ///////////////

    ////////////////////////////////////////////////////////////////////////////////



    function handle_Alert(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var flowContext = this.context().flow;


        node.on('input', function(msg) {
            var host = flowContext.get('host');
            var port = flowContext.get('port');
            var sessionId = flowContext.get('sessionId');

            var options = {};
            options.hostname = host;
            options.port = port;
            options.path = '/wd/hub/session/' + sessionId + "/accept_alert";
            options.method = 'POST';

            console.log("options.path: >>>>>>>>   " + options.path);

            var req = http.request(options, function(response) {
                response.setEncoding('utf8');
                console.log(JSON.stringify(response.headers));
                response.on('data', function(body) {
                    node.send("Click Done");
                    console.log("Clicked element: >>>>>>>>   " + body);

                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: "connected"
                    });
                });
            }).on('error', function(e) {
                console.log('problem with request: ' + e);
                node.send(e.message);
                node.status({
                    fill: "red",
                    shape: "ring",
                    text: "disconnected"
                });

            });
            // write data to request body
            //req.write(" ");
            req.end();

        });
        node.on('close', function() {
            // tidy up any state
            console.log("Done");
        });

    }
    RED.nodes.registerType("handleAlert", handle_Alert);




    function click_Element(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var flowContext = this.context().flow;


        node.on('input', function(msg) {
            var host = flowContext.get('host');
            var port = flowContext.get('port');
            var sessionId = flowContext.get('sessionId');
            this.elementID = flowContext.get('elementID');

            console.log("Element: >>>>>>>>   " + this.elementID);
            var options = {};
            options.hostname = host;
            options.port = port;
            options.path = '/wd/hub/session/' + sessionId + "/element/" + this.elementID + "/click";
            options.method = 'POST';

            console.log("options.path: >>>>>>>>   " + options.path);

            var req = http.request(options, function(response) {
                response.setEncoding('utf8');
                response.on('data', function(body) {
                    node.send("Click Done");
                    console.log("Clicked element: >>>>>>>>   " + body);

                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: "connected"
                    });
                });
            }).on('error', function(e) {
                console.log('problem with request: ' + e);
                node.send(e.message);
                node.status({
                    fill: "red",
                    shape: "ring",
                    text: "disconnected"
                });

            });
            // write data to request body
            //req.write(" ");
            req.end();

        });
        node.on('close', function() {
            // tidy up any state
            console.log("Done");
        });

    }
    RED.nodes.registerType("clickElement", click_Element);



    function Import_List(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            var test = msg.payload;
            var globalContext = this.context().global;
            this.addr = "Not Set"
            if (test != undefined) {
                globalContext.set("selector", test);
            }

            test.forEach(function(entry) {
                console.log(entry);
            });

            console.log("This is a test: " + test[5].selector);
            console.log("The size of the array: " + test.length)



            node.send(test[5]);
        });
    }
    RED.nodes.registerType("listImport", Import_List);



}