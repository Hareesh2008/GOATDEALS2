# 🐐 GoatedDeals — Affiliate Product Website

> Low Price. Zero Compromise. — A professional, animated affiliate landing page for Amazon & Flipkart deals.

---

## 🚀 Deploy in Minutes

### Option 1 — Netlify (Easiest)
1. Extract the ZIP
2. Open terminal inside the folder:
   ```bash
   npm install
   npm run build
   ```
3. Go to **https://netlify.com/drop** → drag the `dist/` folder → live instantly ✅

### Option 2 — Vercel (Auto-deploys from GitHub)
1. Push this folder to a GitHub repo
2. Go to **https://vercel.com** → New Project → Import your repo
3. Vercel auto-detects Vite → click Deploy ✅

### Option 3 — GitHub Pages
1. Push to GitHub
2. Run `npm run build`
3. Settings → Pages → Deploy from `dist/` folder ✅

---

## 💻 Local Dev

```bash
npm install       # install dependencies
npm run dev       # start dev server at localhost:5173
npm run build     # build for production → dist/
npm run preview   # preview production build locally
```

---

## 🔐 Admin Panel

- Click the **⚙ gear icon** at bottom-right
- **Username:** `HAREESHTECH`
- **Password:** `0987654321`
- Use **"Add Product"** tab to post new deals (fill the form manually)
- Use **"Manage"** tab to view and **delete** any product you posted
- Products are saved in localStorage and appear instantly

---

## ✏️ Customising

| What | Where |
|------|-------|
| Demo products | `src/App.jsx` → `DEMO_PRODUCTS` array |
| Admin credentials | `src/App.jsx` → `ADMIN` constant |
| Brand name / logo | `src/App.jsx` → Navbar section |
| Colors | `src/App.jsx` → find `#F54F1E` (orange accent) |
| Animations | `src/index.css` → keyframes section |
| Fonts | `index.html` → Google Fonts link |

---

## 📁 Project Structure

```
goateddeals/
├── index.html           ← HTML entry point & meta tags
├── package.json         ← Dependencies & scripts
├── vite.config.js       ← Vite config
├── src/
│   ├── main.jsx         ← React entry point
│   ├── App.jsx          ← Full website (edit products & colors here)
│   └── index.css        ← Global styles, animations, responsive rules
└── README.md
```

---

## ⚠️ Affiliate Disclosure

Update the footer text in `src/App.jsx` with your actual
Amazon Associates tracking ID and Flipkart affiliate details.

---

© 2025 GoatedDeals
