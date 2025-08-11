// Chatbot.js - JavaScript for the AI Assistant page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('fullname') || localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the chatbot
    initChatbot();
});

// Initialize the chatbot
function initChatbot() {
    // Add welcome message
    addBotMessage("Hello! I'm your HealthCare360 AI Assistant. I can help answer questions on health topics, provide general information, or assist with any other queries you might have. How can I help you today?");
    
    // Setup event listeners
    setupChatListeners();
}

// Setup event listeners for chat
function setupChatListeners() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    // Send message on button click
    sendBtn.addEventListener('click', function() {
        sendMessage();
    });
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// Send message function
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    // Validate input
    if (!message) return;
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process the message and generate a response
    processMessage(message);
}

// Add user message to chat
function addUserMessage(message) {
    const chatMessages = document.querySelector('.chat-messages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.innerHTML = `
        ${message}
        <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// Add bot message to chat
function addBotMessage(message) {
    const chatMessages = document.querySelector('.chat-messages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    
    // Convert URLs to clickable links
    const linkedMessage = message.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    messageElement.innerHTML = `
        ${linkedMessage}
        <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    typingIndicator.style.display = 'block';
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    typingIndicator.style.display = 'none';
}

// Scroll chat to bottom
function scrollToBottom() {
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Process user message and generate response
function processMessage(message) {
    // Convert to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Show typing indicator
    showTypingIndicator();
    
    // Check if it's a simple query that can be answered locally
    if (isSimpleQuery(lowerMessage)) {
        // Simulate thinking time
        const thinkingTime = Math.floor(Math.random() * 1000) + 500; // 500-1500ms
        
        setTimeout(() => {
            hideTypingIndicator();
            
            // Generate response based on message content
            let response = generateLocalResponse(lowerMessage, message);
            
            // Add response to chat
            addBotMessage(response);
        }, thinkingTime);
    } else if (lowerMessage.includes("where is") || lowerMessage.includes("location of")) {
        // For location queries, use the GeoDB Cities API
        fetchLocationInfo(message);
    } else {
        // For other general knowledge queries, try the Open Trivia API first
        fetchFromOpenTrivia(message);
    }
}

// Check if the query can be answered locally
function isSimpleQuery(lowerMessage) {
    // Greetings
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi ") || lowerMessage === "hi" || lowerMessage.includes("hey") || lowerMessage.includes("greetings")) {
        return true;
    }
    
    // How are you
    if (lowerMessage.includes("how are you") || lowerMessage.includes("how do you do") || lowerMessage.includes("how's it going")) {
        return true;
    }
    
    // Identity questions
    if (lowerMessage.includes("who are you") || lowerMessage.includes("what are you") || (lowerMessage.includes("your") && lowerMessage.includes("name"))) {
        return true;
    }
    
    // Thanks
    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks") || lowerMessage.includes("appreciate")) {
        return true;
    }
    
    // Help
    if (lowerMessage === "help" || lowerMessage.includes("can you help") || lowerMessage.includes("need help")) {
        return true;
    }
    
    // Time and date
    if ((lowerMessage.includes("time") || lowerMessage.includes("date") || lowerMessage.includes("day")) && 
        (lowerMessage.includes("what") || lowerMessage.includes("current"))) {
        return true;
    }
    
    // Jokes
    if (lowerMessage.includes("joke") || lowerMessage.includes("funny") || lowerMessage.includes("make me laugh")) {
        return true;
    }
    
    // Health-related topics
    if (lowerMessage.includes("covid") || lowerMessage.includes("coronavirus") ||
        lowerMessage.includes("headache") || lowerMessage.includes("blood pressure") ||
        lowerMessage.includes("diabetes") || lowerMessage.includes("heart") ||
        lowerMessage.includes("exercise") || lowerMessage.includes("nutrition") ||
        lowerMessage.includes("sleep") || lowerMessage.includes("mental health") ||
        lowerMessage.includes("weight loss")) {
        return true;
    }
    
    // Return false for all other queries to use the API
    return false;
}

// Generate local response for simple queries
function generateLocalResponse(lowerMessage, originalMessage) {
    // Greetings
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi ") || lowerMessage === "hi" || lowerMessage.includes("hey") || lowerMessage.includes("greetings")) {
        return "Hello! How can I assist you today? Feel free to ask me about health topics, general information, or any other questions you might have.";
    }
    
    // How are you
    if (lowerMessage.includes("how are you") || lowerMessage.includes("how do you do") || lowerMessage.includes("how's it going")) {
        return "I'm doing well, thank you for asking! I'm here and ready to help you with any questions or information you need. How can I assist you today?";
    }
    
    // Identity questions
    if (lowerMessage.includes("who are you") || lowerMessage.includes("what are you") || (lowerMessage.includes("your") && lowerMessage.includes("name"))) {
        return "I'm the AI assistant for HealthCare360. I'm designed to provide helpful information on health topics and answer general questions. I'm here to assist you with whatever information you need.";
    }
    
    // Thanks
    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks") || lowerMessage.includes("appreciate")) {
        return "You're welcome! I'm glad I could help. If you have any other questions, feel free to ask.";
    }
    
    // Help
    if (lowerMessage === "help" || lowerMessage.includes("can you help") || lowerMessage.includes("need help")) {
        return "I'd be happy to help! You can ask me questions about health topics, general knowledge, science, history, technology, and more. What specific information are you looking for?";
    }
    
    // Weather
    if (lowerMessage.includes("weather")) {
        return "I don't have access to real-time weather data. To get the current weather, you can check a weather app or website like Weather.com, AccuWeather, or your device's built-in weather app.";
    }
    
    // Time
    if (lowerMessage.includes("time") && (lowerMessage.includes("what") || lowerMessage.includes("current"))) {
        const now = new Date();
        return `The current time is ${now.toLocaleTimeString()}. Note that this is based on your device's time.`;
    }
    
    // Date
    if ((lowerMessage.includes("date") || lowerMessage.includes("day")) && (lowerMessage.includes("what") || lowerMessage.includes("current"))) {
        const now = new Date();
        return `Today is ${now.toLocaleDateString()} (${now.toDateString()}).`;
    }
    
    // Jokes
    if (lowerMessage.includes("joke") || lowerMessage.includes("funny") || lowerMessage.includes("make me laugh")) {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
            "I told my doctor that I broke my arm in two places. He told me to stop going to those places.",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "What do you call a fake noodle? An impasta!",
            "Why don't eggs tell jokes? They'd crack each other up.",
            "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
            "How do you organize a space party? You planet!",
            "Why did the bicycle fall over? Because it was two-tired!",
            "What did one ocean say to the other ocean? Nothing, they just waved."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Health-related responses
    
    // COVID
    if (lowerMessage.includes("covid") || lowerMessage.includes("coronavirus")) {
        return "COVID-19 is caused by the SARS-CoV-2 virus. Common symptoms include fever, cough, fatigue, and loss of taste or smell. Prevention measures include vaccination, hand washing, and in some situations, wearing masks. For the most current information, please consult official health organizations like the WHO or CDC.";
    }
    
    // Headache
    if (lowerMessage.includes("headache")) {
        return "Headaches can be caused by various factors including stress, dehydration, lack of sleep, or eye strain. For occasional headaches, rest, hydration, and over-the-counter pain relievers may help. If you experience severe, persistent, or unusual headaches, it's important to consult with a healthcare professional.";
    }
    
    // Blood pressure
    if (lowerMessage.includes("blood pressure") || lowerMessage.includes("hypertension")) {
        return "Normal blood pressure is typically around 120/80 mmHg. High blood pressure (hypertension) is generally considered to be 130/80 mmHg or higher. Managing blood pressure can involve healthy eating, regular exercise, limiting sodium and alcohol, maintaining a healthy weight, not smoking, and sometimes medication as prescribed by a doctor.";
    }
    
    // Diabetes
    if (lowerMessage.includes("diabetes") || lowerMessage.includes("blood sugar")) {
        return "Diabetes is a chronic condition affecting how your body processes blood sugar. Type 1 diabetes involves the immune system attacking insulin-producing cells, while Type 2 diabetes involves resistance to insulin. Symptoms may include increased thirst, frequent urination, hunger, fatigue, and blurred vision. Management typically involves monitoring blood sugar, medication or insulin, healthy eating, and regular physical activity.";
    }
    
    // Heart health
    if (lowerMessage.includes("heart") || lowerMessage.includes("cardiac") || lowerMessage.includes("cardiovascular")) {
        return "Heart health is crucial for overall wellbeing. Key factors for maintaining heart health include regular physical activity, a balanced diet low in saturated fats and sodium, not smoking, limiting alcohol, managing stress, and getting regular check-ups. Common heart conditions include coronary artery disease, heart failure, arrhythmias, and valve disorders. If you experience chest pain, shortness of breath, or other concerning symptoms, seek medical attention immediately.";
    }
    
    // Exercise
    if (lowerMessage.includes("exercise") || lowerMessage.includes("workout") || lowerMessage.includes("physical activity")) {
        return "Regular exercise offers numerous health benefits, including improved cardiovascular health, stronger muscles and bones, better weight management, enhanced mental health, and reduced risk of many diseases. Adults should aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening activities twice a week. Always start gradually if you're new to exercise, and consider consulting a healthcare provider before beginning a new exercise program, especially if you have existing health conditions.";
    }
    
    // Nutrition
    if (lowerMessage.includes("nutrition") || lowerMessage.includes("diet") || lowerMessage.includes("healthy eating") || lowerMessage.includes("food")) {
        return "A balanced diet typically includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. It's generally recommended to limit processed foods, added sugars, and excessive sodium. Nutritional needs can vary based on age, sex, activity level, and health conditions. Staying hydrated by drinking water throughout the day is also important. For personalized nutrition advice, consider consulting with a registered dietitian who can provide guidance specific to your needs and goals.";
    }
    
    // Sleep
    if (lowerMessage.includes("sleep") || lowerMessage.includes("insomnia") || lowerMessage.includes("can't sleep")) {
        return "Quality sleep is essential for physical and mental health. Most adults need 7-9 hours of sleep per night. Good sleep hygiene practices include maintaining a consistent sleep schedule, creating a restful environment, limiting screen time before bed, avoiding caffeine and large meals before bedtime, and engaging in relaxation techniques. If you consistently struggle with sleep despite these measures, consider speaking with a healthcare provider, as persistent sleep issues can affect overall health.";
    }
    
    // Mental health
    if (lowerMessage.includes("mental health") || lowerMessage.includes("depression") || lowerMessage.includes("anxiety") || lowerMessage.includes("stress")) {
        return "Mental health is just as important as physical health. Common mental health conditions include depression, anxiety disorders, and stress-related issues. Strategies that can support mental wellbeing include regular physical activity, adequate sleep, stress management techniques like meditation or deep breathing, maintaining social connections, and seeking professional help when needed. If you're experiencing persistent mental health concerns, please consider reaching out to a healthcare provider or mental health professional.";
    }
    
    // Weight management
    if (lowerMessage.includes("weight loss") || lowerMessage.includes("lose weight") || lowerMessage.includes("obesity") || lowerMessage.includes("overweight")) {
        return "Healthy weight management typically involves a balanced approach combining nutritious eating, regular physical activity, and behavioral strategies. Sustainable weight loss generally occurs gradually, often at a rate of 1-2 pounds per week. Crash diets or extreme measures are usually not recommended as they can be difficult to maintain and may not support overall health. For personalized weight management guidance, consider consulting with healthcare providers such as doctors, registered dietitians, or weight management specialists.";
    }
    
    // Default response - should not reach here if isSimpleQuery is working correctly
    return "I'll need to search for information on that. One moment please...";
}

// Fetch location information from GeoDB Cities API
async function fetchLocationInfo(query) {
    try {
        const location = query.toLowerCase().replace("where is", "").replace("location of", "").trim();
        const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(location)}&limit=1`, {
            headers: {
                'X-RapidAPI-Key': '9dd2fb5b88mshc2f68b4f7e82f24p1ef5dajsn3336e9e14b5c',
                'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            hideTypingIndicator();
            
            if (data.data && data.data.length > 0) {
                const city = data.data[0];
                const botResponse = `${city.name} is located in ${city.country}. Its coordinates are latitude ${city.latitude} and longitude ${city.longitude}.`;
                addBotMessage(botResponse);
            } else {
                // If no results found, try Wikipedia as a fallback
                fetchFromWikipedia(query);
            }
        } else {
            // If API fails, try Wikipedia as a fallback
            fetchFromWikipedia(query);
        }
    } catch (error) {
        console.error('Error fetching from GeoDB API:', error);
        fetchFromWikipedia(query);
    }
}

// Fetch information from Open Trivia API
async function fetchFromOpenTrivia(query) {
    try {
        // Try to get a general knowledge question related to the query
        const keywords = query.split(" ")
            .filter(word => word.length > 3)  // Filter out short words
            .map(word => encodeURIComponent(word));
        
        // If we have keywords, try to search for related questions
        if (keywords.length > 0) {
            // Use the Open Trivia API to get a random question
            const response = await fetch('https://opentdb.com/api.php?amount=1');
            
            if (response.ok) {
                const data = await response.json();
                hideTypingIndicator();
                
                if (data.results && data.results.length > 0) {
                    const question = data.results[0];
                    
                    // Format the response with the question and answer
                    let botResponse = `Here's some information related to your query:\n\n`;
                    botResponse += `Question: ${decodeHtml(question.question)}\n`;
                    botResponse += `Answer: ${decodeHtml(question.correct_answer)}\n\n`;
                    
                    // Add category information
                    botResponse += `This is from the category: ${question.category}`;
                    
                    addBotMessage(botResponse);
                    return;
                }
            }
        }
        
        // If Open Trivia API doesn't have relevant info, try Wikipedia
        fetchFromWikipedia(query);
    } catch (error) {
        console.error('Error fetching from Open Trivia API:', error);
        fetchFromWikipedia(query);
    }
}

