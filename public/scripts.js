const socket = io('https://gchat-svaq.onrender.com');

const phoneInput = document.getElementById('phoneInput');
const loginBtn = document.getElementById('loginBtn');
const chatContainer = document.querySelector('.chat-container');
const loginContainer = document.querySelector('.login-container');

const contactInput = document.getElementById('contactInput');
const saveContactBtn = document.getElementById('saveContactBtn');
const contactList = document.getElementById('contactList');

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');

let userPhone;

// User Login
loginBtn.addEventListener('click', () => {
    userPhone = phoneInput.value.trim();
    if (userPhone) {
        socket.emit('userLogin', userPhone);
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'block';
    }
});

// Save Contact
saveContactBtn.addEventListener('click', () => {
    const contactPhone = contactInput.value.trim();
    if (contactPhone) {
        socket.emit('saveContact', { userPhone, contactPhone });
        contactList.innerHTML += `<option value="${contactPhone}">${contactPhone}</option>`;
        contactInput.value = '';
    }
});

// Send Message
sendBtn.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    const receiver = contactList.value;
    if (messageText && receiver) {
        socket.emit('sendMessage', { sender: userPhone, receiver, text: messageText });
        messageInput.value = '';
    }
});

// Receive Message
socket.on('receiveMessage', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <div class="message-text">${decryptMessage(data.text)}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Decrypt Message Function
function decryptMessage(encryptedText) {
    // Decrypt using the same algorithm from the backend
    return encryptedText; // Replace with actual decryption logic
}
