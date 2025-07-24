from assistant.query_generator import Query_generator
from assistant.db import execute_query
from assistant.generate_answer import generate_answer
from assistant.db import generate_schema


def process_question(user_input: str) -> str:
    print("[Debug] Received input:", user_input)
    generate_schema()
    query = Query_generator(user_input)
    result = execute_query(query)
    answer = generate_answer(user_input, result)
    print("generated result:", result)
    return answer