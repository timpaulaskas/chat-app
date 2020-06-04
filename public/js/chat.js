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
    chatMessage.value = ''
    socket.emit('message', message)
})

sendLocation.addEventListener('click', () => {
    if (sendLocation.checked) {
        if (!navigator.geolocation) {
            return alert('Geolocation is not supported by your browser')
        }

        navigator.geolocation.getCurrentPosition((position) => {
            console.log(position)
        })
    }
})