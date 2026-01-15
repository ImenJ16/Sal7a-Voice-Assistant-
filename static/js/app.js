// ===== GLOBAL TODO VARIABLES AND FUNCTIONS =====
let todos = [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
        todos = JSON.parse(saved);
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
    if (typeof renderTodos === 'function') renderTodos();
    return todo;
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        if (typeof renderTodos === 'function') renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    if (typeof renderTodos === 'function') renderTodos();
}

function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    if (typeof renderTodos === 'function') renderTodos();
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
console.log('✅ DOM Elements check:');
console.log('micButton:', micButton);
console.log('status:', status);
console.log('demoButton:', demoButton);
console.log('audioPlayer:', audioPlayer);

if (!micButton) {
    console.error('❌ Microphone button not found!');
    return;
}

let isListening = false;
let recognition = null;
let timerInterval = null;
let timerSeconds = 0;

// ===== INITIALIZATION =====
// Load todos from localStorage
loadTodos();

// Check if browser supports speech recognition
console.log('🔍 Checking speech recognition support...');
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    console.log('✅ Speech recognition available!');
    console.log('🔧 Recognition object created:', recognition);
} else {
    console.error('❌ Speech recognition not supported');
    updateStatus('Speech recognition not supported', '');
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
    console.log('📊 Status:', text);
}

// ===== TODO RENDER FUNCTION (NEEDS DOM ELEMENT) =====
window.renderTodos = function() {
    if (!todoList) {
        console.error('❌ todoList element not found');
        return;
    }
    
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
};

// Initial todo render
renderTodos();

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
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('add todo') || lowerText.includes('add task')) {
        const todoText = text.replace(/add (todo|task):?/i, '').trim();
        if (todoText) {
            addTodo(todoText);
            return `Added todo: "${todoText}"`;
        }
        return "Please specify what todo to add. Say 'Add todo: your task here'";
    }
    
    if (lowerText.includes('show') && (lowerText.includes('todo') || lowerText.includes('task'))) {
        if (todos.length === 0) {
            return "You don't have any todos yet.";
        }
        const count = todos.filter(t => !t.completed).length;
        return `You have ${count} pending ${count === 1 ? 'todo' : 'todos'}.`;
    }
    
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
    
    if (lowerText.includes('weather')) {
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
    
    if (lowerText.includes('timer') || lowerText.includes('set timer')) {
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
    
    if (lowerText.includes('calculate') || lowerText.includes('what is') || lowerText.includes('what\'s')) {
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
    
    if (lowerText.includes('help') || lowerText.includes('what can you do') || lowerText.includes('commands')) {
        return "I can help you with: adding todos, checking weather, setting timers, and doing calculations. Try saying 'Add todo: finish project' or 'What's the weather in Paris?'";
    }
    
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
        
        // If audioPlayer doesn't exist, create it
        if (!audioPlayer) {
            console.warn('⚠️ audioPlayer not found, creating one...');
            const newAudio = document.createElement('audio');
            newAudio.id = 'audioPlayer';
            newAudio.style.display = 'none';
            document.body.appendChild(newAudio);
        }
        
        const ttsResponse = await fetch('/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        const ttsData = await ttsResponse.json();
        
        if (ttsData.success) {
            const audioSrc = 'data:audio/mp3;base64,' + ttsData.audio;
            const player = document.getElementById('audioPlayer');
            player.src = audioSrc;
            player.play();
            
            player.onended = () => {
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
        console.log('✅ Speech recognition started');
    };
    
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Recognized:', transcript);
        
        addMessage(transcript, true);
        addTypingIndicator();
        updateStatus('🤖 Processing...', 'thinking');
        
        const response = await processCommand(transcript);
        
        removeTypingIndicator();
        addMessage(response, false);
        speak(response);
    };
    
    recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error, event);
        isListening = false;
        micButton.classList.remove('listening');
        micButton.querySelector('.mic-text').textContent = 'Tap to speak';
        
        if (event.error === 'no-speech') {
            updateStatus('No speech detected', '');
            console.log('⚠️ No speech detected');
        } else if (event.error === 'not-allowed') {
            updateStatus('Microphone access denied', '');
            console.error('❌ Microphone access denied by user or browser');
            alert('Please allow microphone access. Click the microphone icon in your address bar to enable it.');
        } else if (event.error === 'audio-capture') {
            updateStatus('No microphone found', '');
            console.error('❌ No microphone found');
            alert('No microphone detected. Please connect a microphone and try again.');
        } else {
            updateStatus('Error: ' + event.error, '');
            console.error('❌ Speech recognition error:', event.error);
        }
    };
    
    recognition.onend = () => {
        console.log('🔚 Speech recognition ended');
        isListening = false;
        micButton.classList.remove('listening');
        micButton.querySelector('.mic-text').textContent = 'Tap to speak';
        if (!isListening) {
            updateStatus('Ready', '');
        }
    };
}

// ===== EVENT LISTENERS =====

// Microphone button
micButton.addEventListener('click', () => {
    console.log('🎤 Microphone button clicked!', 'isListening:', isListening);
    
    if (!recognition) {
        console.error('❌ Speech recognition not initialized');
        alert('Speech recognition not supported. Please use Chrome or Edge.');
        return;
    }
    
    if (isListening) {
        console.log('⏹️ Stopping recognition...');
        recognition.stop();
    } else {
        console.log('▶️ Starting recognition...');
        try {
            recognition.start();
        } catch (e) {
            console.error('❌ Error starting recognition:', e);
            updateStatus('Error starting mic', '');
            
            // Try to give user helpful instructions
            if (e.toString().includes('not allowed')) {
                alert('Microphone access denied. Please:\n1. Click the microphone/🔒 icon in your address bar\n2. Allow microphone access\n3. Refresh the page');
            }
        }
    }
});

// Spacebar shortcut
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isListening && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        console.log('⌨️ Spacebar pressed, starting recognition...');
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                console.error('❌ Error starting recognition with spacebar:', e);
            }
        }
    }
});

// Widget buttons
const clearCompletedBtn = document.getElementById('clearCompleted');
if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
        clearCompleted();
        addMessage("Cleared completed todos", false);
    });
}

const exportTodosBtn = document.getElementById('exportTodos');
if (exportTodosBtn) {
    exportTodosBtn.addEventListener('click', () => {
        exportTodos();
        addMessage("Todos exported!", false);
    });
}

const pauseTimerBtn = document.getElementById('pauseTimer');
if (pauseTimerBtn) {
    pauseTimerBtn.addEventListener('click', pauseTimer);
}

const cancelTimerBtn = document.getElementById('cancelTimer');
if (cancelTimerBtn) {
    cancelTimerBtn.addEventListener('click', cancelTimer);
}

// ===== DEMO MODE =====

if (demoButton) {
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
}

// ===== INITIALIZATION MESSAGE =====
console.log('🎉 Voice Assistant Productivity Dashboard loaded!');
console.log('Click the microphone or press spacebar to speak');
updateStatus('Ready', '');

}); // ===== END OF DOM CONTENT LOADED =====