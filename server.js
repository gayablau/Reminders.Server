const express = require('express'); //requires express module
const socket = require('socket.io'); //requires socket.io module
const fs = require('fs');
const app = express();
let PORT = process.env.PORT || 3456;
const server = app.listen(PORT); //tells to host server on localhost:3000


//Playing variables:
app.use(express.static('public')); //show static files in 'public' directory
console.log('Server is running on port: ' + PORT);
const io = socket(server);

let data = [];


//Socket.io Connection------------------
io.on('connection', (socket) => {

    let username;
    let password;

    console.log('New socket connection: ' + socket.id)


    socket.on("connectUser", (...args) => {
        username = args[0]
        socket.join(username)
        console.log('connected with: ' + username)
    });

    socket.on("createUser", (...args) => {
        username = args[0]
        password = args[1]
        const user = {username: args[0], password: args[1], reminders: []}
        data.push(user)
        socket.join(username)
        console.log('connected with new user: ' + username)
    });

    
    socket.on("createReminder", (...args) => {
       const reminder = {id:args[0], header:args[1], description:args[2], username:args[3], time:args[4], createdAt:args[5]}
       data.forEach(function(item, index, array){
           if (item.username === username) {
               array[index].reminders.push(reminder)
           }
       })
       io.to(username).emit('createReminder', reminder);
       console.log('reminder ' + reminder.id + ' added to user: ' + username)
       console.log(data)
    });

    socket.on("editReminder", (...args) => {
        const reminder = {id:args[0], header:args[1], description:args[2], username:args[3], time:args[4], createdAt:args[5]}
        data.forEach(function(item, index, array){
            if (item.username === username) {
                item.reminders.forEach(function(item, index, array){
                    if (item.id === reminder.id) {
                        array[index] = reminder
                    }
                })
            }
        })
        io.to(username).emit('editReminder', reminder);
        console.log('reminder '+ reminder.id +  'of the user: ' + username + ' updated ')
        console.log(data)
     });


     socket.on("deleteReminder", (...args) => {
        const id = args[0]
        data.forEach(function(item, index, array){
            if (item.username === username) {
                item.reminders.forEach(function(item, index, array){
                    if (item.id === id) {
                        array.splice(index, 1)
                    }
                })
            }
        })
        io.to(username).emit('deleteReminder', id);
        console.log('reminder' + id + 'of the user: ' + username + ' deleted ')
        console.log(data)
     });


     socket.on("changeUsername", (...args) => {
        const oldUsername = args[0]
        const newUsername = args[1]
        data.forEach(function(item, index, array){
            if (item.username === oldUsername) {
                item.username = newUsername
                socket.leave(username)
                username = newUsername
                socket.join(username)
            }
        })
        io.to(username).emit('deleteReminder', args);
        console.log('username ' + oldUsername + 'updated to: ' + newUsername)
        console.log(data)
     });

    socket.on('test', () => {
        console.log('test')
        socket.emit('username', 'gaya11');
        socket.emit('password', '123');
    })

    socket.on('test2', () => {
        console.log('test2')
    })
})