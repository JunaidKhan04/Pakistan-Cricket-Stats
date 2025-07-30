document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user_input");
    const clearBtn = document.getElementById("clear-chat-btn");
    const saveBtn = document.getElementById("save-chat-btn");
    const voiceSelect = document.getElementById("voiceSelect");

    let selectedVoice = null;

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

    // Speak text using selected voice
    function speakText(text) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        synth.speak(utterance);
    }

    // Populate voice selector
    function populateVoiceList() {
        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = "";

        voices.forEach((voice, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });

        // Try to select a preferred voice
        const preferredVoice = voices.find(v =>
            v.name.toLowerCase().includes("female") ||
            v.name.includes("Google US English") ||
            v.name.includes("Microsoft Zira") ||
            v.name.includes("Samantha")
        );

        const defaultIndex = voices.indexOf(preferredVoice);
        if (defaultIndex !== -1) {
            voiceSelect.selectedIndex = defaultIndex;
            selectedVoice = voices[defaultIndex];
        } else if (voices.length > 0) {
            selectedVoice = voices[0];
        }
    }

    // On voice selection change
    voiceSelect.addEventListener("change", () => {
        const voices = speechSynthesis.getVoices();
        selectedVoice = voices[voiceSelect.value];
    });

    // Refresh voice list
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // Handle form submit
    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = "";

        // Typing message
        const typingMsg = document.createElement("div");
        typingMsg.classList.add("message", "bot-message");
        typingMsg.innerHTML = `<div class="message-content"><p><em>Typing...</em></p></div>`;
        chatMessages.appendChild(typingMsg);
        scrollToBottom();

        // Fetch response from server
        fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `user_input=${encodeURIComponent(message)}`
        })
            .then(response => response.json())
            .then(data => {
                typingMsg.remove();
                const botMessage = data.answer || "I didn't understand that.";
                const time = data.time || "Just now";
                addMessage(botMessage, false, time);
                speakText(botMessage);
            })
            .catch(error => {
                console.error("Error:", error);
                typingMsg.remove();
                addMessage("Sorry, I'm having trouble connecting to the server.", false);
            });
    });

    // Clear Chat
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            chatMessages.innerHTML = "";
        });
    }

    // Save Chat
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            let content = "";
            document.querySelectorAll(".message").forEach(msg => {
                const role = msg.classList.contains("user-message") ? "You" : "Bot";
                const text = msg.querySelector(".message-content").innerText.trim();
                const time = msg.querySelector(".message-time").innerText.trim();
                content += `[${time}] ${role}: ${text}\n`;
            });

            const blob = new Blob([content], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "chat.txt";
            link.click();
        });
    }

    // Copy message on click (toast instead of alert)
    chatMessages.addEventListener("click", (e) => {
        const msg = e.target.closest(".message-content");
        if (msg) {
            navigator.clipboard.writeText(msg.innerText);
            showToast("Copied to clipboard!");
        }
    });

    // Toast message function
    function showToast(message) {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.right = "20px";
        toast.style.background = "#444";
        toast.style.color = "#fff";
        toast.style.padding = "8px 12px";
        toast.style.borderRadius = "5px";
        toast.style.zIndex = "1000";
        toast.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // Auto-scroll on load and on new messages
    scrollToBottom();
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(chatMessages, { childList: true });
});
