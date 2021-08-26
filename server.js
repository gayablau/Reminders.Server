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
    let userId;
    let roomName
    let password;

    console.log('New socket connection: ' + socket.id)


    socket.on("connectUser", (...args) => {
        userId = args[0]
        username = args[1]
        roomName = userId + ''
        socket.join(roomName)
        console.log('connected with: ' + username)
    });

    socket.on("createUser", (...args) => {
        userId = args[0]
        username = args[1]
        password = args[2]
        const user = {userId: args[0], username: args[1], password: args[2], reminders: []}
        data.push(user)
        roomName = userId + ''
        socket.join(roomName)
        io.emit('createUser', userId, username, password);
        console.log('connected with new user: ' + username)
    });

    
    socket.on("createReminder", (...args) => {
       const reminder = {id:args[0], header:args[1], description:args[2], user:args[3], time:args[4], createdAt:args[5]}
       data.forEach(function(item, index, array){
           if (item.username == username) {
               array[index].reminders.push(reminder)
           }
       })
       socket.to(roomName).emit('createReminder', args[0], args[1], args[2], args[3], args[4], args[5]);
       console.log('reminder ' + reminder.id + ' added to user: ' + username)
       console.log(data)
    });

    socket.on("editReminder", (...args) => {
        const reminder = {id:args[0], header:args[1], description:args[2], user:args[3], time:args[4], createdAt:args[5]}
        data.forEach(function(item, index, array){
            if (item.username == username) {
                item.reminders.forEach(function(item, index, array){
                    if (item.id == reminder.id) {
                        array[index] = reminder
                    }
                })
            }
        })
        socket.to(roomName).emit('editReminder', args[0], args[1], args[2], args[3], args[4], args[5]);
        console.log('reminder '+ reminder.id + ' updated ')
        console.log(data)
     });


     socket.on("deleteReminder", (...args) => {
        const id = args[0]
        data.forEach(function(item, index, array){
            if (item.userId == userId) {
                item.reminders.forEach(function(item, index, array){
                    if (item.id == id) {
                        array.splice(index, 1)
                    }
                })
            }
        })
        socket.to(roomName).emit('deleteReminder', args[0], args[1], args[2], args[3], args[4], args[5]);
        console.log('reminder ' + id + ' of the user: ' + username + ' deleted ')
        console.log(data)
     });


     socket.on("changeUsername", (...args) => {
        const oldUsername = args[0]
        const newUsername = args[1]
        data.forEach(function(item, index, array){
            if (item.username == oldUsername) {
                item.username = newUsername
            }
        })
        username = newUsername
        socket.to(roomName).emit('changeUsername', oldUsername, newUsername);
        console.log('username ' + oldUsername + ' updated to: ' + newUsername)
        console.log(data)
     });


    socket.on("logout", () => {
        socket.leave(roomName)
        console.log('user ' + username + ' logged out')
        username = undefined
        userId = undefined
        roomName = undefined
         });
    


     socket.on("getAllUsers", (...args) => {
        socket.emit('getAllUsers', data);
        console.log(data)
     });

     socket.on("getAllReminders", (...args) => {
        data.forEach(function(item, index, array){
            if (item.userId == args[0]) {
                socket.emit('getAllReminders', item.reminders);
                console.log(item.reminders)
            }
        })
     });
})