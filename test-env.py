from dotenv import load_dotenv
import os

load_dotenv()

key = os.getenv('GROQ_API_KEY')

if key:
    print(f"✅ API Key found: {key[:10]}...{key[-10:]}")
else:
    print("❌ API Key NOT found!")
    
print(f"\nCurrent directory: {os.getcwd()}")
print(f".env file exists: {os.path.exists('.env')}")