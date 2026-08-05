# itwasntdavid — Spatial 3D Web Presentation & TinaCMS CMS

An interactive 3D spatial web presentation and visual content management system for **David Dumont** (`daviddumont.de`), built with **React 19**, **Vite 8**, **TypeScript**, **impress.js v2.0.0**, and **TinaCMS 3.11**.

---

## 🚀 Quick Start (Local Development)

### 1. Installation & Development Server
```bash
pnpm install
pnpm dev
```

### 2. URL Endpoints
- 🌐 **Web Application**: [http://localhost:5176/](http://localhost:5176/)
- ⚙️ **TinaCMS Visual Admin**: [http://localhost:5176/admin](http://localhost:5176/admin) (No cloud login required locally)
- 🦙 **GraphQL Endpoint**: [http://localhost:4004/graphql](http://localhost:4004/graphql)

---

## 📐 3D Spatial Presentation Architecture

### 1. Spatial Transformation Engine ([src/components/SpatialCanvas.tsx](file:///home/david/Projects/itwasntdavid/src/components/SpatialCanvas.tsx))
- Built on `impress.js v2.0.0` precise 3D spatial transforms:
  - `#impress-viewport`: Full-screen viewport container (`100vw` $\times$ `100vh`).
  - `#impress`: Camera root with CSS 3D perspective (`1000 / scale`).
  - `#impress-canvas`: World coordinate system origin. Applies inverse rotations (`rotateZ`, `rotateY`, `rotateX`) and inverse translations (`translate3d(-x, -y, -z)`).
  - `.step`: Spatial pages transformed in 3D space (`translate3d(x, y, z) translate(-50%, -50%) rotate... scale...`).

### 2. Continuous 3D Glide Navigation
- `<SpatialCanvas>` and `<NavigationToolbar>` remain continuously mounted in [src/App.tsx](file:///home/david/Projects/itwasntdavid/src/App.tsx).
- Selecting navigation links (`#/welcome`, `#/strategy`, `#/storytelling`, `#/contact`, `#/impressum`) glides the 3D camera smoothly across 3D space over `1000ms` without page reloads.

---

## 🧩 TinaCMS Content Model & Modular Block System

### 1. Slide Page Documents (`content/pages/*.json`)
Each 3D spatial slide is an independent JSON document in `content/pages/`:
- `welcome.json`: Spatial $(0, 0, 12000)$ — Interactive chat introduction.
- `strategy.json`: Spatial $(-4000, 0, 4000)$ — Communication strategy rows.
- `storytelling.json`: Spatial $(4000, 0, 4000)$ — Brand storytelling rows.
- `contact.json`: Spatial $(0, 4000, 4000)$ — Contact cards.
- `impressum.json`: Spatial $(0, -4000, 0)$ — Legal imprint notice.

### 2. Modular Content Blocks (`blocks` List)
On any slide page, editors can add, remove, and re-order reusable module blocks:
- 💬 **Welcome Chat Module** (`chat_module`): Interactive chat bubbles with timing delays and profile avatar integration.
- 📝 **Text & Image Rows Module** (`content_row_module`): Text column + image column with dark/light background toggles.
- 📇 **Contact Cards Module** (`contact_cards_module`): Grid of contact cards with FontAwesome icons.
- 📄 **Legal / Rich Text Module** (`legal_text_module`): Rich text / Markdown imprint notice.
- 📢 **Callout Quote Module** (`quote_module`): Featured quote callout banner.

---

## 🛠️ Build & Deployment

```bash
# Build against local content
pnpm build-local

# Production build for Cloudflare / Vercel
pnpm build
```

- **Vercel**: Rewrites all routes to `/index.html` via `vercel.json`.
- **Cloudflare Workers / Pages**: `wrangler.jsonc` specifies Single Page Application (SPA) asset routing.
