// ===== WAIT FOR DOM TO LOAD =====
document.addEventListener('DOMContentLoaded', function() {

// ===== GLOBAL VARIABLES =====
const micButton = document.getElementById('micButton');
const status = document.getElementById('status');
const chatContainer = document.getElementById('chatContainer');
const audioPlayer = document.getElementById('audioPlayer');
const demoButton = document.getElementById('demoButton');

// Widget elements
const todoList = document.getElementById('todoList');
const weatherWidget = document.getElementById('weatherWidget');
const timerWidget = document.getElementById('timerWidget');
const calculatorWidget = document.getElementById('calculatorWidget');

// Debug - check if elements exist
console.log('micButton:', micButton);
console.log('demoButton:', demoButton);

if (!micButton) {
    console.error('❌ Microphone button not found!');
    return;
}

let isListening = false;
let recognition = null;
let todos = [];
let timerInterval = null;
let timerSeconds = 0;

// ===== INITIALIZATION =====
// Load todos from localStorage
loadTodos();

// Check if browser supports speech recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    console.log('✅ Speech recognition available!');
} else {
    console.error('❌ Speech recognition not supported');
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
    if (indicator) indicator.remove();
}

// ===== FUNCTION: Update status =====
function updateStatus(text, className = '') {
    status.textContent = text;
    status.className = 'status ' + className;
}

// ===== TODO FUNCTIONS =====

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
        todos = JSON.parse(saved);
        renderTodos();
    }
}

function addTodo(text) {
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    todos.unshift(todo);
    saveTodos();
    renderTodos();
    return todo;
}

// Make functions globally accessible for onclick handlers
window.toggleTodo = function(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
};

window.deleteTodo = function(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
};

function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

