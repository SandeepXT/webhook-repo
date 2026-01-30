from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from datetime import datetime
from config import Config
import uuid

app = Flask(__name__)
app.config.from_object(Config)

# MongoDB Connection
client = MongoClient(app.config['MONGO_URI'])
db = client['github_webhooks']
events_collection = db['events']

# Helper function to format timestamp
def format_timestamp(timestamp):
    """Convert ISO timestamp to readable format"""
    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    return dt.strftime('%d %b %Y - %I:%M %p UTC')

# Helper function to parse GitHub webhook payload
def parse_webhook_payload(payload, event_type):
    """Extract relevant information from GitHub webhook payload"""
    
    event_data = {
        'request_id': str(uuid.uuid4()),
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    
    if event_type == 'push':
        # Parse PUSH event
        event_data['action'] = 'push'
        event_data['author'] = payload.get('pusher', {}).get('name', 'Unknown')
        
        # Extract branch name from ref (refs/heads/main -> main)
        ref = payload.get('ref', '')
        event_data['to_branch'] = ref.split('/')[-1] if ref else 'unknown'
        event_data['from_branch'] = None
        
    elif event_type == 'pull_request':
        # Parse PULL REQUEST event
        pr_data = payload.get('pull_request', {})
        action = payload.get('action', '')
        
        if action == 'closed' and pr_data.get('merged', False):
            # This is a MERGE event
            event_data['action'] = 'merge'
            event_data['author'] = pr_data.get('merged_by', {}).get('login', 'Unknown')
        else:
            # This is a PULL REQUEST event
            event_data['action'] = 'pull_request'
            event_data['author'] = pr_data.get('user', {}).get('login', 'Unknown')
        
        event_data['from_branch'] = pr_data.get('head', {}).get('ref', 'unknown')
        event_data['to_branch'] = pr_data.get('base', {}).get('ref', 'unknown')
    
    return event_data

@app.route('/')
def index():
    """Render the main UI page"""
    return render_template('index.html')

@app.route('/webhook', methods=['POST'])
def webhook():
    """Endpoint to receive GitHub webhook events"""
    try:
        # Get the event type from headers
        event_type = request.headers.get('X-GitHub-Event')
        
        # Get the payload
        payload = request.json
        
        print(f"Received {event_type} event")  # For debugging
        
        # Parse the payload based on event type
        if event_type in ['push', 'pull_request']:
            event_data = parse_webhook_payload(payload, event_type)
            
            # Store in MongoDB
            events_collection.insert_one(event_data)
            print(f"Stored event: {event_data}")  # For debugging
            
            return jsonify({'status': 'success', 'message': 'Event received'}), 200
        else:
            return jsonify({'status': 'ignored', 'message': f'Event type {event_type} not tracked'}), 200
            
    except Exception as e:
        print(f"Error processing webhook: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    """API endpoint to get latest events for UI polling"""
    try:
        # Get latest 20 events, sorted by timestamp (newest first)
        events = list(events_collection.find(
            {}, 
            {'_id': 0}  # Exclude MongoDB _id field
        ).sort('timestamp', -1).limit(20))
        
        # Format events for display
        formatted_events = []
        for event in events:
            action = event.get('action')
            author = event.get('author')
            to_branch = event.get('to_branch')
            from_branch = event.get('from_branch')
            timestamp = event.get('timestamp')
            
            # Format timestamp
            formatted_time = format_timestamp(timestamp)
            
            # Create display message based on action type
            if action == 'push':
                message = f'{author} pushed to {to_branch} on {formatted_time}'
            elif action == 'pull_request':
                message = f'{author} submitted a pull request from {from_branch} to {to_branch} on {formatted_time}'
            elif action == 'merge':
                message = f'{author} merged branch {from_branch} to {to_branch} on {formatted_time}'
            else:
                message = f'{author} performed {action} on {formatted_time}'
            
            formatted_events.append({
                'message': message,
                'action': action,
                'timestamp': timestamp
            })
        
        return jsonify(formatted_events), 200
        
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)