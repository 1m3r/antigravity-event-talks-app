# BigQuery Release Notes App

A modern, fast, and beautiful web application that fetches and displays the latest Google Cloud BigQuery release notes in real-time. Built with a sleek dark-mode glassmorphism UI.

## Features
- **Real-Time Feed:** Directly pulls the official BigQuery XML release feed.
- **Dependency-Free Server:** Uses a lightweight Python standard-library server (`server.py`) as a CORS proxy.
- **Client-Side Parsing:** Leverages the native browser `DOMParser` for blazing-fast XML to JSON conversion.
- **One-Click Sharing:** Instantly draft a Tweet from any release note, pre-filled with context, snippets, and hashtags.

## Architecture
This project features a clean separation between client and server:
1. **Server (`server.py`)**: A pure-Python proxy that serves static files and proxies XML data to bypass browser CORS restrictions.
2. **Client (`static/js/main.js`)**: Handles XML parsing, state management, and dynamic DOM manipulation.

*(Note: An alternative backend implementation is included in `app.py` for environments that prefer server-side XML parsing using Flask and `feedparser`).*

## Getting Started

### Prerequisites
- Python 3.x

### Running the App
1. Clone the repository and navigate into the project folder:
   ```bash
   git clone https://github.com/1m3r/antigravity-event-talks-app.git
   cd antigravity-event-talks-app
   ```
2. Start the built-in server:
   ```bash
   python3 server.py
   ```
3. Open your browser to: **http://localhost:5000**

## Project Structure
- `server.py` - The main entry point and proxy server.
- `templates/index.html` - The application skeleton.
- `static/css/style.css` - Styling, layout, and modern animations.
- `static/js/main.js` - Data fetching, XML parsing, and UI updates.