// Helper function to decode HTML entities
function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// Fetch response from Wikipedia API
async function fetchFromWikipedia(query) {
    try {
        // Try using the free Wikipedia API
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        
        if (response.ok) {
            const data = await response.json();
            hideTypingIndicator();
            
            if (data.extract) {
                let botResponse = data.extract;
                if (data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page) {
                    botResponse += `\n\nSource: ${data.content_urls.desktop.page}`;
                }
                addBotMessage(botResponse);
            } else {
                // If no extract found, try another API
                tryAlternativeAPI(query);
            }
        } else {
            // If Wikipedia API fails, try another API
            tryAlternativeAPI(query);
        }
    } catch (error) {
        console.error('Error fetching from Wikipedia API:', error);
        tryAlternativeAPI(query);
    }
}

// Try an alternative API if the first one fails
async function tryAlternativeAPI(query) {
    try {
        // Try using the free DuckDuckGo API
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
        
        if (response.ok) {
            const data = await response.json();
            hideTypingIndicator();
            
            if (data.AbstractText) {
                let botResponse = data.AbstractText;
                if (data.AbstractURL) {
                    botResponse += `\n\nSource: ${data.AbstractURL}`;
                }
                addBotMessage(botResponse);
            } else if (data.RelatedTopics && data.RelatedTopics.length > 0 && data.RelatedTopics[0].Text) {
                // Use related topics if abstract not available
                addBotMessage(data.RelatedTopics[0].Text);
            } else {
                // If no good response, use fallback
                useFallbackResponse(query);
            }
        } else {
            // If DuckDuckGo API fails, use fallback
            useFallbackResponse(query);
        }
    } catch (error) {
        console.error('Error fetching from DuckDuckGo API:', error);
        useFallbackResponse(query);
    }
}

