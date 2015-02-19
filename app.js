var net = require("net");
var util = require('util');
var JSONStream = require('JSONStream');

var serverHost = process.argv[2];
var serverPort = process.argv[3];
var name = process.argv[4];

console.log("I'm", name, "and connect to", serverHost + ":" + serverPort);

client = net.connect(serverPort, serverHost, function() {
    return send({
        msg: "join",
        data: {
            player: {
                name: name
            }
        }
    });
});

function send(json) {
    return client.write(JSON.stringify(json));
}

jsonStream = client.pipe(JSONStream.parse());

jsonStream.on('data', function(data) {
    console.log(JSON.stringify(data));

    if (data.msg === 'joined') {
        console.log('Joined')
    } else if (data.msg === 'created') {
        console.log('Game created');
    } else if (data.msg === 'start') {
        console.log('Game started');
    } else if (data.msg === 'gameEnd') {
        console.log('Game ended');
    }
});

jsonStream.on('error', function() {
    return console.log("disconnected");
});