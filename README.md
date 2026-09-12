# Panther Studio 🐆

AI Creative Engineering Platform — Vector, Color, Typography, Script, Image & PSD studios for designers.

## Run the full app (with backend)

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build + start:

```bash
npm run build      # dist/ (frontend + dist/server.cjs)
npm start          # node dist/server.cjs
```

## Standalone single-file HTML (no server, no install)

```bash
npm run standalone   # builds and inlines everything into panther-studio.html
npm run serve:standalone   # optional: preview it at http://localhost:8080
```

Download **`panther-studio.html`** and double-click it — the whole app runs in
the browser with built-in offline engines:

| Tool | Standalone (double-click) | With server |
|---|---|---|
| Vector Studio | ✅ full (client vectorizer) | ✅ + server API |
| Color Studio | ✅ full + local AI palette | ✅ + Gemini palette |
| Typography Studio | ✅ full (PNG/SVG/PDF/PSD/AI/EPS/DXF/CDR exports) | ✅ |
| Script Studio | ✅ offline dictionary conversion (hi/gu/mr/pa/bn/ta/te/ur/ar/ja/zh/es/fr/de) | ✅ + Gemini AI |
| PSD Studio (magic layers) | ✅ local magic-layer engine (same as server) | ✅ + Gemini vision |
| Image Studio | ⚠️ needs internet — tries free Pollinations FLUX directly | ✅ + Gemini/DALL·E/FLUX/Veo (API keys) |

Notes:
- Google Fonts load from the internet; offline the app falls back to system fonts.
- Video generation needs a Gemini API key on the server (no browser fallback).

## Scripts

- `npm run dev` — dev server (Express + Vite middleware)
- `npm run build` — production build (`dist/`)
- `npm run standalone` — single-file offline build → `panther-studio.html`
- `npm run serve:standalone` — static preview of the standalone build
- `npm run lint` — `tsc --noEmit`
