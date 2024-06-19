document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:8000');

    const form = document.getElementById('chat-form');
    const messageInput = document.getElementById('msg');
    const messageContainer = document.getElementById('msgContainer');
    const userList = document.getElementById('user-list');
    let userName = '';
    let displayTime = '';


    function playSound() {
        var sound = document.getElementById('sound');
        sound.play();
    }

    // Function to append regular chat messages
    const appendMessage = (message, position) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', position);
        messageElement.innerHTML = `
            <li class="d-flex justify-content-between mb-4 ${position}">
                <div class="card w-100">
                    <div class="card-header d-flex justify-content-between p-3">
                        <p class="fw-bold mb-0">${position === 'right' ? 'You' : 'Someone'}</p>
                        <p class="text-muted small mb-0"><i class="far fa-clock"></i></p>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">${message}</p>
                    </div>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/128/3177/3177440.png" alt="avatar"
                    class="rounded-circle d-flex align-self-start ms-3 shadow-1-strong" width="60">
            </li>`;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    // Function to append system messages (like user joined)
    const appendSystemMessage = (message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('system-message');
        messageElement.innerHTML = `
            <li class="d-flex justify-content-center mb-2">
                <p class="text-muted text-primary">${message}</p>
            </li>`;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    // Function to append received messages
    const appendMessageReceive = (message, position, name) => {
        playSound();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', position);
        messageElement.innerHTML = `
            <li class="d-flex justify-content-between mb-4 ${position}">
                <img src="https://cdn-icons-png.flaticon.com/128/3177/3177440.png" alt="avatar"
                    class="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="60">
                <div class="card w-100">
                    <div class="card-header d-flex justify-content-between p-3">
                        <p class="fw-bold mb-0">${name}</p>
                        <p class="text-muted small mb-0"><i class="far fa-clock"></i></p>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">${message}</p>
                    </div>
                </div>
            </li>`;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    // Function to append new user to the user list
    const appendUser = (name) => {
        const userElement = document.createElement('li');
        userElement.setAttribute('id', name); // Set user ID to name for identification
        userElement.classList.add('p-2', 'border-bottom');
        userElement.style.backgroundColor = 'white';
        userElement.innerHTML = `
            <a href="#!" class="d-flex justify-content-between">
                <div class="d-flex flex-row">
                    <div class="pt-1">
                        <p class="fw-bold mb-0">${name}</p>
                    </div>
                </div>
                <div class="pt-1">
                    <p class="small text-muted mb-1" id="time1">${displayTime}</p>
                </div>
            </a>`;
        userList.appendChild(userElement);
    };

    // Function to remove user from the user list
    const removeUser = (name) => {
        const userElement = document.getElementById(name);
        if (userElement) {
            userElement.remove();
        }
    };

    // Function to handle user join messages
    const userJoin = (name) => {
        if (name !== userName) {
            playSound();
            appendSystemMessage(`${name} joined the chat`);
            appendUser(name);
        }
    };

    // Function to update the user list
    const updateUserList = (users) => {
        userList.innerHTML = ''; // Clear the user list
        users.forEach(user => {
            if (user !== userName) {
                appendUser(user);
            }
        });
    };

    // Socket event listeners
    socket.on('user-joined', name => {
        userJoin(name);
    });

    socket.on('receive', data => {
        appendMessageReceive(data.message, 'left', data.name);
    });

    socket.on('user-left', name => {
        playSound();
        appendSystemMessage(`${name} left the chat`);
        removeUser(name);
    });

    socket.on('update-user-list', users => {
        updateUserList(users);
    });

    // Form submission event listener
    form.addEventListener('submit', e => {
        e.preventDefault(); // Prevent form from reloading the page
        const message = messageInput.value.trim();
        const name = nameInput.value.trim();

        if (!(name.length > 0)) {
            // alert('Please enter a name to start conversation')
            document.getElementById('register_section').click();
        }
        else {
            appendMessage(message, 'right');
            socket.emit('send', message, name);
            messageInput.value = '';
        }

    });

    // Emit new user joined event
    socket.emit('new-user-joined', userName);

});
