#  Sal7a - صالحة
**Your Tunisian AI productivity sidekick that actually listens (literally)**

> Built with ❤️ by Imen Jouini


---

## What's This About?

Ever wanted to boss around your computer with just your voice? Meet Sal7a - she's a voice-controlled AI assistant I built that helps you stay productive without touching your keyboard. 
The whole thing runs in your browser, looks gorgeous with a glassmorphism design, and actually works (I promise I tested it... extensively).

---

## Cool Stuff You Can Do

**Just talk to her. Seriously.**

- "Add todo: buy groceries" → Boom, it's on your list
- "What's the weather in Tunis?" → She'll tell you (with simulated data for now, but hey)
- "Set timer for 25 minutes" → Perfect for Pomodoro sessions
- "Calculate 15% of 85000" → Because math is hard
- "Who are you?" → She'll introduce herself (she's pretty proud to be Tunisian)
- "Run demo" → Sit back and watch her show off

**The best part?** Your todos stick around even after you close the browser. Magic? No, just localStorage.

---

## Tech Stuff (For the Nerds)

I used:
- **Python Flask** for the backend (keeping it simple)
- **Groq's Llama 3.1** for the AI brain (totally free, no credit card nonsense)
- **Web Speech API** because Chrome already has speech recognition built-in
- **Google TTS** to make her talk back
- **Vanilla JavaScript** - no frameworks, just pure code
- **Glassmorphism CSS** because 2024 called and said flat design is over

**Why these choices?**
- Everything's free 
- No credit cards needed anywhere
- Works entirely in your browser
- Looks way better than it has any right to

---

## Getting Started

### What You'll Need
- Python 3.11 or newer
- Chrome or Edge (Firefox doesn't play nice with voice stuff)
- A Groq API key (it's free, takes 2 minutes to get)

### Installation (The Easy Way)

1. **Grab the code**

   git clone https://github.com/ImenJ16/Sal7a-Voice-Assistant-.git
   cd Sal7a-Voice-Assistant-


2. **Install the Python stuff**

   pip install flask flask-cors groq gTTS python-dotenv


3. **Get your API key**
   - Head to [console.groq.com](https://console.groq.com)
   - Sign up (just email, no credit card)
   - Create an API key
   - Copy it

4. **Set up your environment**
   - Copy `.env.example` to `.env`
   - Paste your API key in there:

     GROQ_API_KEY=your-actual-key-here


5. **Fire it up**

   python server.py


6. **Open your browser**
   - Go to `http://localhost:5000`
   - Click the microphone
   - Start talking!

---

## Voice Commands Cheat Sheet

**Personal Questions:**
- "Who are you?"
- "Who created you?"
- "What does your name mean?"

**Todo List:**
- "Add todo: [whatever you need to do]"
- "Show my todos"
- "Check todo 1" (marks it done)
- "Delete todo 2"
- "Clear completed"
- "Export my todos"

**Utilities:**
- "What's the weather in [city]?"
- "Set timer for 5 minutes"
- "Calculate 20% of 150"

**Meta:**
- "Run demo" (watch her flex)
- "Help" (she'll explain what she can do)

---


I learned a ton about voice APIs, glassmorphism, and why you should NEVER hardcode API keys (GitHub will yell at you).

---

## Known Issues (AKA "Features")

- Weather data is currently simulated (working on integrating a real API)
- Speech recognition needs a good microphone (your laptop's built-in mic might struggle)
- She only speaks English for now (Arabic support coming... eventually)

## Want to Contribute?

Got ideas? Found bugs? Want to add features? Pull requests are welcome! Just:
1. Fork it
2. Create a feature branch
3. Make your changes
4. Test it (please)
5. Submit a PR

## What's Next?

Things I want to add:
- [ ] Real weather API integration
- [ ] Arabic language support
- [ ] Google Calendar integration
- [ ] Custom wake word ("Hey Sal7a...")

---

## Tech Details for Resume Padding

**APIs Used:**
- Groq API (AI inference)
- Web Speech API (voice recognition)
- Google TTS (text-to-speech)
- LocalStorage API (data persistence)

**Skills Demonstrated:**
- Full-stack development (Python + JavaScript)
- API integration and authentication
- Voice interface design
- Real-time data processing
- Responsive UI/UX design
- State management
- Glassmorphism effects
- Git version control (the hard way)

---


## Credits

**Created by:** Imen Jouini  
**Year:** 2026  
**Mood while coding:** Caffeinated and determined  
**Hours spent debugging voice recognition:** Too many  
**Satisfaction level now that it works:** 100%


**If this helped you or made you smile, drop a star!**

**Questions? Open an issue. I actually read them.**