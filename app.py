from flask import Flask, render_template, request, jsonify
from main import process_question
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.form['user_input']
    print("[Debug] Flask received:", user_input)
    answer = process_question(user_input)
    print("[Debug] LLM answered:", answer)
    time = datetime.now().strftime("%H:%M")
    print(answer)
    return jsonify({"answer": answer, "time": time})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
