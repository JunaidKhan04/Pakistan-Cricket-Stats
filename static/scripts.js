document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user_input");

    // Auto-scroll to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Add message to chat
    function addMessage(content, isUser, time = "Just now") {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", isUser ? "user-message" : "bot-message");

        const messageContent = document.createElement("div");
        messageContent.classList.add("message-content");
        messageContent.innerHTML = `<p>${content}</p>`;

        const messageTime = document.createElement("div");
        messageTime.classList.add("message-time");
        messageTime.textContent = time;

        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        chatMessages.appendChild(messageDiv);

        scrollToBottom();
    }

    // Speak bot's reply using a female voice if available
    function speakText(text) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";

        const setVoice = () => {
            const voices = synth.getVoices();
            const femaleVoice = voices.find(voice =>
                voice.name.toLowerCase().includes("female") ||
                voice.name.includes("Google US English") || // Chrome
                voice.name.includes("Samantha") ||           // macOS
                voice.name.includes("Microsoft Zira")        // Windows
            );

            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }

            synth.speak(utterance);
        };

        // Handle async loading of voices
        if (synth.getVoices().length === 0) {
            synth.addEventListener("voiceschanged", setVoice);
        } else {
            setVoice();
        }
    }

    // Handle form submit
    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // Add user's message
        addMessage(message, true);

        // Clear input
        userInput.value = "";

        // Send to server
        fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `user_input=${encodeURIComponent(message)}`
        })
        .then(response => response.json())
        .then(data => {
            const botMessage = data.answer || "I didn't understand that.";
            const time = data.time || "Just now";

            // Add bot's message and speak it
            addMessage(botMessage, false, time);
            speakText(botMessage);
        })
        .catch(error => {
            console.error("Error:", error);
            addMessage("Sorry, I'm having trouble connecting to the server.", false);
        });
    });

    // Initial scroll
    scrollToBottom();

    // Auto-scroll on new messages
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(chatMessages, { childList: true });
});
