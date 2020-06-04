const socket = io()

const messageForm = document.querySelector('#message-form')
const chatMessage = document.querySelector('#message')
const chatArea = document.querySelector('#chatArea')
const sendLocation = document.querySelector('#send-location')

socket.on('message', (message) => {
    chatArea.innerHTML = chatArea.innerHTML + '<span class="timestamp">' + new Date().toLocaleString() + '</span><span class="message">' + message + '</span><br/>'
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = chatMessage.value
    socket.emit('message', message, (error) => {
        if (error) {
            return alert(error)
        }
        console.log('Message delivered')
        chatMessage.value = ''
    })
})

sendLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if (error) {
                return alert(error)
            }
            console.log('Location shared')
        })
    })
})