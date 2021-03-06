const socket = io()

const messageForm = document.querySelector('#message-form')
const chatMessage = document.querySelector('#message')
const chatButton = document.querySelector('#sendMessage')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New message element
    const $newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    //Height of messages container
    const containerHeight = messages.scrollHeight

    // How far scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}
const timeFormat = (time) => {
    return moment(time).format('h:mm:ss a')
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        time: timeFormat(message.createdAt),
        message: message.text
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(urlTemplate, {
        username: message.username,
        time: timeFormat(message.createdAt),
        url: message.url
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
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
            const html = Mustache.render(messageTemplate, {
                username: username.toLowerCase(),
                time: timeFormat(new Date().getTime()),
                message: 'Location shared'
            })
            messages.insertAdjacentHTML('beforeend', html)
        })
    })
})