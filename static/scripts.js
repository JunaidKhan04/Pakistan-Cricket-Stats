document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user_input');

    // Scroll to bottom of chat messages
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Add a message to the chat
    function addMessage(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = `<p>${content}</p>`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        messageTime.textContent = timeString;
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        chatMessages.appendChild(messageDiv);
        
        scrollToBottom();
    }

    // Handle form submission with AJAX
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        
        if (message) {
            // Add user message to chat immediately
            addMessage(message, true);
            
            // Clear input
            userInput.value = '';
            
            // Send message to server using AJAX
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `user_input=${encodeURIComponent(message)}`
            })
            .then(response => response.json())
            .then(data => {
                const answer = data.answer || "I didn't understand that.";
                addMessage(answer, false);
            })

            .catch(error => {
                console.error('Error:', error);
                addMessage("Sorry, I'm having trouble connecting to the server.", false);
            });
        }
    });

    // Initial scroll to bottom
    scrollToBottom();

    // Auto-scroll when new messages are added
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(chatMessages, { childList: true });
});