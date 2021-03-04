const path = require('path');
const express = require('express');
const randomWords = require('random-words');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

let cache = require('memory-cache');

app.use(express.static(path.join(__dirname, '../../build')));
app.get('/', (req, res, next) => res.sendFile(__dirname + './index.html'));

io.on('connection', (socket) => {
    socket.emit('connect_device');
    socket.on('connect_device', (isMobile) => {
        if (!isMobile) {
            let sessionName = randomWords({exactly: 1, maxLength: 5});
            let session = {};

            console.log(`New session (${sessionName}) has been created`);

            cache.put(sessionName, session);
        }
    });
});

server.listen(port);
