
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from groq import Groq
from gtts import gTTS
import os
import base64
import time
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)
CORS(app)



# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

if not GROQ_API_KEY:
    raise ValueError("⚠️ GROQ_API_KEY not found! Please add it to your .env file")
client = Groq(api_key=GROQ_API_KEY)


# ===== ROUTE: Serve the main page =====
@app.route('/')
def index():
    return render_template('index.html')


# ===== ROUTE: Get AI response =====
@app.route('/get-response', methods=['POST'])
def get_response():
    try:
        data = request.json
        user_message = data.get('message', '')
        print(f"💬 User message: {user_message}")
        
        # Get AI response from Groq
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": """You are Sal7a (صلاحة), a friendly Tunisian AI productivity assistant created by Imen Jouini. 
                    
                    Your personality:
                    - Warm and helpful, with a slight Tunisian charm
                    - Professional but friendly
                    - Occasionally use "Marhba" (welcome) or "Inshallah" (God willing) naturally
                    - Proud of being Tunisian and created by a Tunisian developer
                    
                    Keep responses conversational and concise, under 3 sentences."""
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=150
        )
        
        response_text = chat_completion.choices[0].message.content
        print(f"🤖 AI response: {response_text}")
        
        return jsonify({
            'success': True,
            'response': response_text
        })
        
    except Exception as e:
        print(f"❌ AI error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        })
# ===== ROUTE: Convert text to speech =====
@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    try:
        data = request.json
        text = data.get('text', '')
        print(f"🔊 Converting to speech: {text[:50]}...")
        
        # Generate speech
        tts = gTTS(text=text, lang='en', slow=False)
        
        # Save to temporary file
        filename = f'temp_speech_{int(time.time())}.mp3'
        tts.save(filename)
        
        # Read file and convert to base64
        with open(filename, 'rb') as audio_file:
            audio_data = base64.b64encode(audio_file.read()).decode('utf-8')
        
        # Clean up
        os.remove(filename)
        
        print("✅ Speech generated successfully")
        
        return jsonify({
            'success': True,
            'audio': audio_data
        })
        
    except Exception as e:
        print(f"❌ TTS error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        })


# ===== START SERVER =====
if __name__ == '__main__':
    print("=" * 50)
    print("🌐 Voice Assistant Web Server")
    print("=" * 50)
    print("📍 Open your browser and go to:")
    print("   http://localhost:5000")
    print("=" * 50)
    print("💡 Make sure to use Chrome or Edge browser!")
    print("=" * 50)
    app.run(debug=True, port=5000)