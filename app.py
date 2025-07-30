from flask import Flask, render_template, request, jsonify
from main import process_question
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Home page
@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

# Chat endpoint for AJAX POST from frontend
@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.form['user_input']  # Gets the user message from JS
    print("[Debug] Flask received:", user_input)

    answer = process_question(user_input)     # Generates the bot's reply
    print("[Debug] LLM answered:", answer)

    time = datetime.now().strftime("%H:%M")   # Timestamp for frontend
    return jsonify({"answer": answer, "time": time})

# Run locally (optional for Render; not used in production)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
