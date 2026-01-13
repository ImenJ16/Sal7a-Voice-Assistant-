# Import libraries
import speech_recognition as sr
from groq import Groq
from gtts import gTTS
import os
import pygame
import time
from dotenv import load_dotenv




load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

if not GROQ_API_KEY:
    raise ValueError("⚠️ GROQ_API_KEY not found! Please add it to your .env file")

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

# Initialize speech recognizer
recognizer = sr.Recognizer()

# Initialize pygame mixer for audio playback
pygame.mixer.init()


# ===== FUNCTION: Make assistant speak using Google TTS =====
def speak(text):
    """
    Converts text to speech using Google's TTS and plays it
    """
    print(f"\nAssistant: {text}")
    print("🔊 Speaking...")
    
    try:
        # Generate speech using Google TTS
        tts = gTTS(text=text, lang='en', slow=False)
        
        # Save to temporary file with unique name
        filename = f"temp_speech_{int(time.time())}.mp3"
        tts.save(filename)
        print(f"✅ Audio file created: {filename}")
        
        # Small delay to ensure file is written
        time.sleep(0.2)
        
        # Play the audio using pygame
        pygame.mixer.music.load(filename)
        pygame.mixer.music.play()
        print("▶️  Playing audio...")
        
        # Wait for the audio to finish playing
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
        
        print("✅ Audio finished playing")
        
        # Stop and unload before deleting
        pygame.mixer.music.stop()
        pygame.mixer.music.unload()
        
        # Small delay before deletion
        time.sleep(0.2)
        
        # Delete temporary file
        if os.path.exists(filename):
            os.remove(filename)
            print(f"🗑️  Deleted temp file: {filename}")
        
    except Exception as e:
        print(f"❌ Speech error: {e}")
        print(f"Error details: {type(e).__name__}")


# ===== FUNCTION: Listen to user =====
def listen():
    """
    Listens to microphone and converts speech to text
    """
    with sr.Microphone() as source:
        print("\n🎤 Listening... Speak now!")
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        
        try:
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            print("🔄 Processing your speech...")
            
            text = recognizer.recognize_google(audio)
            print(f"You said: {text}")
            return text
            
        except sr.WaitTimeoutError:
            print("❌ No speech detected. Please try again.")
            return None
            
        except sr.UnknownValueError:
            print("❌ Sorry, I couldn't understand that.")
            return None
            
        except sr.RequestError:
            print("❌ Could not connect to speech recognition service.")
            return None


# ===== FUNCTION: Get AI response =====
def get_ai_response(user_input):
    """
    Sends question to Groq AI and gets response
    """
    try:
        print("🤖 Sending request to AI...")
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful voice assistant. Keep responses SHORT and conversational, maximum 2 sentences."
                },
                {
                    "role": "user",
                    "content": user_input
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=100  # Reduced for shorter responses
        )
        
        response = chat_completion.choices[0].message.content
        print(f"✅ AI response received: {response[:50]}...")
        return response
        
    except Exception as e:
        print(f"❌ Error getting AI response: {e}")
        return "Sorry, I'm having trouble thinking right now."


# ===== MAIN PROGRAM =====
def main():
    """
    Main function that runs the voice assistant
    """
    print("\n" + "="*50)
    print("Starting initial greeting...")
    print("="*50 + "\n")
    
    speak("Hello! I'm your voice assistant. How can I help you?")
    
    while True:
        user_input = listen()
        
        if user_input is None:
            continue
        
        if "exit" in user_input.lower() or "quit" in user_input.lower() or "stop" in user_input.lower():
            speak("Goodbye! Have a great day!")
            break
        
        print("\n" + "="*50)
        print("Getting AI response...")
        print("="*50)
        
        response = get_ai_response(user_input)
        
        print("\n" + "="*50)
        print("Speaking response...")
        print("="*50)
        
        speak(response)


# ===== START PROGRAM =====
if __name__ == "__main__":
    print("=" * 50)
    print(" VOICE ASSISTANT STARTED")
    print("=" * 50)
    print("Say 'exit', 'quit', or 'stop' to end")
    print("=" * 50)
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n  Program interrupted by user")
    finally:
        # Cleanup any remaining temp files
        for file in os.listdir('.'):
            if file.startswith('temp_speech_') and file.endswith('.mp3'):
                try:
                    os.remove(file)
                    print(f"🗑️  Cleaned up: {file}")
                except:
                    pass
        print("\n Voice assistant stopped")