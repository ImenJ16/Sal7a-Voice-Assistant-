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
    
    // Introduction & Personal Info
    if (lowerText.includes('who are you') || 
        lowerText.includes('introduce yourself') || 
        lowerText.includes('tell me about yourself') ||
        lowerText.includes('what is your name') ||
        lowerText.includes('what\'s your name')) {
        console.log('👋 Introduction command');
        return "Hi! I'm Salha, your AI productivity assistant. I'm Tunisian, just like my creator Imen. She coded me to help you manage tasks, check weather, and stay productive. What can I help you with today?";
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
        return "I'm Tunisian! My creator Imen is from Tunisia, and she gave me a Tunisian identity. Salha means 'prayer' in Tunisian Arabic. I'm proud to represent Tunisian innovation in AI!";
    }
    
    // What does your name mean
    if (lowerText.includes('what does salha mean') || 
        lowerText.includes('what does your name mean') ||
        lowerText.includes('meaning of salha')) {
        console.log('📖 Name meaning question');
        return "Salha is Tunisian Arabic for 'prayer' or 'blessing'. Imen chose this name because I'm here to help and support you, like a blessing in your daily productivity. It's written with a 7 because that's how we write the Arabic letter ح in Latin script!";
    }
    
    // Add todo - FLEXIBLE VERSION
    if ((lowerText.includes('add') || lowerText.includes('create')) && 
        (lowerText.includes('to do') || lowerText.includes('to do') || lowerText.includes('task'))) {
        console.log('✅ Matched add to do command!');
        
        let todoText = text
            .replace(/add (a )?todo:?/i, '')
            .replace(/add (a )?to do:?/i, '')
            .replace(/add (a )?task:?/i, '')
            .replace(/create (a )?to do:?/i, '')
            .replace(/create (a )?to do:?/i, '')
            .replace(/create (a )?task:?/i, '')
            .trim();
        
        console.log('📝 Extracted to do text:', todoText);
        
        if (todoText && todoText.length > 0) {
            console.log('➕ Adding to do:', todoText);
            addTodo(todoText);
            console.log('✅ To do added! Current to dos:', todos);
            return `Added todo: "${todoText}"`;
        }
        return "Please specify what to do to add. Say 'Add to do: your task here'";
    }
    
    // Show todos
    if (lowerText.includes('show') && (lowerText.includes('to do') || lowerText.includes('to do') || lowerText.includes('task'))) {
        console.log('📋 Show todos command');
        if (todos.length === 0) {
            return "You don't have any to dos yet.";
        }
        const total = todos.length;
        const pending = todos.filter(t => !t.completed).length;
        const completed = todos.filter(t => t.completed).length;
        
        return `You have ${total} total ${total === 1 ? 'to do' : 'to dos'}: ${pending} pending and ${completed} completed.`;
    }
    
    // Check/Mark todo as complete
    if ((lowerText.includes('check') || lowerText.includes('complete') || lowerText.includes('mark')) && 
        (lowerText.includes('to do') || lowerText.includes('to do') || lowerText.includes('task'))) {
        console.log('✓ Check to do command');
        
        // Try to find a number in the command
        const match = text.match(/\d+/);
        if (match) {
            const todoNum = parseInt(match[0]);
            const index = todoNum - 1;
            
            if (index >= 0 && index < todos.length) {
                todos[index].completed = true;
                saveTodos();
                renderTodos();
                return `Marked to do ${todoNum} as complete: "${todos[index].text}"`;
            } else {
                return `To do number ${todoNum} doesn't exist. You have ${todos.length} to dos.`;
            }
        }
        
        // If no number, try to complete the first pending todo
        const firstPending = todos.findIndex(t => !t.completed);
        if (firstPending !== -1) {
            todos[firstPending].completed = true;
            saveTodos();
            renderTodos();
            return `Marked first pending to do as complete: "${todos[firstPending].text}"`;
        }
        
        return "All to dos are already completed!";
    }
    
    // Delete specific todo from list
    if ((lowerText.includes('delete') || lowerText.includes('remove')) && 
        (lowerText.includes('to do') || lowerText.includes('to do') || lowerText.includes('task')) &&
        !lowerText.includes('all') && !lowerText.includes('completed') && !lowerText.includes('done')) {
        console.log('🗑️ Delete specific to do command');
        
        const match = text.match(/\d+/);
        if (match) {
            const todoNum = parseInt(match[0]);
            const index = todoNum - 1;
            
            if (index >= 0 && index < todos.length) {
                const deletedTodo = todos[index];
                todos.splice(index, 1);
                saveTodos();
                renderTodos();
                return `Deleted to do ${todoNum}: "${deletedTodo.text}"`;
            } else {
                return `To do number ${todoNum} doesn't exist.`;
            }
        }
        
        return "Please specify which to do to delete. Say 'Delete to do 1' or 'Delete to do 2'";
    }
    
    // Export Todos
    if ((lowerText.includes('export') || lowerText.includes('download') || lowerText.includes('save')) && 
        (lowerText.includes('to do') || lowerText.includes('to do') || lowerText.includes('task') || lowerText.includes('list'))) {
        console.log('📥 Export to dos command');
        
        if (todos.length === 0) {
            return "You don't have any to dos to export yet. Add some first!";
        }
        
        exportTodos();
        const pending = todos.filter(t => !t.completed).length;
        const completed = todos.filter(t => t.completed).length;
        return `Exported ${todos.length} ${todos.length === 1 ? 'to do' : 'to dos'} to a text file: ${pending} pending, ${completed} completed. Check your downloads folder!`;
    }
    
    // Clear/Delete Completed Todos
    if ((lowerText.includes('clear') || lowerText.includes('delete') || lowerText.includes('remove')) && 
        (lowerText.includes('completed') || lowerText.includes('done') || lowerText.includes('finished'))) {
        console.log('🗑️ Clear completed command');
        
        const completedCount = todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            return "You don't have any completed to dos to clear. All to dos are still pending!";
        }
        
        clearCompleted();
        return `Cleared ${completedCount} completed ${completedCount === 1 ? 'to do' : 'to dos'}. You now have ${todos.length} pending tasks.`;
    }
    
    // Clear All Todos
    if ((lowerText.includes('clear all') || lowerText.includes('delete all') || lowerText.includes('remove all')) && 
        (lowerText.includes('to do') || lowerText.includes('to do') || lowerText.includes('task'))) {
        console.log('🗑️ Clear all to dos command');
        
        if (todos.length === 0) {
            return "Your to do list is already empty. Nothing to clear!";
        }
        
        const count = todos.length;
        todos = [];
        saveTodos();
        renderTodos();
        return `Cleared all ${count} to dos. Fresh start! Ready to add new tasks?`;
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
        return "Please specify a city. Say 'What's the weather in Paris?' or 'Weather in Tunis'";
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
            return `Timer set for ${value} ${match[2]}${value !== 1 ? 's' : ''}! I'll let you know when it's done.`;
        }
        return "Please specify the duration. Say 'Set timer for 5 minutes' or 'Timer for 30 seconds'";
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
            return "I couldn't calculate that. Please try again with a simpler expression.";
        }
    }
    
    // Run Demo - FIXED VERSION
    if (lowerText.includes('run demo') || 
        lowerText.includes('start demo') || 
        lowerText.includes('show demo') ||
        lowerText.includes('demo mode') ||
        lowerText.includes('demonstrate')) {
        console.log('🎬 Demo command');
        
        // Get the demo button directly
        const demoBtnElement = document.getElementById('demoButton');
        console.log('Demo button found:', demoBtnElement);
        console.log('Demo button disabled:', demoBtnElement ? demoBtnElement.disabled : 'N/A');
        
        if (demoBtnElement && !demoBtnElement.disabled) {
            console.log('Clicking demo button...');
            demoBtnElement.click();
            return "Starting demo mode! Watch as I showcase all my features. This will take about 20 seconds.";
        } else if (demoBtnElement && demoBtnElement.disabled) {
            return "Demo is already running! Please wait for it to finish.";
        } else {
            console.error('Demo button not found!');
            return "Sorry, I can't start the demo right now. Try clicking the demo button manually.";
        }
    }
    
    // Help/Commands
    if (lowerText.includes('help') || lowerText.includes('what can you do') || lowerText.includes('commands')) {
        console.log('❓ Help command');
        return "I can help you with to dos, weather, timers, and calculations. Try: 'Add to do', 'Show my to dos', 'Export to dos', 'Clear completed', 'Run demo', 'What's the weather in Tunis?', or 'Set timer for 5 minutes'. Ask 'Who are you?' to learn about me!";
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
    addMessage("Cleared completed to dos", false);
});

document.getElementById('exportTo dos').addEventListener('click', () => {
    exportTodos();
    addMessage("To dos exported!", false);
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