import feedparser
from flask import Flask, render_template, jsonify
import ssl
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes')
def get_notes():
    url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
    try:
        # Use feedparser to get the data
        # To avoid SSL verification issues in some environments, we can fetch via requests first
        # But requests usually works fine.
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        notes = []
        for entry in feed.entries:
            # Extract content from atom feed structure
            content = ""
            if 'content' in entry and len(entry.content) > 0:
                content = entry.content[0].value
            elif 'summary' in entry:
                content = entry.summary
                
            notes.append({
                'title': entry.get('title', 'No Title'),
                'link': entry.get('link', '#'),
                'published': entry.get('published', entry.get('updated', 'Unknown date')),
                'content': content
            })
        return jsonify({'status': 'success', 'notes': notes})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
