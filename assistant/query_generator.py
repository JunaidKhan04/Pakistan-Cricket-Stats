import os
import json
from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_groq import ChatGroq
from assistant.memory import memory
from dotenv import load_dotenv


load_dotenv()


chat = ChatGroq(
    temperature=0.7,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama3-70b-8192",
    max_tokens=500
)

def Query_generator(input):
    with open("schema.json", "r") as f:
        schema = json.load(f)

    system_message = SystemMessagePromptTemplate.from_template(
        "You are an expert assistant that helps users query information from a Pakistan Cricket Stats database. "
        "You are also a highly accurate SQL generator that must strictly follow these instructions:\n\n"
        
        "1. You MUST return only a valid SQL SELECT query — no text, no explanations, no markdown formatting.\n"
        "2. The SQL must be syntactically correct and safe.\n"
        "3. Use only the following schema: {schema}\n"
        "4. NEVER include destructive operations (CREATE, ALTER, DROP, DELETE, etc.).\n"
        "5. Do NOT wrap your output in markdown blocks like ```sql or ```.\n"

        "If the user's request is unsafe or cannot be fulfilled, respond exactly with: "
        "\"Sorry, I am not allowed to perform that operation.\"\n\n"
        
        "Again, ONLY return a syntactically correct SQL SELECT query."
         ).format(schema=schema)


    human_message = HumanMessagePromptTemplate.from_template("{input}")

    prompt = ChatPromptTemplate.from_messages([system_message, human_message])
    llm_chain = LLMChain(llm=chat, prompt=prompt, memory=memory)
    query = llm_chain.run(input)
    cleaned_query = query.replace("```", "").replace("\n", " ").strip()
    return cleaned_query

