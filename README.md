# GitHub Webhook Monitor

A Flask-based web application that receives GitHub webhook events and displays repository activity in real-time.

## Features

- ✅ Receives webhook events from GitHub
- ✅ Stores events in MongoDB database
- ✅ Real-time UI that polls for updates every 15 seconds
- ✅ Displays push, pull request, and merge events
- ✅ Clean, modern, responsive design

## Technologies Used

- **Backend:** Flask (Python)
- **Database:** MongoDB Atlas (Cloud)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Integration:** GitHub Webhooks API
- **Development Tools:** ngrok (for local testing)

## Event Types Tracked

### 1. Push Events
Format: `{author} pushed to {branch} on {timestamp}`

Example: *"JohnDoe pushed to main on 30 Jan 2025 - 03:45 PM UTC"*

### 2. Pull Request Events
Format: `{author} submitted a pull request from {from_branch} to {to_branch} on {timestamp}`

Example: *"JohnDoe submitted a pull request from feature to main on 30 Jan 2025 - 04:00 PM UTC"*

### 3. Merge Events
Format: `{author} merged branch {from_branch} to {to_branch} on {timestamp}`

Example: *"JohnDoe merged branch feature to main on 30 Jan 2025 - 04:15 PM UTC"*

## Project Structure
```
webhook-repo/
├── app.py                 # Main Flask application
├── config.py             # Configuration (MongoDB, Flask settings)
├── requirements.txt      # Python dependencies
├── templates/
│   └── index.html       # UI template
├── static/
│   ├── css/
│   │   └── style.css    # Styling
│   └── js/
│       └── app.js       # Frontend polling logic
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.7+
- MongoDB Atlas account (free tier)
- GitHub account
- ngrok (for local development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/webhook-repo.git
cd webhook-repo
```

2. **Create virtual environment**
```bash
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure MongoDB**
- Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string
- Update `config.py` or create `.env` file:
```
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key
```

5. **Run the application**
```bash
python app.py
```

The app will run at `http://127.0.0.1:5000`

### Setting Up Webhooks (for testing)

1. **Expose local server with ngrok**
```bash
ngrok http 5000
```

2. **Configure GitHub webhook**
- Go to your repository → Settings → Webhooks
- Add webhook with:
  - Payload URL: `https://your-ngrok-url.ngrok-free.app/webhook`
  - Content type: `application/json`
  - Events: Push, Pull requests

3. **Test it**
- Push code to your repository
- Create a pull request
- Merge a pull request
- Watch events appear in the UI!

## API Endpoints

### `POST /webhook`
Receives GitHub webhook events

### `GET /api/events`
Returns latest events as JSON (used by UI for polling)

### `GET /`
Serves the main UI

## MongoDB Schema
```javascript
{
  "_id": ObjectId,
  "request_id": "unique-uuid",
  "author": "developer_name",
  "action": "push" | "pull_request" | "merge",
  "from_branch": "branch_name",      // for PR/merge
  "to_branch": "branch_name",
  "timestamp": ISODate,
}
```

## How It Works
```
GitHub Repository (action-repo)
       ↓
   [Push/PR/Merge]
       ↓
GitHub Webhook (automatic notification)
       ↓
Flask App (/webhook endpoint)
       ↓
MongoDB (store event)
       ↓
UI (polls /api/events every 15s)
       ↓
Display formatted event
```

## Related Repository

Test repository for triggering events: [action-repo](https://github.com/YOUR_USERNAME/action-repo)

## Screenshots

![GitHub Webhook Monitor UI](screenshots/ui.png)
*UI showing push, pull request, and merge events*

## Development

### Running Tests
```bash
# Push event test
cd ../action-repo
git push origin main

# PR event test
git checkout -b test-branch
git push origin test-branch
# Create PR on GitHub

# Merge event test
# Merge the PR on GitHub
```

## Future Enhancements

- [ ] Add authentication
- [ ] Support more GitHub event types
- [ ] Real-time updates with WebSockets
- [ ] Event filtering and search
- [ ] Export events to CSV
- [ ] Deployment to cloud platform

## Troubleshooting

**502 Bad Gateway error:**
- Ensure Flask is running
- Check that ngrok is running and pointing to correct port
- Verify Flask is running with `host='0.0.0.0'`

**Events not appearing:**
- Wait 15 seconds for UI to poll
- Check browser console for errors
- Verify MongoDB connection
- Check Flask logs for webhook receipt

**MongoDB connection errors:**
- Verify connection string in config.py
- Check network access in MongoDB Atlas (allow 0.0.0.0/0)
- Ensure database user credentials are correct

## Author

Created as part of GitHub webhook assessment task (April 2021)

## License

This project is for educational purposes.
