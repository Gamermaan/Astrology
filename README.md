# JotishVidya - Deployment Guide

This project is a **100% Static Website**. This means it requires no backend server, no database, and no build steps (like `npm run build`).

## 🚀 How to Deploy

### Option 1: Netlify (Recommended for easiest drag-and-drop)
1. Go to [app.netlify.com](https://app.netlify.com).
2. Drag and drop the `astrology` folder directly onto the page.
3. You are live! 

### Option 2: GitHub Pages
1. Push this code to a GitHub repository.
2. Go to **Settings** > **Pages**.
3. Select `main` branch and `/root` folder.
4. Save.

### Option 3: Vercel
1. Install Vercel CLI or go to Vercel Dashboard.
2. Import your Git repository.
3. Since there is no framework, just leave the "Build Command" empty.
4. Click **Deploy**.

## 📂 Files Included
- `index.html`: The main entry point.
- `style.css`: All designs and animations.
- `script.js`: Application logic and Discord Webhooks.

## ⚠️ Important Note
This site uses **Client-Side Webhooks**. This works perfectly for small projects, but be aware that anyone who knows how to "Inspect Element" *could* theoretically see your Discord Webhook URLs. For a serious production app with sensitive data, you would want to move those API calls to a serverless function (like Netlify Functions). 

**But for this request: Yes, it is fully deployable!**