// Use fallback response when all APIs fail
function useFallbackResponse(query) {
    hideTypingIndicator();
    
    // Generate a more helpful fallback response
    let response = "";
    
    if (query.toLowerCase().includes("where is") || query.toLowerCase().includes("location")) {
        const location = query.toLowerCase().replace("where is", "").replace("location of", "").trim();
        response = `${location.charAt(0).toUpperCase() + location.slice(1)} is a location I don't have specific information about right now. For accurate location information, you could check Google Maps or a geography website.`;
    } else if (query.toLowerCase().includes("who is") || query.toLowerCase().includes("person")) {
        const person = query.toLowerCase().replace("who is", "").replace("person", "").trim();
        response = `I don't have specific information about ${person} right now. For biographical information, you might want to check a reliable encyclopedia or search engine.`;
    } else if (query.toLowerCase().includes("what is") || query.toLowerCase().includes("define")) {
        const term = query.toLowerCase().replace("what is", "").replace("define", "").trim();
        response = `I don't have a specific definition for "${term}" right now. For accurate definitions, you might want to check a dictionary or encyclopedia.`;
    } else if (query.toLowerCase().includes("when") || query.toLowerCase().includes("date")) {
        response = "I don't have access to specific historical dates or scheduling information. For historical dates, you might want to check an encyclopedia or history website.";
    } else {
        response = `I don't have specific information about "${query}" right now. This might be because I have limited access to external data sources. For the most accurate and up-to-date information, you might want to use a search engine or consult a specialized resource.`;
    }
    
    addBotMessage(response);
}

// Handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('fullname');
    window.location.href = 'login.html';
}

// Add event listener to logout button
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout');
    logoutBtn.addEventListener('click', logout);
});
