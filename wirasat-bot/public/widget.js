// This file auto-creates a chat bubble on your website
// Just include 1 script tag and it works!

(function() {
  const BACKEND_URL = 'http://localhost:3000'; // ← Update after deploy (e.g. 'https://YOUR-RENDER-URL.onrender.com')

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #cb-bubble { position:fixed; bottom:20px; right:20px; width:56px; height:56px;
      background:#5B4FD4; border-radius:50%; cursor:pointer; display:flex;
      align-items:center; justify-content:center; font-size:24px; z-index:9999;
      box-shadow:0 4px 12px rgba(0,0,0,0.2); }
    #cb-window { position:fixed; bottom:90px; right:20px; width:340px; height:460px;
      background:#fff; border-radius:16px; box-shadow:0 8px 30px rgba(0,0,0,0.15);
      display:none; flex-direction:column; z-index:9999; overflow:hidden; }
    #cb-header { background:#5B4FD4; color:#fff; padding:14px 16px; font-weight:600; font-size:15px; }
    #cb-messages { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
    .cb-msg { max-width:80%; padding:8px 12px; border-radius:12px; font-size:13px; line-height:1.4; }
    .cb-msg.user { background:#5B4FD4; color:#fff; align-self:flex-end; border-bottom-right-radius:4px; }
    .cb-msg.bot { background:#f0f0f0; color:#333; align-self:flex-start; border-bottom-left-radius:4px; }
    #cb-input-row { display:flex; padding:10px; border-top:1px solid #eee; gap:8px; }
    #cb-input { flex:1; border:1px solid #ddd; border-radius:8px; padding:8px 10px; font-size:13px; outline:none; }
    #cb-send { background:#5B4FD4; color:#fff; border:none; border-radius:8px; padding:8px 14px; cursor:pointer; }
  `;
  document.head.appendChild(style);

  // Create HTML
  document.body.innerHTML += `
    <div id="cb-bubble">💬</div>
    <div id="cb-window">
      <div id="cb-header">🤖 Chat with us</div>
      <div id="cb-messages">
        <div class="cb-msg bot">Hi there! 👋 How can I help you today?</div>
      </div>
      <div id="cb-input-row">
        <input id="cb-input" placeholder="Type a message..." />
        <button id="cb-send">Send</button>
      </div>
    </div>
  `;

  let history = [];
  const bubble = document.getElementById('cb-bubble');
  const win = document.getElementById('cb-window');
  const input = document.getElementById('cb-input');
  const messages = document.getElementById('cb-messages');

  bubble.onclick = () => win.style.display = win.style.display === 'flex' ? 'none' : 'flex';

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    messages.innerHTML += `<div class="cb-msg user">${text}</div>`;
    messages.innerHTML += `<div class="cb-msg bot" id="cb-typing">Typing...</div>`;
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      const data = await res.json();

      document.getElementById('cb-typing').remove();
      messages.innerHTML += `<div class="cb-msg bot">${data.reply}</div>`;
      messages.scrollTop = messages.scrollHeight;

      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      document.getElementById('cb-typing').remove();
      messages.innerHTML += `<div class="cb-msg bot" style="color:red;">Error connecting to server.</div>`;
    }
  }

  document.getElementById('cb-send').onclick = sendMessage;
  input.onkeydown = e => e.key === 'Enter' && sendMessage();
})();
