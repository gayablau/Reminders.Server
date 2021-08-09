const express = require('express'); //requires express module
const socket = require('socket.io'); //requires socket.io module
const fs = require('fs');
const app = express();
var PORT = process.env.PORT || 3000;
const server = app.listen(PORT); //tells to host server on localhost:3000


//Playing variables:
app.use(express.static('public')); //show static files in 'public' directory
console.log('Server is running');
const io = socket(server);

var count = 0;


//Socket.io Connection------------------
io.on('connection', (socket) => {

    console.log("New socket connection: " + socket.id)

    socket.on('reminder', () => {
        count++;
        console.log(count)
        io.emit('time', 1631174280456);
        io.emit('id', 10);
        io.emit('header', "test1");
        io.emit('description', "test2");
        io.emit('username', "gaya11");
    })
})