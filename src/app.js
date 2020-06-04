const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocation } = require('./utils/messages')

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

    socket.emit('message', generateMessage('Welcome!'))

    socket.broadcast.emit('message', generateMessage('A new user has joined'))

    socket.on('message', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        if (!coords) {
            return callback('Location sharing not enabled')
        }
        const {latitude, longitude} = coords
        socket.broadcast.emit('locationMessage', generateLocation(`https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        connectionCount--
        console.log(`Socket disconnected! Total connections: ${connectionCount}`)
        io.emit('message', generateMessage('A user has left'))
    })
})

module.exports = server