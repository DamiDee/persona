# Persona

**Persona** is a premium, Apple-grade conversational web application that lets users have simulated conversations with curated "Personas" — each modeled on the speaking style, teachings, and published corpus of a real public figure.

> ⚠️ **Important:** This is a front-end demo only. All personas, conversations, authentication, and payments are mocked. See the Legal Disclaimer below before using real individuals' names, likenesses, or materials in production.

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 + CSS Custom Properties |
| Animation | Framer Motion |
| State | Zustand (with localStorage persistence) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

---

## Project Structure

```
src/
  app/          — App.jsx (router + providers)
  layouts/      — AuthLayout, AppLayout
  pages/        — One folder per page
  components/
    ui/          — Design system primitives (Button, GlassPanel, Input, …)
    chat/        — Chat-specific components (NeuralBackground, Sidebar, …)
  store/         — Zustand stores (auth, chat, theme)
  data/          — Mock persona & chat data
  lib/           — Mock API layer (simulated latency + streaming)
  hooks/         — Custom hooks (cursor, reduced-motion, localStorage, stream)
  styles/        — tokens.css, globals.css
```

---

## Where Mock Data Lives

| File | Purpose |
|---|---|
| `src/data/mockPersonas.js` | 4 demo personas with placeholder bios, gradient configs, suggested prompts |
| `src/data/mockChats.js` | Seed conversation history for the sidebar |
| `src/lib/mockApi.js` | All simulated API calls (auth, personas, chat streaming, payments) |

To swap in real data, replace the functions in `mockApi.js` with real HTTP calls — the stores (`useAuthStore`, `useChatStore`) already call through this interface.

---

## Mock Credentials

Any email + password combination works. You can also click **Continue with Google** (simulated instant login). To test an error state, use password `wrong`.

---

## Features

- ✅ 4-slide animated onboarding
- ✅ Sign Up / Login with inline validation
- ✅ Persona Library with search and category filters
- ✅ Chat experience with token-streaming simulation
- ✅ NeuralBackground canvas (cursor-reactive, theme-adaptive)
- ✅ Animated persona avatar (breathing + typing waveform)
- ✅ Collapsible sidebar with grouped chat history
- ✅ Mobile drawer navigation
- ✅ Premium upgrade page with mock checkout flow
- ✅ Settings with theme segmented control (light/dark/system)
- ✅ Dark/light mode persisted across reloads
- ✅ Reduced-motion support throughout
- ✅ 404 page

---

## ⚖️ Legal Disclaimer — Real Persona Content

> **This front-end build uses placeholder / demo content only.**
>
> The personas listed (Joshua Selman, Femi Lazarus, Myles Munroe, Chimamanda Adichie) are used as **UI placeholders for scaffolding and demonstration purposes only**. No real content, likenesses, voices, or writings from these individuals are incorporated into this build.
>
> **Before using this product with real individuals' names, materials, or likenesses in a production or publicly accessible environment, you must:**
>
> 1. **Obtain explicit written consent** from each individual or their estate.
> 2. **License all source materials** (sermons, books, interviews, recordings) through appropriate channels, respecting copyright law.
> 3. **Engage legal counsel** to review right-of-publicity, defamation, and AI/likeness regulations in your jurisdiction.
> 4. **Implement a separate content ingestion and ML training pipeline** to actually ground each persona's responses in their real corpus — this is entirely outside the scope of this front-end prototype.
>
> The developer(s) of this codebase are not responsible for any misuse involving real individuals' identities, likenesses, or materials.

---

## Design System

The design is driven by CSS custom properties defined in `src/styles/tokens.css`:

- **Theme**: toggled via `data-theme="light|dark"` on `<html>`
- **Accent color**: `#22d3ee` (dark) / `#00c2d1` (light) — cyan, used sparingly
- **Glassmorphism**: `backdrop-filter: blur(24px)` panels, via `.glass`, `.glass-md`, `.glass-strong` utility classes
- **Spacing**: 8pt scale (4, 8, 12, 16, 24, 32, 48, 64, 96, 128px)
- **Typography**: Inter (Google Fonts) + Apple system font stack fallback
