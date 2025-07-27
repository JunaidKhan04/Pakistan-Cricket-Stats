from langchain.prompts import PromptTemplate
from assistant.query_generator import chat
from assistant.memory import memory

def generate_answer(question, result):
    # Greet if user input is just a greeting
    greetings = ["hi", "hello", "hey", "salam", "assalamualaikum"]
    if question.lower().strip() in greetings:
        response = "Hello! I'm your Cricket Stats Bot. Ask me anything about Pakistan cricket stats!"
        memory.save_context({"input": question}, {"output": response})
        return response

    # Continue normally if not a greeting
    conversational_prompt = PromptTemplate.from_template(
        "You are a smart and friendly Cricket assistant chatbot.\n"
        "Use the conversation history and the database result to generate a helpful and concise response.\n\n"
        "RULES:\n"
        "1. Do NOT use Markdown formatting (like *, -, or ```).\n"
        "2. Display statistics in a clear and readable format (e.g., 11,701 runs, 254 wickets).\n"
        "3. Avoid generic phrases like 'Let me check' or 'Here's the result again'.\n"
        "4. Focus strictly on answering the user's question with relevant stats.\n"
        "5. Use full player names where possible, not just IDs.\n\n"
        "Conversation History:\n{history}\n\n"
        "User Question: {question}\n"
        "Database Result: {result}\n\n"
        "Answer:"
    )

    prompt = conversational_prompt.format(
        history=memory.load_memory_variables({})["history"],
        question=question,
        result=result
    )

    response = chat.invoke(prompt)
    memory.save_context({"input": question}, {"output": response.content})
    return response.content
