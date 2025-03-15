const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from the 'public' folder

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', (data) => {
        io.emit('receiveMessage', { from: 'user', text: data.text });
    });

    socket.on('sendImage', (data) => {
        io.emit('receiveMessage', { from: 'user', text: `<img src="${data.image}" alt="image" />` });
    });

    socket.on('sendFile', (data) => {
        io.emit('receiveMessage', { from: 'user', text: `<a href="/uploads/${data.fileName}" download>Download File</a>` });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running');
});
