// Enhanced API Configuration
const API_CONFIG = {
    // For weather data (OpenWeatherMap API)
    WEATHER_API_KEY: 'aa2f749387895d1795635f334b355ba5',
    WEATHER_API_URL: 'https://api.openweathermap.org/data/2.5/weather',
    
    // For AI responses (OpenAI API)
    AI_API_KEY: 'AIzaSyBj4_NB0HzOBR7XKMEMEyoXYHvn0iFmCNs',
    AI_API_URL: 'https://api.openai.com/v1/chat/completions',
    
    // For location information (Google Places API)
    LOCATION_API_KEY: 'AIzaSyBj4_NB0HzOBR7XKMEMEyoXYHvn0iFmCNs',
    LOCATION_API_URL: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
    
    // For currency conversion (optional)
    CURRENCY_API_KEY: 'AIzaSyBj4_NB0HzOBR7XKMEMEyoXYHvn0iFmCNs',
    CURRENCY_API_URL: 'https://api.exchangerate-api.com/v4/latest/'
};

// Enhanced trip details object
let tripDetails = {
    destination: '',
    tripDuration: '',
    travelDates: '',
    travelPurpose: '',
    accommodationType: '',
    climate: '',
    activities: [],
    travelers: [],
    specialRequirements: [],
    budgetLevel: '',
    transportationMode: ''
};

// DOM elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const voiceButton = document.getElementById('voice-button');
const restartButton = document.getElementById('restart-chat');
const tripDetailsDisplay = document.getElementById('trip-details');
const packingListContainer = document.getElementById('packing-list-container');
const weatherInfo = document.getElementById('weather-info');
const travelTips = document.getElementById('travel-tips');
const typingIndicator = document.getElementById('typing-indicator');

// Conversation flow state
let conversationState = 'askDestination';
let recognition = null;

