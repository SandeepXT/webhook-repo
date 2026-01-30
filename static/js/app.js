// Configuration
const POLL_INTERVAL = 15000; // 15 seconds in milliseconds

// DOM Elements
const eventsContainer = document.getElementById('events-container');
const statusIndicator = document.getElementById('status');
const statusText = document.getElementById('status-text');
const lastUpdateElement = document.getElementById('last-update');

// State
let isConnected = false;

// Fetch events from API
async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        const events = await response.json();
        updateUI(events);
        updateStatus(true);
        
    } catch (error) {
        console.error('Error fetching events:', error);
        updateStatus(false);
    }
}

// Update the UI with events
function updateUI(events) {
    // Clear container
    eventsContainer.innerHTML = '';
    
    if (events.length === 0) {
        eventsContainer.innerHTML = `
            <div class="no-events">
                <h2>No Events Yet</h2>
                <p>Waiting for activity in your repository...</p>
            </div>
        `;
        return;
    }
    
    // Create event elements
    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = `event ${event.action}`;
        
        eventDiv.innerHTML = `
            <div class="event-message">
                ${event.message}
                <span class="event-type ${event.action}">${event.action}</span>
            </div>
        `;
        
        eventsContainer.appendChild(eventDiv);
    });
    
    // Update last update time
    const now = new Date();
    lastUpdateElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Update connection status
function updateStatus(connected) {
    isConnected = connected;
    
    if (connected) {
        statusIndicator.className = 'status-indicator connected';
        statusText.textContent = 'Connected';
    } else {
        statusIndicator.className = 'status-indicator disconnected';
        statusText.textContent = 'Connection Error';
    }
}

// Initialize
function init() {
    console.log('GitHub Webhook Monitor initialized');
    
    // Initial fetch
    fetchEvents();
    
    // Poll every 15 seconds
    setInterval(fetchEvents, POLL_INTERVAL);
}

// Start when page loads
document.addEventListener('DOMContentLoaded', init);