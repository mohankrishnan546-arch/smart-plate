import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print(f"Testing with key: {api_key[:10]}...")

try:
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Hi")
    print(f"Result: {response.text.strip()}")
except Exception as e:
    print(f"Error: {e}")
