from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

#api
from groq import Groq
import os #to read env
from dotenv import load_dotenv #find env


load_dotenv() #load env
client=Groq(api_key=os.getenv("groqapikey")) 



app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    name: str
    age: int

class chatMessage(BaseModel):
    text:str
    style:str

@app.get("/")
def home():
    return {"message": "hi"}
@app.get("/greet/{name}")
def greet(name: str):  #path parameter
    return {"message": f"Hello, {name}!"}

@app.get("/search")  #query parameter
def search(q: str = "", limit: int = 10):
    return {"query": q, "limit": limit}

@app.post("/users")
def create_user(user: User):
    return {"message": f"User {user.name} created, age {user.age}"}

@app.put("/users/{user_id}")
def update_user(user_id: int, user: User):
    return {"message": f"User {user_id} updated to {user.name}, age {user.age}"}

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    return {"message": f"User {user_id} deleted"}

#grok api answers
@app.post("/chat")
def chat(message: chatMessage):
    system_prompt = (
        "You are Solace, a warm and compassionate emotional support companion. "
        "You are not a therapist and don't give medical advice. ")
    if message.style == "brief":
        system_prompt += "Keep your reply short — 2 to 3 sentences max."
    else:
        system_prompt += "Give a thoughtful, detailed, in-depth reply."
    reply= f"i hear you say '{message.text}' Tell me More."
    completion = client.chat.completions.create(   #this funct requests and gets response
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message.text},
        ],
        temperature=0.5,
        max_tokens=600,
    )
    return {"reply": completion.choices[0].message.content}
