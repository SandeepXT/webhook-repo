// ========================================
// CONFIGURATION
// ========================================

const POLL_INTERVAL = 15000; // 15 seconds
let currentFilter = 'all';

// ========================================
// DOM ELEMENTS
// ========================================

const eventsContainer = document.getElementById('events-container');
const statusIndicator = document.getElementById('status');
const statusText = document.getElementById('status-text');
const lastUpdateElement = document.getElementById('last-update');
const totalEventsElement = document.getElementById('total-events');
const filterButtons = document.querySelectorAll('.filter-btn');

// ========================================
// STATE MANAGEMENT
// ========================================

let allEvents = [];
let isConnected = false;

// ========================================
// FETCH EVENTS FROM API
// ========================================

async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        const events = await response.json();
        allEvents = events;
        
        updateUI(events);
        updateStatus(true);
        updateStats(events.length);
        
    } catch (error) {
        console.error('Error fetching events:', error);
        updateStatus(false);
    }
}

// ========================================
// UPDATE UI WITH EVENTS
// ========================================

function updateUI(events) {
    // Filter events based on current filter
    const filteredEvents = currentFilter === 'all' 
        ? events 
        : events.filter(event => event.action === currentFilter);
    
    // Clear container
    eventsContainer.innerHTML = '';
    
    // No events state
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="no-events">
                <div class="no-events-icon">📭</div>
                <h2>No Events ${currentFilter !== 'all' ? 'in this category' : 'Yet'}</h2>
                <p>${currentFilter === 'all' 
                    ? 'Waiting for activity in your repository...' 
                    : `No ${currentFilter} events found. Try a different filter.`}</p>
            </div>
        `;
        return;
    }
    
    // Create event cards
    filteredEvents.forEach(event => {
        const eventCard = createEventCard(event);
        eventsContainer.appendChild(eventCard);
    });
    
    // Update last update time
    const now = new Date();
    lastUpdateElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// ========================================
// CREATE EVENT CARD
// ========================================

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = `event ${event.action}`;
    
    // Extract author name from message
    const authorMatch = event.message.match(/^(\w+)/);
    const author = authorMatch ? authorMatch[1] : 'Unknown';
    
    // Format message with highlighted author
    const formattedMessage = event.message.replace(
        author,
        `<span class="event-author">${author}</span>`
    );
    
    card.innerHTML = `
        <div class="event-content">
            <div class="event-message">${formattedMessage}</div>
            <div class="event-meta">
                <span class="event-type ${event.action}">${event.action.replace('_', ' ')}</span>
            </div>
        </div>
    `;
    
    return card;
}

// ========================================
// UPDATE CONNECTION STATUS
// ========================================

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

// ========================================
// UPDATE STATISTICS
// ========================================

function updateStats(count) {
    totalEventsElement.textContent = count;
}

// ========================================
// FILTER FUNCTIONALITY
// ========================================

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update current filter
        currentFilter = button.dataset.filter;
        
        // Re-render events with filter
        updateUI(allEvents);
    });
});

// ========================================
// INITIALIZE APPLICATION
// ========================================

function init() {
    console.log('🚀 GitHub Webhook Monitor initialized');
    console.log(`📊 Polling interval: ${POLL_INTERVAL / 1000} seconds`);
    
    // Initial fetch
    fetchEvents();
    
    // Poll every 15 seconds
    setInterval(fetchEvents, POLL_INTERVAL);
}

// ========================================
// START APPLICATION
// ========================================

document.addEventListener('DOMContentLoaded', init);