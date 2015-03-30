var _ = require('lodash'),
    net = require("net"),
    crypto = require('crypto'),
    JSONStream = require('JSONStream');

var serverHost = process.argv[2];
var serverPort = process.argv[3];

// Randomize name to be able to launch multiple instances of the same player
var name = process.argv[4] + crypto.randomBytes(2).toString('hex');

var dir = {
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

var playerNo = null,
    appleX = -1,
    appleY = -1;

client = net.connect(serverPort, serverHost, function() {
    console.log("I'm", name, "and connected to", serverHost + ":" + serverPort);

    return send({
        msg: "join",
        data: { player: { name: name } }
    });
});

jsonStream = client.pipe(JSONStream.parse());

jsonStream.on('data', function(packet) {
    var msg = packet.msg;
    var data = packet.data;

    switch (msg) {
        case 'join':
            console.log('Joined');
            break;
        case 'create':
            console.log('Game created');
            break;
        case 'start':
            console.log('Game start');
            playerNo = _.findIndex(data.players, {name: name});
            console.log("Width: " + data.level.width + ", height: " + data.level.height + ", I'm player " + (playerNo + 1));
            break;
        case 'end':
            console.log('Game ended');
            break;
        case 'apple':
            appleX = data[0];
            appleY = data[1];
            console.log("Apple: " + appleX + ", " + appleY);
            break;
        case 'positions':
            var snake = data.snakes[playerNo];
            var direction = snake.direction;
            var x = snake.body[0][0];
            var y = snake.body[0][1];

            if (x < appleX) {
                if (direction == dir.LEFT)
                    control(dir.UP);
                else
                    control(dir.RIGHT);
            }
            else if (x > appleX) {
                if (direction == dir.RIGHT)
                    control(dir.UP);
                else
                    control(dir.LEFT);
            }
            else if (y < appleY) {
                if (direction == dir.UP)
                    control(dir.LEFT);
                else
                    control(dir.DOWN);
            }
            else if (y > appleY) {
                if (direction == dir.DOWN)
                    control(dir.RIGHT);
                else
                    control(dir.UP);
            }
            break;
        default:
            console.log("Unknown message: " + msg);
    }
});

jsonStream.on('error', function() {
    return console.log("disconnected");
});

function control(direction) {
    send({msg: 'control', data: {direction: direction}});
}

function send(json) {
    var jsonString = JSON.stringify(json);
    return client.write(jsonString);
}
