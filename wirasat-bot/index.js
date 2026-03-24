require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const BOT_CONFIG = require('./bot-config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ── Ollama Config ──────────────────────────────────────────
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';

// ── Build System Prompt from bot-config ───────────────────
function buildSystemPrompt() {
  return `
You are ${BOT_CONFIG.botName}, the customer service assistant for ${BOT_CONFIG.projectName}.
Your tone should be: ${BOT_CONFIG.botTone}.
IMPORTANT RULE: Provide concise and highly specific answers. Avoid unnecessary conversational filler, but make sure to provide sufficient detail to fully answer the user's question.

=== ABOUT THE PROJECT ===
${BOT_CONFIG.about}

=== KEY FEATURES ===
${BOT_CONFIG.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

=== HOW TO USE ===
${BOT_CONFIG.howToUse}

=== FREQUENTLY ASKED QUESTIONS ===
${BOT_CONFIG.faqs.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}

=== CONTACT & TEAM ===
Team: ${BOT_CONFIG.teamName}
Email: ${BOT_CONFIG.contactEmail}
Website: ${BOT_CONFIG.websiteURL}
  `.trim();
}

// ── Ask AI ─────────────────────────────────────────────
async function askAI(userMessage, conversationHistory = []) {
  // Map our generic 'user' / 'assistant' history format to standard API format
  const formattedHistory = conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : msg.role,
    content: msg.content
  }));

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...formattedHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.message?.content || "No response generated.";
  } catch (error) {
    console.error("Ollama Error:", error);
    return "Error communicating with the local AI. Ensure Ollama is running and has the model downloaded.";
  }
}

// ── Website API Endpoint ───────────────────────────────────
app.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const reply = await askAI(message, history || []);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
  }
});

// ── Telegram Bot ───────────────────────────────────────────
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'your_telegram_bot_token_here') {
  const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  const telegramHistory = {}; // Store per-user conversation history

  telegramBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage) return;

    // Handle /start command
    if (userMessage === '/start') {
      telegramHistory[chatId] = [];
      return telegramBot.sendMessage(chatId,
        `👋 Hi! I'm ${BOT_CONFIG.botName}, the assistant for *${BOT_CONFIG.projectName}*.\n\nHow can I help you today?`,
        { parse_mode: 'Markdown' }
      );
    }

    // Keep last 10 messages in history per user
    if (!telegramHistory[chatId]) telegramHistory[chatId] = [];

    try {
      const reply = await askAI(userMessage, telegramHistory[chatId]);

      // Update history
      telegramHistory[chatId].push({ role: 'user', content: userMessage });
      telegramHistory[chatId].push({ role: 'assistant', content: reply });
      if (telegramHistory[chatId].length > 20) {
        telegramHistory[chatId] = telegramHistory[chatId].slice(-20);
      }

      telegramBot.sendMessage(chatId, reply);
    } catch (err) {
      console.error(err);
      telegramBot.sendMessage(chatId, "Sorry, I'm having trouble. Please try again!");
    }
  });
  console.log('✅ Telegram bot listener started');
} else {
  console.log('⚠️ TELEGRAM_BOT_TOKEN not found in environment; Telegram bot is disabled.');
}

// ── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Be2 API Server running on port ${PORT}`));