// Initialize the chat
document.addEventListener('DOMContentLoaded', () => {
    userInput.focus();
    
    // Handle send button click
    sendButton.addEventListener('click', sendMessage);
    
    // Handle Enter key press
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Handle voice input button
    voiceButton.addEventListener('click', toggleVoiceInput);
    
    // Handle restart button
    restartButton.addEventListener('click', restartChat);
    
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            addMessage("Sorry, I couldn't understand your voice input. Please try typing.", 'bot');
        };
    } else {
        voiceButton.style.display = 'none';
    }
});

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process user input based on conversation state
    await processUserInput(message);
    
    // Hide typing indicator
    hideTypingIndicator();
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${text}</p>`;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.style.display = 'block';
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Process user input based on conversation state
async function processUserInput(input) {
    switch (conversationState) {
        case 'askDestination':
            tripDetails.destination = input;
            updateTripDetailsDisplay();
            addMessage('Great choice! How many days will your trip be?', 'bot');
            conversationState = 'askDuration';
            break;
            
        case 'askDuration':
            tripDetails.tripDuration = input;
            updateTripDetailsDisplay();
            addMessage('When are you traveling? (e.g., "July 15-20" or "next month")', 'bot');
            conversationState = 'askDates';
            break;
            
        case 'askDates':
            tripDetails.travelDates = input;
            updateTripDetailsDisplay();
            addMessage('What is the main purpose of your trip? (e.g., vacation, business, wedding, backpacking)', 'bot');
            conversationState = 'askPurpose';
            break;
            
        case 'askPurpose':
            tripDetails.travelPurpose = input;
            updateTripDetailsDisplay();
            addMessage('What type of accommodation will you be staying in? (e.g., hotel, Airbnb, camping, hostel)', 'bot');
            conversationState = 'askAccommodation';
            break;
            
        case 'askAccommodation':
            tripDetails.accommodationType = input;
            updateTripDetailsDisplay();
            addMessage('Do you know the expected climate at your destination? (e.g., warm, cold, rainy, tropical)', 'bot');
            conversationState = 'askClimate';
            break;
            
        case 'askClimate':
            tripDetails.climate = input;
            updateTripDetailsDisplay();
            addMessage('What activities do you plan to do? (e.g., hiking, swimming, business meetings, sightseeing)', 'bot');
            conversationState = 'askActivities';
            break;
            
        case 'askActivities':
            tripDetails.activities = input.split(',').map(item => item.trim());
            updateTripDetailsDisplay();
            addMessage('Who is traveling with you? (e.g., "just me", "me and my spouse", "family with 2 kids")', 'bot');
            conversationState = 'askTravelers';
            break;
            
        case 'askTravelers':
            tripDetails.travelers = input.split(',').map(item => item.trim());
            updateTripDetailsDisplay();
            addMessage('Any special requirements we should consider? (e.g., medications, dietary needs, equipment)', 'bot');
            conversationState = 'askSpecialRequirements';
            break;
            
        case 'askSpecialRequirements':
            tripDetails.specialRequirements = input.split(',').map(item => item.trim());
            updateTripDetailsDisplay();
            addMessage('Finally, what\'s your budget level for this trip? (e.g., budget, mid-range, luxury)', 'bot');
            conversationState = 'askBudget';
            break;
            
        case 'askBudget':
            tripDetails.budgetLevel = input;
            updateTripDetailsDisplay();
            addMessage('What mode of transportation will you use? (e.g., plane, train, car, cruise)', 'bot');
            conversationState = 'askTransportation';
            break;
            
        case 'askTransportation':
            tripDetails.transportationMode = input;
            updateTripDetailsDisplay();
            addMessage('Thanks! Generating your personalized packing list now...', 'bot');
            
            // Show typing indicator while generating
            showTypingIndicator();
            
            try {
                // Generate packing list using AI
                const packingList = await generatePackingListWithAI();
                displayPackingList(packingList);
                
                // Fetch weather data
                await fetchWeatherData();
                
                // Generate travel tips
                const tips = await generateTravelTipsWithAI();
                displayTravelTips(tips);
                
                addMessage('Your packing list is ready! I\'ve also included weather information and travel tips for your destination.', 'bot');
                addMessage('Would you like to make any changes or ask anything else?', 'bot');
            } catch (error) {
                console.error('Error generating content:', error);
                addMessage('Sorry, I encountered an error while generating your packing list. Please try again.', 'bot');
            } finally {
                hideTypingIndicator();
                conversationState = 'complete';
            }
            break;
            
        default:
            // Handle follow-up questions or changes
            if (input.toLowerCase().includes('change') || input.toLowerCase().includes('edit')) {
                addMessage('What would you like to change? Tell me which detail to update.', 'bot');
                conversationState = 'awaitingChange';
            } else if (input.toLowerCase().includes('restart') || input.toLowerCase().includes('start over')) {
                restartChat();
            } else {
                // Handle general questions using AI
                showTypingIndicator();
                try {
                    const aiResponse = await getAIResponse(input);
                    addMessage(aiResponse, 'bot');
                } catch (error) {
                    console.error('Error getting AI response:', error);
                    addMessage("I'm sorry, I couldn't process your request. Please try again.", 'bot');
                } finally {
                    hideTypingIndicator();
                }
            }
            break;
    }
}

// Update the trip details display
function updateTripDetailsDisplay() {
    tripDetailsDisplay.style.display = 'block';
    tripDetailsDisplay.innerHTML = `
        <h3><i class="fas fa-info-circle"></i> Your Trip Details</h3>
        ${tripDetails.destination ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-map-marker-alt"></i> Destination:</span> ${tripDetails.destination}</div>` : ''}
        ${tripDetails.tripDuration ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-calendar-day"></i> Duration:</span> ${tripDetails.tripDuration}</div>` : ''}
        ${tripDetails.travelDates ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-clock"></i> Dates:</span> ${tripDetails.travelDates}</div>` : ''}
        ${tripDetails.travelPurpose ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-bullseye"></i> Purpose:</span> ${tripDetails.travelPurpose}</div>` : ''}
        ${tripDetails.accommodationType ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-hotel"></i> Accommodation:</span> ${tripDetails.accommodationType}</div>` : ''}
        ${tripDetails.climate ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-cloud-sun"></i> Climate:</span> ${tripDetails.climate}</div>` : ''}
        ${tripDetails.activities.length > 0 ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-running"></i> Activities:</span> ${tripDetails.activities.join(', ')}</div>` : ''}
        ${tripDetails.travelers.length > 0 ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-users"></i> Travelers:</span> ${tripDetails.travelers.join(', ')}</div>` : ''}
        ${tripDetails.specialRequirements.length > 0 ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-heartbeat"></i> Special Requirements:</span> ${tripDetails.specialRequirements.join(', ')}</div>` : ''}
        ${tripDetails.budgetLevel ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-wallet"></i> Budget Level:</span> ${tripDetails.budgetLevel}</div>` : ''}
        ${tripDetails.transportationMode ? `<div class="detail-item"><span class="detail-label"><i class="fas fa-plane"></i> Transportation:</span> ${tripDetails.transportationMode}</div>` : ''}
    `;
}

// Generate packing list with AI (using mock data if no API key)
async function generatePackingListWithAI() {
    // If no API key, use mock data
    if (!API_CONFIG.AI_API_KEY || API_CONFIG.AI_API_KEY === 'YOUR_OPENAI_API_KEY') {
        return generateMockPackingList();
    }
    
    try {
        const prompt = `Create a detailed packing list for a trip with these details:
        Destination: ${tripDetails.destination}
        Duration: ${tripDetails.tripDuration}
        Dates: ${tripDetails.travelDates}
        Purpose: ${tripDetails.travelPurpose}
        Accommodation: ${tripDetails.accommodationType}
        Climate: ${tripDetails.climate}
        Activities: ${tripDetails.activities.join(', ')}
        Travelers: ${tripDetails.travelers.join(', ')}
        Special Requirements: ${tripDetails.specialRequirements.join(', ')}
        Budget Level: ${tripDetails.budgetLevel}
        Transportation: ${tripDetails.transportationMode}
        
        Please organize the list into categories like Clothing, Toiletries, Electronics, Documents, and Miscellaneous. 
        Include specific items needed based on the trip details. Return the response as a JSON object with categories as keys and arrays of items as values.`;
        
        const response = await fetch(API_CONFIG.AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.AI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Try to parse the JSON response
        try {
            return JSON.parse(content);
        } catch {
            // If not JSON, try to extract structured data
            return parsePackingListFromText(content);
        }
    } catch (error) {
        console.error('Error generating packing list with AI:', error);
        // Fallback to mock data if API fails
        return generateMockPackingList();
    }
}

// Generate mock packing list (fallback)
function generateMockPackingList() {
    const mockPackingList = {
        clothing: [
            '5 t-shirts',
            '3 pairs of pants/shorts',
            '1 jacket/sweater',
            'Underwear for each day',
            'Socks for each day',
            'Pajamas',
            'Swimsuit (if applicable)',
            'Comfortable walking shoes',
            '1 dressy outfit (if needed)'
        ],
        toiletries: [
            'Toothbrush and toothpaste',
            'Shampoo and conditioner',
            'Deodorant',
            'Razor and shaving cream',
            'Hairbrush/comb',
            'Skincare products',
            'Makeup (if applicable)',
            'Sunscreen',
            'First aid kit'
        ],
        electronics: [
            'Phone and charger',
            'Laptop/tablet and charger (if needed)',
            'Headphones',
            'Power bank',
            'Adapter (if international)',
            'Camera (optional)'
        ],
        documents: [
            'Passport/ID',
            'Boarding passes/tickets',
            'Hotel reservations',
            'Travel insurance info',
            'Emergency contacts',
            'Credit cards/cash',
            'Copies of important documents'
        ],
        miscellaneous: [
            'Medications',
            'Sunglasses',
            'Reusable water bottle',
            'Snacks',
            'Book or entertainment',
            'Travel pillow (for long trips)',
            'Umbrella/rain jacket (if needed)'
        ]
    };
    
    // Add activity-specific items
    if (tripDetails.activities.some(a => a.toLowerCase().includes('hiking'))) {
        mockPackingList.miscellaneous.push('Hiking boots', 'Backpack', 'Waterproof jacket', 'Trekking poles');
    }
    if (tripDetails.activities.some(a => a.toLowerCase().includes('swimming'))) {
        mockPackingList.miscellaneous.push('Beach towel', 'Sunscreen', 'Flip flops', 'Waterproof phone case');
    }
    if (tripDetails.activities.some(a => a.toLowerCase().includes('business'))) {
        mockPackingList.clothing.push('Business attire', 'Dress shoes', 'Portfolio/briefcase');
    }
    if (tripDetails.activities.some(a => a.toLowerCase().includes('winter'))) {
        mockPackingList.clothing.push('Winter coat', 'Gloves', 'Scarf', 'Thermal underwear');
    }
    
    // Add special requirements
    if (tripDetails.specialRequirements.some(r => r.toLowerCase().includes('medication'))) {
        mockPackingList.miscellaneous.push('Prescription medications', 'Doctor\'s note for medications');
    }
    
    return mockPackingList;
}

// Parse packing list from AI text response
function parsePackingListFromText(text) {
    // This is a simplified parser that would need to be enhanced based on actual AI responses
    const categories = {
        clothing: extractItems(text, 'Clothing'),
        toiletries: extractItems(text, 'Toiletries'),
        electronics: extractItems(text, 'Electronics'),
        documents: extractItems(text, 'Documents'),
        miscellaneous: extractItems(text, 'Miscellaneous')
    };
    
    return categories;
}

function extractItems(text, category) {
    const regex = new RegExp(`${category}:[\\s\\n]*([\\s\\S]*?)(?:\\n\\n|$)`);
    const match = text.match(regex);
    if (!match) return [];
    
    const itemsText = match[1];
    return itemsText.split('\n')
        .map(item => item.replace(/^- /, '').trim())
        .filter(item => item.length > 0);
}

// Display the packing list
function displayPackingList(packingList) {
    packingListContainer.style.display = 'block';
    
    let html = '<h2><i class="fas fa-suitcase"></i> Your Personalized Packing List</h2>';
    
    for (const category in packingList) {
        html += `
            <div class="category">
                <h3><i class="fas ${getCategoryIcon(category)}"></i> ${capitalizeFirstLetter(category)}</h3>
                <div class="item-list">
                    ${packingList[category].map(item => `
                        <div class="item">
                            <input type="checkbox" id="${item.replace(/\s+/g, '-').toLowerCase()}">
                            <label for="${item.replace(/\s+/g, '-').toLowerCase()}">${item}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Add print button
    html += `<div class="print-button-container">
        <button id="print-button" class="print-button"><i class="fas fa-print"></i> Print Packing List</button>
    </div>`;
    
    packingListContainer.innerHTML = html;
    
    // Add print functionality
    document.getElementById('print-button').addEventListener('click', () => {
        window.print();
    });
}

// Generate travel tips with AI
async function generateTravelTipsWithAI() {
    // If no API key, use mock tips
    if (!API_CONFIG.AI_API_KEY || API_CONFIG.AI_API_KEY === 'YOUR_OPENAI_API_KEY') {
        return generateMockTravelTips();
    }
    
    try {
        const prompt = `Provide 5-7 useful travel tips for someone traveling to ${tripDetails.destination} 
        for ${tripDetails.tripDuration} days. The trip purpose is ${tripDetails.travelPurpose} and 
        the travelers are ${tripDetails.travelers.join(', ')}. Consider these activities: 
        ${tripDetails.activities.join(', ')} and special requirements: 
        ${tripDetails.specialRequirements.join(', ')}. 
        Return the tips as a bulleted list with concise but helpful advice.`;
        
        const response = await fetch(API_CONFIG.AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.AI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating travel tips with AI:', error);
        return generateMockTravelTips();
    }
}

// Generate mock travel tips (fallback)
function generateMockTravelTips() {
    return `
    1. Check visa requirements well in advance if traveling internationally.
    2. Notify your bank about your travel plans to avoid card issues.
    3. Download offline maps of the area in case you lose internet access.
    4. Pack a portable charger for your devices during sightseeing.
    5. Learn a few basic phrases in the local language if traveling abroad.
    6. Always carry some local currency for small purchases.
    7. Keep digital copies of important documents in your email.
    `;
}

// Display travel tips
function displayTravelTips(tips) {
    travelTips.style.display = 'block';
    
    // Convert markdown-style bullets to HTML list
    const tipsHtml = tips.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-\d\.\s]+/, '').trim())
        .filter(line => line.length > 0)
        .map(line => `<li><i class="fas fa-lightbulb"></i> ${line}</li>`)
        .join('');
    
    travelTips.innerHTML = `
        <h2><i class="fas fa-info-circle"></i> Travel Tips</h2>
        <ul>${tipsHtml}</ul>
    `;
}

// Get general AI response
async function getAIResponse(input) {
    // If no API key, use simple responses
    if (!API_CONFIG.AI_API_KEY || API_CONFIG.AI_API_KEY === 'YOUR_OPENAI_API_KEY') {
        return "I'm an AI assistant here to help with your packing needs. For more detailed responses, please connect an AI API.";
    }
    
    try {
        const response = await fetch(API_CONFIG.AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.AI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { 
                        role: "system", 
                        content: "You are a helpful travel assistant that helps people create packing lists. " +
                                 "Be friendly, concise, and focus on practical travel advice." 
                    },
                    { role: "user", content: input }
                ],
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error getting AI response:', error);
        return "I'm sorry, I couldn't process your request. Please try again.";
    }
}

// Fetch weather data for destination
async function fetchWeatherData() {
    if (!tripDetails.destination) return;
    
    try {
        // In a real app, you would use the weather API here
        // Example with OpenWeatherMap API:
        /*
        const response = await fetch(`${API_CONFIG.WEATHER_API_URL}?q=${tripDetails.destination}&appid=${API_CONFIG.WEATHER_API_KEY}&units=metric`);
        const data = await response.json();
        displayWeatherData(data);
        */
        
        // Mock weather data for demonstration
        const mockWeatherData = {
            name: tripDetails.destination,
            main: {
                temp: getRandomTemp(tripDetails.climate),
                feels_like: getRandomTemp(tripDetails.climate),
                humidity: Math.floor(Math.random() * 50) + 30
            },
            weather: [{
                main: getWeatherCondition(tripDetails.climate),
                description: getWeatherDescription(tripDetails.climate),
                icon: getWeatherIcon(tripDetails.climate)
            }],
            wind: {
                speed: (Math.random() * 10).toFixed(1)
            }
        };
        
        displayWeatherData(mockWeatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Helper functions for mock weather data
function getRandomTemp(climate) {
    climate = climate ? climate.toLowerCase() : '';
    if (climate.includes('cold')) return Math.floor(Math.random() * 5) - 5;
    if (climate.includes('warm')) return Math.floor(Math.random() * 10) + 20;
    if (climate.includes('hot')) return Math.floor(Math.random() * 10) + 30;
    return Math.floor(Math.random() * 20) + 10; // moderate
}

function getWeatherCondition(climate) {
    climate = climate ? climate.toLowerCase() : '';
    if (climate.includes('rain')) return 'Rain';
    if (climate.includes('sun')) return 'Clear';
    if (climate.includes('cloud')) return 'Clouds';
    return ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)];
}

function getWeatherDescription(climate) {
    climate = climate ? climate.toLowerCase() : '';
    if (climate.includes('rain')) return 'light rain';
    if (climate.includes('sun')) return 'clear sky';
    if (climate.includes('cloud')) return 'scattered clouds';
    return ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds'][Math.floor(Math.random() * 4)];
}

function getWeatherIcon(climate) {
    climate = climate ? climate.toLowerCase() : '';
    if (climate.includes('rain')) return '10d';
    if (climate.includes('sun')) return '01d';
    if (climate.includes('cloud')) return '03d';
    return ['01d', '02d', '03d', '04d'][Math.floor(Math.random() * 4)];
}

// Display weather data
function displayWeatherData(data) {
    weatherInfo.style.display = 'block';
    
    const weatherIconClass = getWeatherIconClass(data.weather[0].icon);
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const description = capitalizeFirstLetter(data.weather[0].description);
    
    weatherInfo.innerHTML = `
        <h2><i class="fas fa-cloud-sun"></i> Weather Forecast for ${data.name}</h2>
        <div class="weather-card">
            <div class="weather-icon">
                <i class="fas ${weatherIconClass}"></i>
            </div>
            <div class="weather-details">
                <div class="weather-temp">${temp}°C</div>
                <div class="weather-desc">${description}</div>
                <div class="weather-meta">
                    <div class="weather-meta-item">
                        <i class="fas fa-temperature-low"></i>
                        <span>Feels like ${feelsLike}°C</span>
                    </div>
                    <div class="weather-meta-item">
                        <i class="fas fa-tint"></i>
                        <span>${humidity}% humidity</span>
                    </div>
                    <div class="weather-meta-item">
                        <i class="fas fa-wind"></i>
                        <span>${windSpeed} km/h wind</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get weather icon class based on OpenWeatherMap icon code
function getWeatherIconClass(iconCode) {
    const iconMap = {
        '01d': 'fa-sun',       // clear sky (day)
        '01n': 'fa-moon',      // clear sky (night)
        '02d': 'fa-cloud-sun', // few clouds (day)
        '02n': 'fa-cloud-moon',// few clouds (night)
        '03d': 'fa-cloud',     // scattered clouds
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',     // broken clouds
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-rain',// shower rain
        '09n': 'fa-cloud-rain',
        '10d': 'fa-cloud-sun-rain', // rain (day)
        '10n': 'fa-cloud-moon-rain',// rain (night)
        '11d': 'fa-bolt',      // thunderstorm
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',  // snow
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',       // mist
        '50n': 'fa-smog'
    };
    
    return iconMap[iconCode] || 'fa-cloud';
}

// Get icon for category
function getCategoryIcon(category) {
    switch (category.toLowerCase()) {
        case 'clothing': return 'fa-tshirt';
        case 'toiletries': return 'fa-soap';
        case 'electronics': return 'fa-laptop';
        case 'documents': return 'fa-file-alt';
        case 'miscellaneous': return 'fa-ellipsis-h';
        default: return 'fa-check';
    }
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Toggle voice input
function toggleVoiceInput() {
    if (!recognition) {
        addMessage("Voice input is not supported in your browser. Please type your response.", 'bot');
        return;
    }
    
    if (voiceButton.classList.contains('recording')) {
        recognition.stop();
        voiceButton.classList.remove('recording');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
        recognition.start();
        voiceButton.classList.add('recording');
        voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        addMessage("Listening... Speak now.", 'bot');
    }
}

// Restart chat
function restartChat() {
    // Clear trip details
    tripDetails = {
        destination: '',
        tripDuration: '',
        travelDates: '',
        travelPurpose: '',
        accommodationType: '',
        climate: '',
        activities: [],
        travelers: [],
        specialRequirements: [],
        budgetLevel: '',
        transportationMode: ''
    };
    
    // Hide displays
    tripDetailsDisplay.style.display = 'none';
    packingListContainer.style.display = 'none';
    weatherInfo.style.display = 'none';
    travelTips.style.display = 'none';
    
    // Reset conversation
    conversationState = 'askDestination';
    
    // Clear chat messages except the first bot message
    const messages = document.querySelectorAll('.message');
    for (let i = 1; i < messages.length; i++) {
        messages[i].remove();
    }
    
    // Add new welcome message
    addMessage('Hello! Let\'s start over. Where are you going on your trip?', 'bot');
    
    // Focus input
    userInput.focus();
}