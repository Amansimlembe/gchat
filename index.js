const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

const SECRET_KEY = "dbee970d066fb06eca2bf712578c6a9407aae9a214c816296c0c3e6151a4bf2f"; // Must be 32 characters


// Encryption Function
function encryptMessage(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Decryption Function
function decryptMessage(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = textParts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Store Users & Contacts
const users = {}; // { phone: socketId }
const contacts = {}; // { phone: [contacts] }

// Serve static files
app.use(express.static('public'));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // User Login with Phone Number
    socket.on('userLogin', (phone) => {
        users[phone] = socket.id;
        socket.phone = phone; // Save phone number to socket
        console.log(`User logged in: ${phone}`);
    });

    // Save Contact
    socket.on('saveContact', ({ userPhone, contactPhone }) => {
        if (!contacts[userPhone]) contacts[userPhone] = [];
        if (!contacts[userPhone].includes(contactPhone)) {
            contacts[userPhone].push(contactPhone);
        }
    });

    // Send Encrypted Message
    socket.on('sendMessage', ({ sender, receiver, text }) => {
        const encryptedMessage = encryptMessage(text);
        if (users[receiver]) {
            io.to(users[receiver]).emit('receiveMessage', { sender, text: encryptedMessage });
        }
    });

    // Send Encrypted Image
    socket.on('sendImage', ({ sender, receiver, image }) => {
        if (users[receiver]) {
            io.to(users[receiver]).emit('receiveMessage', { sender, image });
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.phone}`);
        delete users[socket.phone];
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
