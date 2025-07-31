document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user_input");
    const clearBtn = document.getElementById("clear-chat-btn");
    const saveBtn = document.getElementById("save-chat-btn");
    const voiceSelect = document.getElementById("voiceSelect");
    const micBtn = document.getElementById("mic-btn");
    const voiceToggleBtn = document.getElementById("voice-toggle-btn");
    const voiceIcon = document.getElementById("voice-icon");

    let selectedVoice = null;
    let isSpeaking = false;
    let isRecording = false;
    let recognition = null;
    let voiceEnabled = true;
    const synth = window.speechSynthesis;
    let currentUtterance = null;

    window.toggleVoiceDropdown = function () {
        const dropdown = document.getElementById("voiceDropdown");
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    };

    window.setSelectedVoice = function (el) {
        const voices = speechSynthesis.getVoices();
        const index = parseInt(el.value);
        selectedVoice = voices[index];
    };

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function addMessage(content, isUser, time = getCurrentTime()) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", isUser ? "user-message" : "bot-message");

        const messageContent = document.createElement("div");
        messageContent.classList.add("message-content");
        if (!isUser) messageContent.classList.add("animate-fade");
        messageContent.innerHTML = `<p>${content}</p>`;

        const messageTime = document.createElement("div");
        messageTime.classList.add("message-time");
        messageTime.textContent = time;

        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        chatMessages.appendChild(messageDiv);

        scrollToBottom();
    }

    function speakText(text) {
        if (!voiceEnabled) return;

        stopSpeaking();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        isSpeaking = true;
        currentUtterance = utterance;

        utterance.onend = () => {
            isSpeaking = false;
            currentUtterance = null;
        };

        synth.speak(utterance);
    }

    function stopSpeaking() {
        if (synth.speaking || isSpeaking) {
            synth.cancel();
            isSpeaking = false;
            currentUtterance = null;
        }
    }

    function startRecording() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech Recognition not supported');
            return;
        }

        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => isRecording = true;
        recognition.onend = () => isRecording = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            chatForm.dispatchEvent(new Event('submit'));
        };

        recognition.start();
    }

    function stopRecording() {
        if (recognition) {
            recognition.stop();
            isRecording = false;
        }
    }

    if (micBtn) {
        micBtn.addEventListener("click", () => {
            if (isSpeaking || synth.speaking) {
                stopSpeaking();
                return;
            }

            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });
    }

    function populateVoiceList() {
        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = '<option disabled selected hidden>Select voice</option>';

        voices.forEach((voice, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });

        const preferredVoice = voices.find(v =>
            v.name.toLowerCase().includes("female") ||
            v.name.includes("Google US English") ||
            v.name.includes("Microsoft Zira") ||
            v.name.includes("Samantha")
        );

        const defaultIndex = voices.indexOf(preferredVoice);
        if (defaultIndex !== -1) {
            voiceSelect.selectedIndex = defaultIndex + 1;
            selectedVoice = voices[defaultIndex];
        }
    }

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    populateVoiceList();

    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        stopSpeaking();
        stopRecording();

        addMessage(message, true);
        userInput.value = "";

        const typingMsg = document.createElement("div");
        typingMsg.classList.add("message", "bot-message");
        typingMsg.innerHTML = `<div class="message-content"><p><em>Responding...</em></p></div>`;
        chatMessages.appendChild(typingMsg);
        scrollToBottom();

        fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user_input=${encodeURIComponent(message)}`
        })
            .then(response => response.json())
            .then(data => {
                typingMsg.remove();
                const botMessage = data.answer || "I didn't understand that.";
                addMessage(botMessage, false);
                speakText(botMessage);
            })
            .catch(error => {
                console.error("Error:", error);
                typingMsg.remove();
                addMessage("Sorry, I'm having trouble connecting to the server.", false);
            });
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            chatMessages.innerHTML = "";
            stopSpeaking();
            stopRecording();
        });
    }

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

    chatMessages.addEventListener("click", (e) => {
        const msg = e.target.closest(".message-content");
        if (msg) {
            navigator.clipboard.writeText(msg.innerText);
            showToast("Copied to clipboard!");
        }
    });

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

    // 🔊 Voice Toggle Icon Logic
    if (voiceToggleBtn && voiceIcon) {
        voiceToggleBtn.addEventListener("click", () => {
            voiceEnabled = !voiceEnabled;

            if (!voiceEnabled && synth.speaking) {
                stopSpeaking();
            }

            voiceIcon.classList.toggle("fa-volume-up", voiceEnabled);
            voiceIcon.classList.toggle("fa-volume-mute", !voiceEnabled);
        });
    }

    scrollToBottom();
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(chatMessages, { childList: true });
});
