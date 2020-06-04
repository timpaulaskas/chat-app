const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
    pingTimeout: 60000,
})

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.json())

app.use(express.static(publicDirectoryPath))

let connectionCount = 0
io.on('connection', (socket) => {
    connectionCount++
    console.log(`Socket connection! Total connections: ${connectionCount}`)

    // JOIN
    socket.on('join', ({username, room}, callback) => {
        const { error, user } = addUser({id: socket.id, username, room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('-room-', 'Welcome!'))
        socket.to(user.room).broadcast.emit('message', generateMessage('-room-', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('message', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, message))
        }
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        if (!coords) {
            return callback('Location sharing not enabled')
        }
        const {latitude, longitude} = coords
        if (user) {
            socket.broadcast.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        }
        callback()
    })

    socket.on('disconnect', () => {
        connectionCount--
        console.log(`Socket disconnected! Total connections: ${connectionCount}`)
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('-room-', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

module.exports = server