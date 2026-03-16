# 🌸 Maia — Your Cycle, Understood

A personalised cycle companion for hormones, mood, nourishment & moon alignment.
Supports regular and irregular cycles.

---

## Deploy to Vercel (free, 5 minutes)

### Option A — Drag & Drop (easiest)

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click **"Add New Project"**
3. Drag this entire `maia` folder onto the page
4. Vercel auto-detects Vite — click **Deploy**
5. Your app is live at `maia-[something].vercel.app`
6. Optionally set a custom domain in Project Settings → Domains

### Option B — Via GitHub (recommended for updates)

1. Create a free GitHub account at [github.com](https://github.com)
2. Create a new repository called `maia`
3. Upload all files in this folder to the repo
4. Go to [vercel.com](https://vercel.com) → Add New Project → Import from GitHub
5. Select your `maia` repo → Deploy
6. Every time you push changes to GitHub, Vercel auto-redeploys ✨

---

## Deploy to Netlify (alternative)

1. Go to [netlify.com](https://netlify.com) and sign up (free)
2. Drag the `maia` folder onto the deploy dropzone
3. Done — live at `[random].netlify.app`

---

## Run locally (for development)

```bash
# Install Node.js from nodejs.org if you haven't already

# In this folder:
npm install
npm run dev

# Opens at http://localhost:5173
```

---

## Project structure

```
maia/
├── index.html          ← App shell + SEO meta tags
├── vite.config.js      ← Build config
├── package.json        ← Dependencies
├── public/
│   └── favicon.svg     ← App icon
└── src/
    ├── main.jsx        ← React entry point
    └── App.jsx         ← The full Maia app
```

---

## Features

- 🌸 Personalised onboarding (name, cycle dates, diet, symptoms, focus)
- 📊 Personalised hormone graph scaled to your exact cycle length
- 〰 Irregular cycle support with symptom-based phase detection
- 🌙 Daily mood forecasts for every phase
- 🍃 Diet-aware meal plans (omnivore, vegetarian, vegan, gluten-free)
- 🌕 Real moon phase tracking & cycle alignment
- ⏰ Advance prep plans — shopping lists, meal prep, mood prep
- 💾 Saves to browser localStorage (no account needed)

---

## Want to add accounts & cross-device sync?

Connect [Supabase](https://supabase.com) (free tier) for:
- User authentication (email/Google)
- Cloud-synced cycle data
- Push notifications for phase transitions

---

Built with React + Recharts + Vite.
