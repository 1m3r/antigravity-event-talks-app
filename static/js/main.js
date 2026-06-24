document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const retryBtn = document.getElementById('retry-btn');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const notesContainer = document.getElementById('notes-container');

    // Fetch notes on initial load
    fetchNotes();

    // Event listeners
    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('spinning');
        fetchNotes().finally(() => {
            setTimeout(() => refreshBtn.classList.remove('spinning'), 500); // minimum visual spin time
        });
    });

    retryBtn.addEventListener('click', () => {
        fetchNotes();
    });

    async function fetchNotes() {
        showLoader();
        try {
            const response = await fetch('/api/notes');
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Failed to fetch release notes.');
            }
            const xmlText = await response.text();
            
            // Parse XML in the frontend!
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");
            
            // Check for parsing errors
            const parserError = xmlDoc.querySelector("parsererror");
            if (parserError) {
                throw new Error("Failed to parse XML data");
            }

            const entries = xmlDoc.querySelectorAll("entry");
            const notes = [];
            
            entries.forEach(entry => {
                const titleNode = entry.querySelector("title");
                const linkNode = entry.querySelector("link");
                const publishedNode = entry.querySelector("published");
                const updatedNode = entry.querySelector("updated");
                const contentNode = entry.querySelector("content");
                const summaryNode = entry.querySelector("summary");

                const title = titleNode ? titleNode.textContent : 'No Title';
                const link = linkNode ? linkNode.getAttribute('href') : '#';
                const published = publishedNode ? publishedNode.textContent : (updatedNode ? updatedNode.textContent : 'Unknown date');
                const content = contentNode ? contentNode.textContent : (summaryNode ? summaryNode.textContent : '');

                notes.push({ title, link, published, content });
            });

            renderNotes(notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
            showError(error.message);
        }
    }

    function renderNotes(notes) {
        notesContainer.innerHTML = '';
        
        if (!notes || notes.length === 0) {
            notesContainer.innerHTML = `
                <div class="note-card" style="text-align: center; color: var(--text-muted);">
                    No release notes found at this time.
                </div>
            `;
            showNotes();
            return;
        }

        notes.forEach((note, index) => {
            // Strip HTML from content for the tweet, keeping it short
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = note.content || '';
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            const shortSnippet = textContent.substring(0, 100).trim() + "...";
            
            // Format the date
            let formattedDate = note.published;
            try {
                const dateObj = new Date(note.published);
                if (!isNaN(dateObj.getTime())) {
                    formattedDate = new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }).format(dateObj);
                }
            } catch(e) {}

            // Create Tweet URL
            const tweetText = encodeURIComponent(`BigQuery Update: ${note.title}\n\n${shortSnippet}\n\n#GoogleCloud #BigQuery`);
            const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(note.link)}`;

            const card = document.createElement('div');
            card.className = 'note-card';
            // Stagger animation delay for neat visual effect
            card.style.animationDelay = `${index * 0.05}s`;
            
            card.innerHTML = `
                <div class="note-header">
                    <h2 class="note-title">
                        <a href="${note.link}" target="_blank" rel="noopener noreferrer">${note.title}</a>
                    </h2>
                    <span class="note-date">${formattedDate}</span>
                </div>
                <div class="note-content">
                    ${note.content}
                </div>
                <div class="note-actions">
                    <a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" class="tweet-btn">
                        <i class="fa-brands fa-twitter"></i>
                        <span>Share on X</span>
                    </a>
                </div>
            `;
            
            notesContainer.appendChild(card);
        });

        showNotes();
    }

    function showLoader() {
        loader.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        notesContainer.classList.add('hidden');
    }

    function showError(msg) {
        loader.classList.add('hidden');
        errorText.textContent = `Error: ${msg}`;
        errorMessage.classList.remove('hidden');
        notesContainer.classList.add('hidden');
    }

    function showNotes() {
        loader.classList.add('hidden');
        errorMessage.classList.add('hidden');
        notesContainer.classList.remove('hidden');
    }
});
