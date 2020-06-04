const socket = io()

const messageForm = document.querySelector('#message-form')
const chatMessage = document.querySelector('#message')
const chatButton = document.querySelector('#sendMessage')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        time: new Date().toLocaleString(),
        message
    })
    messages.insertAdjacentHTML('afterbegin', html)
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const message = chatMessage.value
    if (message !== '') {
        chatButton.setAttribute('disabled', 'disabled')
        socket.emit('message', message, (error) => {
            chatButton.removeAttribute('disabled')
            if (error) {
                return alert(error)
            }
            console.log('Message delivered')
            chatMessage.value = ''
            chatMessage.focus()
        })
    }

})

sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            sendLocationButton.removeAttribute('disabled')
            if (error) {
                return alert(error)
            }
            console.log('Location shared')
        })
    })
})