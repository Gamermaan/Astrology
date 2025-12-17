// Discord Webhooks Configuration
const WEBHOOK_ASTRO_FORM = "https://discord.com/api/webhooks/1450945508477505758/yw1YodPzU1E3rmQ6M__i4j3vg6MK_gi_lt-5DNvsyAghsn9W4KPlSfXgCm_sGksRbIbg";
const WEBHOOK_CHAT = "https://discord.com/api/webhooks/1450945996648615947/O6Fsk1cAMlzj6VRsT3PMSWj-CoDK47xX1q-QwgYcr7m9Yq9T8BLirTahr0bKHmE4vzq1";

// AI Configuration
const USE_MOCK_AI = true;

// State
let currentUser = {
    email: "user@example.com", // Default or retrieved from session if we had one
    astroData: {}
};

// DOM Elements
const sections = {
    astroForm: document.getElementById('astro-form-page'),
    chat: document.getElementById('chat-page')
};

// Navigation Helper
function showSection(sectionId) {
    Object.values(sections).forEach(sec => {
        if (sec) {
            sec.classList.remove('active-section');
            sec.classList.add('hidden-section');
        }
    });
    if (sections[sectionId]) {
        sections[sectionId].classList.remove('hidden-section');
        sections[sectionId].classList.add('active-section');
    }
}

// 1. Astrology Form Logic
document.getElementById('astrology-details-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect Data
    const formData = {
        name: document.getElementById('full-name').value,
        dob: document.getElementById('dob').value,
        time: document.getElementById('birth-time').value,
        place: document.getElementById('birth-place').value,
        focus: document.getElementById('astro-focus').value
    };

    currentUser.astroData = formData;

    // Send to Discord
    await sendToDiscord(WEBHOOK_ASTRO_FORM, {
        title: "New Astrology Profile",
        color: 0x3b82f6, // Blue
        fields: [
            { name: "User", value: currentUser.email, inline: false },
            { name: "Name", value: formData.name, inline: true },
            { name: "DOB", value: formData.dob, inline: true },
            { name: "Time", value: formData.time, inline: true },
            { name: "Place", value: formData.place, inline: true },
            { name: "Focus Area", value: formData.focus || "General", inline: false }
        ]
    });

    showSection('chat');

    // Clear initial placeholder message
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';

    // Initial AI greeting personalized
    addMessage('ai', `Welcome, ${formData.name}. I see you were born in ${formData.place} at ${formData.time}. The stars have much to tell you about your path. What is on your mind?`);
});


// 2. Chat Logic
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function addMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-star"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = text;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);

    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    // User Message
    addMessage('user', text);
    userInput.value = '';

    // Log to Discord
    sendToDiscord(WEBHOOK_CHAT, {
        title: "Chat Interaction",
        color: 0xec4899, // Pink
        description: `**User (${currentUser.email}):** ${text}`
    });

    // AI Response (Mock)
    // showTypingIndicator(); 

    let aiResponse = "";
    if (USE_MOCK_AI) {
        aiResponse = await getMockAIResponse(text, currentUser.astroData);
    } else {
        aiResponse = "I am currently in demo mode.";
    }

    addMessage('ai', aiResponse);

    // Log AI response to Discord
    sendToDiscord(WEBHOOK_CHAT, {
        title: "Chat Interaction",
        color: 0xa855f7,
        description: `**AI:** ${aiResponse}`
    });
}

sendBtn.addEventListener('click', handleChat);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
});

// Mock AI Logic
async function getMockAIResponse(userText, astroContext) {
    await new Promise(r => setTimeout(r, 1000));

    const responses = [
        "The alignment of Mars suggests caution in this area.",
        "Your birth chart indicates a strong potential for growth right now.",
        "The stars are aligning in your favor essentially.",
        "This is a time for reflection, as Mercury is in retrograde.",
        "Consider the position of Venus in your chart; it governs your relationships.",
        "Financial stability is foreseen, but patience is required.",
        `Based on your birth in ${astroContext.place}, I sense a connection to water signs.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

// Discord Webhook Helper
async function sendToDiscord(webhookUrl, embedData) {
    try {
        const payload = {
            embeds: [embedData]
        };

        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Failed to send webhook:", e);
    }
}
