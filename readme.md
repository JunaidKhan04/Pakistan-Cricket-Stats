# 🏏 Pakistan Cricket Chatbot (LLM Powered)

This is an AI-powered chatbot that allows users to ask natural language questions about Pakistan cricket player statistics. It uses a Large Language Model (LLaMA via Groq API), the Transformers library, and a MySQL database to generate and execute SQL queries based on user questions.

---

## 📁 Project Structure

```
chat-bot/
│
├── app.py                  # Main FastAPI/Flask/Streamlit app (depends on framework)
├── main.py                 # Core chatbot logic
├── assistant/              # May include model logic or helper functions
├── static/                 # CSS/JS files (if using HTML frontend)
├── templates/index.html    # Chat interface (HTML frontend)
├── Imad_database.sql       # MySQL database schema and data
├── schema.json             # (Optional) JSON schema of DB for LLM context
├── requirements.txt        # Python dependencies
├── .env                    # API keys and DB credentials (Groq API, DB URL, etc.)
└── README.md               # Project overview and setup instructions
```

---

## 🚀 Features

- Natural Language to SQL using LLaMA model via Groq API
- Connects to MySQL Workbench database
- Returns actual query results (not just SQL text)
- Web interface using HTML/Streamlit/FastAPI
- Works for ODI, T20, and Test player stats

---

## 🧠 Technologies Used

- [Python 3.10+](https://www.python.org/)
- [Transformers](https://huggingface.co/docs/transformers/)
- [Groq API](https://console.groq.com/)
- [LLaMA Model](https://huggingface.co/meta-llama/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/)
- [Streamlit](https://streamlit.io/) or Flask/FastAPI (depends on your `app.py` setup)

---

## 🛠️ Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd chat-bot
   ```

2. **Create and activate virtual environment**

   ```bash
   python -m venv .venv
   source .venv/bin/activate      # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   Create a `.env` file:

   ```
   GROQ_API_KEY=your_groq_api_key
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=yourpassword
   MYSQL_DATABASE=pakistan_cricket_stats
   ```

5. **Set up the database**

   Open MySQL Workbench and run:

   ```sql
   SOURCE Imad_database.sql;
   ```

6. **Run the app**

   If using Streamlit:

   ```bash
   streamlit run app.py
   ```

   If using Flask/FastAPI:

   ```bash
   python app.py
   ```

---

## 🧪 Example Questions

- `Show Babar Azam's stats in T20`
- `Who took the most wickets in 2019?`
- `How many ODI matches did Afridi play?`

---

## 🤝 Credits

Created by [Your Name] using data from Pakistan Cricket Stats DB and Groq LLaMA models.

---

## 📜 License

MIT License - free to use and modify.
