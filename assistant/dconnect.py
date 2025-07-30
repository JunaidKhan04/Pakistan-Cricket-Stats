import os
from dotenv import load_dotenv
import mysql.connector

# Load environment variables from .env file in the current directory
load_dotenv()

try:
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        port=int(os.getenv('DB_PORT')),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    conn.ping(reconnect=True, attempts=3, delay=2)
    print("Database connection successful!")
    conn.close()
except Exception as e:
    print("Database connection failed:", e)
