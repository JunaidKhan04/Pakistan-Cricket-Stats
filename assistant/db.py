import os
import json
import mysql.connector
from dotenv import load_dotenv
from langchain_community.utilities import SQLDatabase

load_dotenv()

# Config from .env
config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME')
}

# ✅ Function to generate schema and write to file
def generate_schema():
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()

    query = """
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = %s
    ORDER BY table_name, ordinal_position
    """

    cursor.execute(query, (config['database'],))
    results = cursor.fetchall()

    schema = {}
    for table_name, column_name, data_type in results:
        schema.setdefault(table_name, []).append(column_name)

    with open("schema.json", "w") as f:
        json.dump(schema, f, indent=2)

    cursor.close()
    conn.close()

    return schema

# ✅ LangChain SQLDatabase object
def get_db():
    return SQLDatabase.from_uri(
        f"mysql+mysqlconnector://{config['user']}:{config['password']}@{config['host']}/{config['database']}"
    )

# ✅ Missing function (manually execute queries)
def execute_query(query):
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()

    try:
        cursor.execute(query)
        results = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in results]
    except mysql.connector.Error as err:
        return f"MySQL Error: {err}"
    finally:
        cursor.close()
        conn.close()

