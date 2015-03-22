var _ = require('lodash'),
    net = require("net"),
    crypto = require('crypto'),
    JSONStream = require('JSONStream');

var serverHost = process.argv[2];
var serverPort = process.argv[3];

// Randomize name to be able to launch multiple instances of the same player
var name = process.argv[4] + crypto.randomBytes(2).toString('hex');

var width = null,
    height = null,
    playerNo = null,
    appleX = -1,
    appleY = -1;

console.log("I'm", name, "and connect to", serverHost + ":" + serverPort);

client = net.connect(serverPort, serverHost, function() {
    return send({
        msg: "join",
        data: { player: { name: name } }
    });
});

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
        var snakes = data.data.snakes;
        var snake = snakes[playerNo];
        var direction = snake.direction;
        var x = snake.body[0][0];
        var y = snake.body[0][1];

        if(appleX !== -1) {
            if(x < appleX) {
                if(direction == 3)
                    send({msg: 'control', data: {direction: 1}});
                else
                    send({msg: 'control', data: {direction: 4}});
            }
            else if( x > appleX) {
                if(direction == 4)
                    send({msg: 'control', data: {direction: 1}});
                else
                    send({msg: 'control', data: {direction: 3}});
            }
            else if( y < appleY) {
                if(direction == 1)
                    send({msg: 'control', data: {direction: 3}});
                else
                    send({msg: 'control', data: {direction: 2}});
            }
            else if( y > appleY) {
                if(direction == 2)
                    send({msg: 'control', data: {direction: 3}});
                else
                    send({msg: 'control', data: {direction: 1}});
            }
        }
    } else if (data.msg === 'apple') {
        appleX = data.data[0];
        appleY = data.data[1];
        console.log("Apple: " + appleX + ", " + appleY);
    }
});

jsonStream.on('error', function() {
    return console.log("disconnected");
});

function send(json) {
    var jsonString = JSON.stringify(json);
    console.log("SEND: " + jsonString);
    return client.write(jsonString);
}
