const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let conversationHistory = [];

function appendMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    let prompt = role === 'user' ? 'user@guest:~$' : 'root@Be1:~$';
    
    msgDiv.innerHTML = `<span class="prompt">${prompt}</span> ${formatText(content)}`;
    chatWindow.appendChild(msgDiv);
    
    // Auto-scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot typing';
    msgDiv.id = 'typing-indicator';
    msgDiv.innerHTML = `<span class="prompt">root@Be1:~$</span> <span class="typing-indicator">Processing</span>`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Basic markdown formatting (bolding and linebreaks) to HTML
function formatText(text) {
    if (!text) return '';
    let formated = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formated = formated.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return formated.replace(/\n/g, '<br>');
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = messageInput.value.trim();
    if (!text) return;

    // UI Updates
    messageInput.value = '';
    sendBtn.disabled = true;
    appendMessage('user', text);
    appendTypingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: text,
                history: conversationHistory
            })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (response.ok) {
            appendMessage('bot', data.reply);
            
            // Maintain history for future API calls
            conversationHistory.push({ role: 'user', content: text });
            conversationHistory.push({ role: 'assistant', content: data.reply });
            
            // Keep history lean
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }
        } else {
            throw new Error(data.reply || 'Server Error');
        }

    } catch (err) {
        removeTypingIndicator();
        appendMessage('error', 'ERR_CONNECTION_FAILED: ' + err.message);
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
});
