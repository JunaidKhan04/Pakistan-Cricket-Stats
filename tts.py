# assistant/tts.py
import pyttsx3

# Initialize the TTS engine
engine = pyttsx3.init()

# Optional: Set voice properties
engine.setProperty('rate', 150)  # Speed (words per minute)
engine.setProperty('volume', 1)  # Volume (0.0 to 1.0)

def speak(text):
    """Speak the given text aloud."""
    if text:
        engine.say(text)
        engine.runAndWait()
