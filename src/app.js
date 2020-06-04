const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
    pingTimeout: 60000,
})

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.json())

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New web socket connection!')

    socket.emit('message', 'Welcome!')

    socket.broadcast.emit('message', 'A new user has joined')
    socket.on('message', (message) => {
        io.emit('message', message)
    })

    socket.on('sendLocation', (coords) => {
        if (!coords) {
            return console.log('Location sharing not enabled')
        }
        const {latitude, longitude} = coords
        socket.broadcast.emit('message', `<a href="https://google.com/maps?q=${latitude},${longitude}">Shared Location</a>`)
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left')
    })
})

module.exports = server