function renderTodos() {
    if (todos.length === 0) {
        todoList.innerHTML = '<p class="empty-state">No todos yet. Say "Add todo: [your task]"</p>';
        return;
    }
    
    todoList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" 
                   class="todo-checkbox" 
                   ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})">
            <span class="todo-text">${todo.text}</span>
            <button class="todo-delete" onclick="deleteTodo(${todo.id})">×</button>
        </div>
    `).join('');
}

function exportTodos() {
    const text = todos.map((t, i) => 
        `${i + 1}. [${t.completed ? 'X' : ' '}] ${t.text}`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// ===== WEATHER FUNCTIONS =====

async function getWeather(city) {
    try {
        const data = {
            name: city,
            main: {
                temp: Math.floor(Math.random() * 30) + 10,
                feels_like: Math.floor(Math.random() * 30) + 10,
                humidity: Math.floor(Math.random() * 40) + 40
            },
            weather: [{
                description: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)]
            }],
            wind: {
                speed: (Math.random() * 10 + 5).toFixed(1)
            }
        };
        
        return data;
    } catch (error) {
        console.error('Weather API error:', error);
        return null;
    }
}

function displayWeather(data) {
    if (!data) {
        weatherWidget.style.display = 'none';
        return;
    }
    
    weatherWidget.style.display = 'block';
    document.getElementById('weatherContent').innerHTML = `
        <div class="weather-location">${data.name}</div>
        <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
        <div class="weather-description">${data.weather[0].description}</div>
        <div class="weather-details">
            <div class="weather-detail">
                <div class="weather-detail-label">Feels Like</div>
                <div class="weather-detail-value">${Math.round(data.main.feels_like)}°C</div>
            </div>
            <div class="weather-detail">
                <div class="weather-detail-label">Humidity</div>
                <div class="weather-detail-value">${data.main.humidity}%</div>
            </div>
            <div class="weather-detail">
                <div class="weather-detail-label">Wind Speed</div>
                <div class="weather-detail-value">${data.wind.speed} km/h</div>
            </div>
        </div>
    `;
}

// ===== TIMER FUNCTIONS =====

function startTimer(minutes) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerSeconds = minutes * 60;
    timerWidget.style.display = 'block';
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            playTimerSound();
            addMessage("⏰ Timer finished!", false);
            speak("Your timer is finished!");
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        addMessage("Timer paused", false);
    } else if (timerSeconds > 0) {
        startTimer(timerSeconds / 60);
        addMessage("Timer resumed", false);
    }
}

function cancelTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerSeconds = 0;
    timerWidget.style.display = 'none';
    addMessage("Timer cancelled", false);
}

function playTimerSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ===== CALCULATOR FUNCTIONS =====

function calculate(expression) {
    try {
        const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
        const result = Function(`"use strict"; return (${sanitized})`)();
        
        calculatorWidget.style.display = 'block';
        document.getElementById('calculatorResult').innerHTML = `
            <div class="calculator-expression">${expression}</div>
            <div class="calculator-answer">= ${result}</div>
        `;
        
        return result;
    } catch (error) {
        calculatorWidget.style.display = 'block';
        document.getElementById('calculatorResult').innerHTML = `
            <div class="calculator-expression">${expression}</div>
            <div class="calculator-answer" style="color: #e74c3c;">Error</div>
        `;
        return null;
    }
}

// ===== COMMAND PROCESSING =====

async function processCommand(text) {
    console.log('🔍 processCommand called with:', text);
    const lowerText = text.toLowerCase();
    console.log('🔍 Lowercase text:', lowerText);
    
    // Add todo
    if (lowerText.includes('add to do') || lowerText.includes('add task')) {
        console.log('✅ Matched add to do command!');
        const todoText = text.replace(/add (to do|task):?/i, '').trim();
        console.log('📝 Extracted todo text:', todoText);
        
        if (todoText) {
            console.log('➕ Adding todo:', todoText);
            addTodo(todoText);
            console.log('✅ Todo added! Current todos:', todos);
            return `Added todo: "${todoText}"`;
        }
        return "Please specify what todo to add. Say 'Add todo: your task here'";
    }
    
    // Show todos
    if (lowerText.includes('show') && (lowerText.includes('todo') || lowerText.includes('task'))) {
        console.log('📋 Show todos command');
        if (todos.length === 0) {
            return "You don't have any todos yet.";
        }
        const count = todos.filter(t => !t.completed).length;
        return `You have ${count} pending ${count === 1 ? 'todo' : 'todos'}.`;
    }
    
    // Complete todo
    if (lowerText.includes('complete') && lowerText.includes('todo')) {
        const match = text.match(/\d+/);
        if (match && todos[parseInt(match[0]) - 1]) {
            const index = parseInt(match[0]) - 1;
            todos[index].completed = true;
            saveTodos();
            renderTodos();
            return `Marked todo ${match[0]} as complete!`;
        }
        return "Please specify which todo number to complete.";
    }
    
    // Weather
    if (lowerText.includes('weather')) {
        console.log('🌤️ Weather command');
        const cityMatch = text.match(/weather (?:in |for )?(.+)/i);
        if (cityMatch) {
            const city = cityMatch[1].trim();
            const weather = await getWeather(city);
            if (weather) {
                displayWeather(weather);
                return `The weather in ${weather.name} is ${weather.weather[0].description} with a temperature of ${Math.round(weather.main.temp)} degrees celsius.`;
            }
            return `Sorry, I couldn't find weather information for ${city}.`;
        }
        return "Please specify a city. Say 'What's the weather in [city]?'";
    }
    
    // Timer
    if (lowerText.includes('timer') || lowerText.includes('set timer')) {
        console.log('⏱️ Timer command');
        const match = text.match(/(\d+)\s*(minute|min|second|sec)/i);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            const minutes = unit.startsWith('min') ? value : value / 60;
            startTimer(minutes);
            return `Timer set for ${value} ${match[2]}${value !== 1 ? 's' : ''}!`;
        }
        return "Please specify the duration. Say 'Set timer for 5 minutes'";
    }
    
    // Calculator
    if (lowerText.includes('calculate') || lowerText.includes('what is') || lowerText.includes('what\'s')) {
        console.log('🔢 Calculator command');
        const mathMatch = text.match(/(?:calculate|what is|what's)\s+(.+)/i);
        if (mathMatch) {
            const expression = mathMatch[1].trim()
                .replace(/\bof\b/gi, '*')
                .replace(/\bpercent\b/gi, '/100*')
                .replace(/\btimes\b/gi, '*')
                .replace(/\bplus\b/gi, '+')
                .replace(/\bminus\b/gi, '-')
                .replace(/\bdivided by\b/gi, '/');
            
            const result = calculate(expression);
            if (result !== null) {
                return `The answer is ${result}`;
            }
            return "I couldn't calculate that. Please try again.";
        }
    }
    // Introduction & Personal Info
if (lowerText.includes('who are you') || 
    lowerText.includes('introduce yourself') || 
    lowerText.includes('tell me about yourself') ||
    lowerText.includes('what is your name') ||
    lowerText.includes('what\'s your name')) {
    console.log('👋 Introduction command');
    return "Hi! I'm Sal7a, your AI productivity assistant. I'm Tunisian, just like my creator Imen. She coded me to help you manage tasks, check weather, and stay productive. What can I help you with today?";
}

// Who created you
if (lowerText.includes('who created you') || 
    lowerText.includes('who made you') || 
    lowerText.includes('who built you') ||
    lowerText.includes('who coded you')) {
    console.log('👩‍💻 Creator question');
    return "I was created by Imen Jouini, a talented developer from Tunisia. She built me as a voice-controlled productivity assistant using Python, JavaScript, and AI. Pretty cool, right?";
}

// Where are you from
if (lowerText.includes('where are you from') || 
    lowerText.includes('your country') ||
    lowerText.includes('your ethnicity') ||
    lowerText.includes('are you tunisian')) {
    console.log('🇹🇳 Origin question');
    return "I'm Tunisian! My creator Imen is from Tunisia, and she gave me a Tunisian identity. Sal7a means 'prayer' in Tunisian Arabic. I'm proud to represent Tunisian innovation in AI!";
}

// What does your name mean
if (lowerText.includes('what does sal7a mean') || 
    lowerText.includes('what does your name mean') ||
    lowerText.includes('meaning of sal7a')) {
    console.log('📖 Name meaning question');
    return "Sal7a is Tunisian Arabic for 'prayer' or 'blessing'. Imen chose this name because I'm here to help and support you, like a blessing in your daily productivity. It's written with a 7 because that's how we write the Arabic letter ح in Latin script!";
}

    // Help/Commands
    if (lowerText.includes('help') || lowerText.includes('what can you do') || lowerText.includes('commands')) {
        console.log('❓ Help command');
        return "I can help you with: adding todos, checking weather, setting timers, and doing calculations. Try saying 'Add todo: finish project' or 'What's the weather in Paris?'";
    }
    
    // If no command matched, send to AI
    console.log('🤖 No command matched, sending to AI');
    return await getAIResponse(text);
}

// ===== AI RESPONSE FUNCTION =====

async function getAIResponse(userText) {
    try {
        const aiResponse = await fetch('/get-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });
        
        const aiData = await aiResponse.json();
        
        if (aiData.success) {
            return aiData.response;
        } else {
            throw new Error(aiData.error || 'AI response failed');
        }
    } catch (error) {
        console.error('AI Error:', error);
        return "Sorry, I'm having trouble thinking right now.";
    }
}

// ===== TEXT-TO-SPEECH FUNCTION =====

async function speak(text) {
    try {
        updateStatus('🔊 Speaking...', 'speaking');
        
        const ttsResponse = await fetch('/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        const ttsData = await ttsResponse.json();
        
        if (ttsData.success) {
            const audioSrc = 'data:audio/mp3;base64,' + ttsData.audio;
            audioPlayer.src = audioSrc;
            audioPlayer.play();
            
            audioPlayer.onended = () => {
                updateStatus('Ready', '');
            };
        }
    } catch (error) {
        console.error('TTS Error:', error);
        updateStatus('Ready', '');
    }
}

// ===== SPEECH RECOGNITION HANDLERS =====

if (recognition) {
    recognition.onstart = () => {
        isListening = true;
        micButton.classList.add('listening');
        micButton.querySelector('.mic-text').textContent = 'Listening...';
        updateStatus('🎤 Listening...', 'listening');
    };
    
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized:', transcript);
        
        addMessage(transcript, true);
        addTypingIndicator();
        updateStatus('🤖 Processing...', 'thinking');
        
        const response = await processCommand(transcript);
        
        removeTypingIndicator();
        addMessage(response, false);
        speak(response);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        micButton.classList.remove('listening');
        micButton.querySelector('.mic-text').textContent = 'Tap to speak';
        
        if (event.error === 'no-speech') {
            updateStatus('No speech detected', '');
        } else if (event.error === 'not-allowed') {
            updateStatus('Microphone access denied', '');
            alert('Please allow microphone access.');
        } else {
            updateStatus('Error: ' + event.error, '');
        }
    };
    
    recognition.onend = () => {
        isListening = false;
        micButton.classList.remove('listening');
        micButton.querySelector('.mic-text').textContent = 'Tap to speak';
    };
}

// ===== EVENT LISTENERS =====

// Microphone button
micButton.addEventListener('click', () => {
    console.log('🎤 Microphone button clicked!');
    
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

// Widget buttons
document.getElementById('clearCompleted').addEventListener('click', () => {
    clearCompleted();
    addMessage("Cleared completed todos", false);
});

document.getElementById('exportTodos').addEventListener('click', () => {
    exportTodos();
    addMessage("Todos exported!", false);
});

document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
document.getElementById('cancelTimer').addEventListener('click', cancelTimer);

// ===== DEMO MODE =====

demoButton.addEventListener('click', async () => {
    const commands = [
        "Add todo: Review candidate resumes",
        "Add todo: Prepare presentation slides",
        "What's the weather in San Francisco?",
        "Set timer for 2 minutes",
        "Calculate 15 percent of 85000",
        "Show my todos"
    ];
    
    demoButton.disabled = true;
    demoButton.textContent = "⏳ Running Demo...";
    
    for (const command of commands) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        addMessage(command, true);
        addTypingIndicator();
        updateStatus('🤖 Processing...', 'thinking');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await processCommand(command);
        removeTypingIndicator();
        addMessage(response, false);
    }
    
    demoButton.disabled = false;
    demoButton.textContent = "▶️ Run Demo";
    updateStatus('Demo completed!', '');
});

// ===== INITIALIZATION MESSAGE =====
console.log('🎉 Voice Assistant Productivity Dashboard loaded!');
console.log('Click the microphone or press spacebar to speak');

}); 