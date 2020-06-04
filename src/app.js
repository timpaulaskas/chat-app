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

    socket.on('message', (message) => {
        io.emit('message', message)
    })
})
module.exports = server