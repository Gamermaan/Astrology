// Discord Webhooks Configuration
const WEBHOOK_ASTRO_FORM = "https://discord.com/api/webhooks/1450945508477505758/yw1YodPzU1E3rmQ6M__i4j3vg6MK_gi_lt-5DNvsyAghsn9W4KPlSfXgCm_sGksRbIbg";
const WEBHOOK_CHAT = "https://discord.com/api/webhooks/1450945996648615947/O6Fsk1cAMlzj6VRsT3PMSWj-CoDK47xX1q-QwgYcr7m9Yq9T8BLirTahr0bKHmE4vzq1";

// AI Configuration
const USE_MOCK_AI = true;
// Key is loaded from config.js as CONFIG.HF_API_KEY

// State
let currentUser = {
    email: "user@example.com",
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
const astroForm = document.getElementById('astrology-details-form');
if (astroForm) {
    console.log("Attaching event listener to Astro Form");
    astroForm.addEventListener('submit', async (e) => {
        console.log("Form submitted!");
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
        if (chatHistory) chatHistory.innerHTML = '';

        // Initial AI greeting personalized
        addMessage('ai', `Welcome, ${formData.name}. I see you were born in ${formData.place} at ${formData.time}. The stars have much to tell you about your path. What is on your mind?`);
    });
}

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
    if (!chatHistory) return;

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

    // AI Response
    let aiResponse = "";
    if (USE_MOCK_AI) {
        aiResponse = await getMockAIResponse(text, currentUser.astroData);
    } else {
        addMessage('ai', "Consulting the stars...");

        try {
            aiResponse = await getHuggingFaceResponse(text, currentUser.astroData);
        } catch (error) {
            console.error(error);
            aiResponse = `Connection Error: ${error.message}.`;
        }
    }

    // Remove "Consulting the stars..."
    const messages = chatHistory.querySelectorAll('.message');
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.innerText.includes("Consulting the stars...")) {
        lastMsg.remove();
    }

    addMessage('ai', aiResponse);

    // Log AI response to Discord
    sendToDiscord(WEBHOOK_CHAT, {
        title: "Chat Interaction",
        color: 0xa855f7,
        description: `**AI:** ${aiResponse}`
    });
}

async function getHuggingFaceResponse(userText, astroContext) {
    const apiKey = (typeof CONFIG !== 'undefined' && CONFIG.HF_API_KEY) ? CONFIG.HF_API_KEY : '';

    if (!apiKey) {
        throw new Error("API Key configuration missing");
    }

    // Using Mistral 7B Instruct v0.2 as requested
    const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

    // Construct a single prompt string incorporating context
    const fullPrompt = `You are AstroGuide AI. 
    User Context: Name: ${astroContext.name || 'Seeker'}, Place: ${astroContext.place || 'Unknown'}.
    Focus: ${astroContext.focus || 'General'}.
    User Question: ${userText}
    
    Answer as a mystical astrologer in under 100 words.`;

    const response = await fetch(MODEL_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: fullPrompt
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // HF Inference API usually returns array: [{ generated_text: "..." }]
    if (Array.isArray(data) && data.length > 0) {
        let generatedText = data[0].generated_text;
        // Clean up: sometimes the model repeats the prompt. Remove prompt if present.
        if (generatedText.startsWith(fullPrompt)) {
            generatedText = generatedText.slice(fullPrompt.length).trim();
        }
        return generatedText || "The stars are silent.";
    } else if (data.generated_text) {
        return data.generated_text;
    } else {
        return "No response from the cosmos.";
    }
}

if (sendBtn) {
    sendBtn.addEventListener('click', handleChat);
}

if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });
}

// Mock AI Logic (Fallback)
async function getMockAIResponse(userText, astroContext) {
    await new Promise(r => setTimeout(r, 1000));
    const responses = [
        "The alignment of Mars suggests caution in this area.",
        "Your birth chart indicates a strong potential for growth right now.",
        "The stars are aligning in your favor essentially.",
        "This is a time for reflection, as Mercury is in retrograde.",
        "Consider the position of Venus in your chart; it governs your relationships."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Discord Webhook Helper
async function sendToDiscord(webhookUrl, embedData) {
    try {
        const payload = { embeds: [embedData] };
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Failed to send webhook:", e);
    }
}
