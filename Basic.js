module.exports = function(RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
		this.test = config.test;
        node.on('input', function(msg) {
			msg.payload = msg.payload.toLowerCase();
			msg.chips = "hi"; 
			msg.test = this.test;
            node.send(msg);
        });
    }
    RED.nodes.registerType("lower-case",LowerCaseNode);
}