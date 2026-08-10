# Antigravity Workspace Guide & Architecture Rules

## Project Overview: `itwasntdavid`
`itwasntdavid` is a spatial 3D web presentation and communication consulting website for **David Dumont** (`daviddumont.de`), built with **React**, **TypeScript**, **Vite**, **impress.js v2.0.0**, and **TinaCMS**.

---

## 🛠️ Port Allocations & Development Commands
- **Vite Web App**: `http://localhost:5176/`
- **TinaCMS Admin**: `http://localhost:5176/admin`
- **TinaCMS GraphQL Endpoint**: `http://localhost:4004/graphql`
- **TinaCMS Datalayer Port**: `9003`

### Run Command
```bash
pnpm dev
# Executes: tinacms dev --port 4004 --datalayer-port 9003 -c "vite --port 5176"
```

---

## 📐 Architecture & Spatial 3D Pipeline

### 1. Spatial Presentation Engine ([SpatialCanvas.tsx](file:///home/david/Projects/itwasntdavid/src/components/SpatialCanvas.tsx))
- Restored exact impress.js v2.0.0 3D spatial transformation math from original `daviddumont.de`:
  - `#impress-viewport`: `width: 100vw; height: 100vh; overflow: hidden;`
  - `#impress` (root): `top: 50%; left: 50%; perspective: (1000 / targetScale); transform: scale(targetScale);`
  - `#impress-canvas`: `transform: rotateZ(-rz) rotateY(-ry) rotateX(-rx) translate3d(-x, -y, -z); transition: all 1000ms ease-in-out;`
  - `.step`: `width: 100vw; height: 100vh; transform: translate3d(x, y, z) translate(-50%, -50%) rotate... scale...;`
- **Continuous Mounting Rule**: `<SpatialCanvas>` and `<NavigationToolbar>` MUST stay continuously mounted in `App.tsx` (without `key={activeId}`) so CSS `transition: all 1000ms ease-in-out` glides camera position seamlessly between slides without page reloads.

---

## 🧩 TinaCMS Content Model & Modular Block System

### 1. Slide Page Documents (`content/pages/*.json`)
Each 3D spatial slide is saved as an independent JSON document in `content/pages/`:
- `content/pages/welcome.json` (Spatial $X: 0, Y: 0, Z: 12000$)
- `content/pages/strategy.json` (Spatial $X: -4000, Y: 0, Z: 4000$)
- `content/pages/contact.json` (Spatial $X: 0, Y: 4000, Z: 4000$)
- `content/pages/impressum.json` (Spatial $X: 0, Y: -4000, Z: 0$)

### 2. Polymorphic Block Modules ([tina/config.ts](file:///home/david/Projects/itwasntdavid/tina/config.ts))
Every slide page document contains a `blocks` list field with 5 reusable block templates:
1. 💬 **Welcome Chat Module** (`chat_module`): Multi-bubble typing chat sequence with delay timers and alignment.
2. 📝 **Text & Image Rows Module** (`content_row_module`): Text column + image column with dark/light background toggles.
3. 📇 **Contact Cards Module** (`contact_cards_module`): Grid of contact cards with FontAwesome icons.
4. 📄 **Legal / Rich Text Module** (`legal_text_module`): Rich text / Markdown legal imprint.
5. 📢 **Callout Quote Module** (`quote_module`): Featured quote callout banner.

---

## 🔄 Dynamic Block Renderer ([SlideBlockRenderer.tsx](file:///home/david/Projects/itwasntdavid/src/components/SlideBlockRenderer.tsx))
- **Template Normalization**: Normalizes both raw JSON (`_template`) and TinaCMS GraphQL (`__typename` e.g. `PagesBlocksChat_module`) to guarantee reliable block rendering.
- **Click-to-Edit Annotations**: Wraps each rendered block in `<div data-tina-field={tinaField(block)}>` for visual editing highlighting in TinaCMS Admin.

---

## 🎨 Styling & Navigation System
- `src/styles/impress.css`: Impress.js core styles, top navigation bar (`#impress-toolbar`), responsive mobile hamburger menu (`@media screen and (max-width: 768px)`), and slide containers.
- `src/styles/fakechat.css`: Animated chat entrance physics (`@keyframes bubbleEntranceLeft`), DD avatar pulse ring (`@keyframes avatarPulse`), smooth auto-scroll, and hover micro-interactions.
