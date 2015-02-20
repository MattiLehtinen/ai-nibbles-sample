var net = require("net"),
    util = require('util'),
    crypto = require('crypto'),
    JSONStream = require('JSONStream'),
    _ = require('lodash');

var serverHost = process.argv[2];
var serverPort = process.argv[3];
var name = process.argv[4] + crypto.randomBytes(2).toString('hex');

var width = null,
    height = null,
    playerNo = null;

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
    var jsonString = JSON.stringify(json);
    console.log("SEND: " + jsonString);
    return client.write(jsonString);
}

jsonStream = client.pipe(JSONStream.parse());

jsonStream.on('data', function(data) {
    console.log(JSON.stringify(data));

    if (data.msg === 'joined') {
        console.log('Joined')
    } else if (data.msg === 'created') {
        console.log('Game created');
    } else if (data.msg === 'start') {
        console.log('Game start');
        width = data.data.level.width;
        height = data.data.level.height;
        playerNo = _.findIndex(data.data.players, {name: name});
        console.log("Width: " + width + ", height: " + height + ", I'm player " + (playerNo + 1));
    } else if (data.msg === 'end') {
        console.log('Game ended');
    } else if (data.msg === 'positions') {
        var snake = data.data[playerNo];
        var x = snake.body[0][0];
        var y = snake.body[0][1];
        var direction = snake.direction;
        console.log(x + ", " + y + " | " + direction);
        if(x <= 5 && direction == 3) send({msg: 'control', data: {direction: 1}});
        if(x >= width-6 && direction == 4) send({msg: 'control', data: {direction: 2}});
        if(y <= 6 && direction == 1) send({msg: 'control', data: {direction: 4}});
        if(y >= height-6 && direction == 2) send({msg: 'control', data: {direction: 3}});
    }
});

jsonStream.on('error', function() {
    return console.log("disconnected");
});