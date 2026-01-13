// ===== GLOBAL VARIABLES =====
const micButton = document.getElementById('micButton');
const status = document.getElementById('status');
const chatContainer = document.getElementById('chatContainer');
const audioPlayer = document.getElementById('audioPlayer');

let isListening = false;
let recognition = null;

// Check if browser supports speech recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    console.log('✅ Speech recognition available!');
} else {
    console.error('❌ Speech recognition not supported in this browser');
    alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
}

// ===== FUNCTION: Add message to chat =====
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${text}</p>`;
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ===== FUNCTION: Add typing indicator =====
function addTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.id = 'typingIndicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ===== FUNCTION: Remove typing indicator =====
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// ===== FUNCTION: Update status =====
function updateStatus(text, className = '') {
    status.textContent = text;
    status.className = 'status ' + className;
}

// ===== FUNCTION: Get AI response and speak it =====
async function getAIResponse(userText) {
    try {
        // Add user message to chat
        addMessage(userText, true);
        
        // Show typing indicator
        addTypingIndicator();
        updateStatus('🤖 Thinking...', 'thinking');
        
        // Get AI response
        const aiResponse = await fetch('/get-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userText })
        });
        
        const aiData = await aiResponse.json();
        console.log('AI response:', aiData);
        
        if (!aiData.success) {
            throw new Error(aiData.error || 'AI response failed');
        }
        
        const responseText = aiData.response;
        
        // Remove typing indicator and add response
        removeTypingIndicator();
        addMessage(responseText, false);
        
        // Convert response to speech
        updateStatus('🔊 Speaking...', 'speaking');
        
        const ttsResponse = await fetch('/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: responseText })
        });
        
        const ttsData = await ttsResponse.json();
        
        if (!ttsData.success) {
            throw new Error(ttsData.error || 'Text-to-speech failed');
        }
        
        // Play audio
        const audioSrc = 'data:audio/mp3;base64,' + ttsData.audio;
        audioPlayer.src = audioSrc;
        audioPlayer.play();
        
        audioPlayer.onended = () => {
            updateStatus('Ready', '');
        };
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessage('Sorry, something went wrong: ' + error.message, false);
        updateStatus('Ready', '');
    }
}

// ===== SPEECH RECOGNITION HANDLERS =====

if (recognition) {
    recognition.onstart = () => {
        console.log('Speech recognition started');
        isListening = true;
        micButton.classList.add('listening');
        micButton.querySelector('.mic-text').textContent = 'Listening...';
        updateStatus('🎤 Listening...', 'listening');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized:', transcript);
        getAIResponse(transcript);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        micButton.classList.remove('listening');
        micButton.querySelector('.mic-text').textContent = 'Tap to speak';
        
        if (event.error === 'no-speech') {
            updateStatus('No speech detected', '');
            addMessage('I didn\'t hear anything. Please try again.', false);
        } else if (event.error === 'not-allowed') {
            updateStatus('Microphone access denied', '');
            alert('Please allow microphone access to use voice features.');
        } else {
            updateStatus('Error: ' + event.error, '');
        }
    };
    
    recognition.onend = () => {
        console.log('Speech recognition ended');
        isListening = false;
        micButton.classList.remove('listening');
        micButton.querySelector('.mic-text').textContent = 'Tap to speak';
    };
}

// ===== EVENT LISTENERS =====

// Microphone button click
micButton.addEventListener('click', () => {
    if (!recognition) {
        alert('Speech recognition not supported. Please use Chrome or Edge.');
        return;
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        try {
            recognition.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
        }
    }
});

// Spacebar shortcut
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isListening && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                console.error('Error starting recognition:', e);
            }
        }
    }
});

// ===== INITIALIZATION =====
console.log('🎉 Voice Assistant UI loaded!');
console.log('Click the microphone or press spacebar to speak');