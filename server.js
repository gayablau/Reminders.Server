const express = require('express');
const socket = require('socket.io');
const fs = require('fs');
const app = express();
const { v4: uuidv4 } = require('uuid');
let PORT = process.env.PORT || 3456;
const server = app.listen(PORT);


app.use(express.static('public'));
console.log('Server is running on port: ' + PORT);
const io = socket(server);

let data = [];

io.on('connection', (socket) => {

    let username;
    let userId;
    let roomName

    console.log('New socket connection: ' + socket.id)


    socket.on("connectUser", (...args) => {

        let details = strToArray(args[0])
        let usernameToConnect = details[0]
        let passwordToConnect = details[1]

        let idToConnect = authentication(usernameToConnect, passwordToConnect)
        if (idToConnect != "") {
            userId = idToConnect
            username = usernameToConnect
            roomName = userId
            socket.join(roomName)
            console.log('connected with: ' + username)
        }
        socket.emit(`userId`, idToConnect);
    });

    socket.on("createReminder", (...args) => {
        let reminderjson = strToArray(args[0])
        let reminder = strToArray(reminderjson)
        data.forEach(function (item, index, array) {
            if (item.userId == reminder.user) {
                array[index].reminders.push(reminder)
                socket.to(roomName).emit('onCreateReminder', reminder);
                console.log('reminder ' + reminder.id + ' added to user: ' + username)
            }
        })
        console.log(data)
    });

    socket.on("editReminder", (...args) => {
        let reminderjson = strToArray(args[0])
        let reminder = strToArray(reminderjson)
        data.forEach(function (item, index, array) {
            if (item.userId == reminder.user) {
                item.reminders.forEach(function (item, index, array) {
                    if (item.id == reminder.id) {
                        array[index] = reminder
                        socket.to(roomName).emit('onEditReminder', reminder);
                        console.log('reminder ' + reminder.id + ' updated ')
                    }
                })
            }
        })
        console.log(data)
    });


    socket.on("deleteReminder", (...args) => {
        let reminderjson = strToArray(args[0])
        let reminder = strToArray(reminderjson)
        data.forEach(function (item, index, array) {
            if (item.userId == reminder.user) {
                item.reminders.forEach(function (item, index, array) {
                    if (item.id == reminder.id) {
                        array.splice(index, 1)
                        socket.to(roomName).emit('onDeleteReminder', reminder);
                        console.log('reminder ' + reminder.id + ' of the user: ' + username + ' deleted ')
                    }
                })
            }
        })

    });


    socket.on("changeUsernameIfAble", (...args) => {
        let details = strToArray(args[0])
        let newUsername = details[0]
        let isChanged = changeUsername(userId, newUsername)
        if (isChanged) {
            console.log('username ' + username + ' updated to: ' + newUsername)
            username = newUsername
        }
        socket.emit('changeUsername', isChanged);
        socket.broadcast.to(roomName).emit('onChangeUsername', newUsername);
    });


    socket.on("logout", () => {
        socket.leave(roomName)
        console.log('user ' + username + ' logged out')
        username = undefined
        userId = undefined
        roomName = undefined
    });


    socket.on("getAllReminders", (...args) => {
        let details = strToArray(args[0])
        let id = details[0]
        const usersIds = data.map(user => user.userId);
        if (usersIds.includes(id)) {
            data.forEach(function (item, index, array) {
                if (item.userId == id) {
                    socket.emit('OnGetAllReminders', item.reminders)
                    console.log(item.reminders)
                    if (username == undefined) {
                        username = item.username
                    }
                    if (userId == undefined) {
                        userId = item.userId
                        roomName = item.userId
                        socket.join(roomName)
                    }
                    console.log('get all reminders by', username)
                }
            })
        }
    });
})

function authentication(usernameToConnect, passwordToConnect) {
    let idToConnect = ''
    const usernames = data.map(user => user.username);
    if (usernames.includes(usernameToConnect)) {
        data.forEach(function (item) {
            if (item.username == usernameToConnect) {
                if (item.password == passwordToConnect) {
                    idToConnect = item.userId
                }
            }
        })
    }
    else {
        const user = { userId: generateID(), username: usernameToConnect, password: passwordToConnect, reminders: [] }
        idToConnect = user.userId
        data.push(user)
    }
    return idToConnect
}

function changeUsername(userId, newUsername) {
    let isChanged = false
    const usernames = data.map(user => user.username);
    if (!usernames.includes(newUsername)) {
        data.forEach(function (item, index, array) {
            if (item.userId == userId) {
                item.username = newUsername
                isChanged = true
            }
        })
    }
    return isChanged
}

function strToArray(strArray) {
    return JSON.parse(strArray)
}

function generateID() {
    return uuidv4();
}