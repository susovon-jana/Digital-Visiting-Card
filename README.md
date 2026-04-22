# 🪪 Visiting Card Builder

<div align="center">

![Live](https://img.shields.io/badge/Live-Cloudflare%20Pages-orange?style=flat-square&logo=cloudflare)
![Stack](https://img.shields.io/badge/Stack-Vanilla%20HTML%2FCSS%2FJS-yellow?style=flat-square)
![No Framework](https://img.shields.io/badge/Framework-None-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**A fully client-side, zero-dependency visiting card designer with live preview, QR code generation, and high-resolution PNG / PDF export.**

[▶ Live Demo](https://your-project.pages.dev) &nbsp;·&nbsp; [📖 Update Guide](./UPDATING.md) &nbsp;·&nbsp; [🏗 Architecture](./ARCHITECTURE.md)

</div>

---

## ✨ Features at a Glance

| Feature | Detail |
|---|---|
| 🎨 **Live Preview** | Card updates instantly on every keystroke — no submit button |
| 📐 **3 Card Formats** | Horizontal (90×50mm), Vertical (50×90mm), Square (65×65mm) |
| 🖼 **Background Options** | Solid colour, 4 preset textures, or custom uploaded image |
| 🔤 **Typography** | 20+ font choices, live font size scaling, bold & italic toggles |
| 💧 **Logo / Watermark** | Upload any image — control position, shape (circle/square/original), size & opacity |
| 📱 **QR Code** | Auto-generated vCard QR — scan to save contact on any phone |
| ✅ **Content Toggles** | Show/hide any field (name, phone, QR, etc.) with one click |
| 🌑 **Darkening Overlay** | Slider to darken background images for text readability |
| 📥 **PNG Export** | Up to 8× resolution (print quality) |
| 📄 **PDF Export** | Standard A4 PDF, card centred at real-world mm dimensions |
| 📱 **Fully Responsive** | Works on mobile, tablet, and desktop |

---

## 📁 File Structure

```
visiting-card-builder/
│
├── index.html      ← Single-page UI — all form controls and layout
├── style.css       ← All styles: layout, card formats, textures, responsive
├── script.js       ← All logic: rendering, QR, export, event listeners
└── logo.svg        ← Browser tab favicon (SVG — scales perfectly)
```

> This is intentionally a **4-file project**. No `package.json`, no build step, no node_modules. Open `index.html` in a browser and it works.

---

## 🗂 How It Works — User Flow

```
User fills form
      ↓
Any input change fires renderCard()
      ↓
getData() reads ALL form values into one object
      ↓
renderCard() builds card HTML dynamically
  ├── Applies background (colour / texture / image + overlay)
  ├── Adds corner accent triangles (CSS border trick)
  ├── Adds watermark <img> if uploaded
  ├── Builds left panel (company, name, title, divider, contact details)
  └── Builds right panel (QR canvas via QRCode.js)
      ↓
Download PNG → html2canvas → PNG blob → auto-download
Download PDF → html2canvas → jsPDF → centred on A4 → auto-download
```

---

## 🔧 Tech Stack

### Frontend (Zero Framework)
- **HTML5** — semantic form layout, single page
- **CSS3** — CSS custom properties, grid, flexbox, CSS border triangle trick for corners
- **Vanilla JavaScript (ES6+)** — no jQuery, no build step

### External Libraries (all via CDN — no install needed)

| Library | Version | Purpose |
|---|---|---|
| [QRCode.js](https://github.com/soldair/node-qrcode) | 1.5.1 | Generates vCard QR code on `<canvas>` |
| [html2canvas](https://html2canvas.hertzen.com) | 1.4.1 | Screenshots the card DOM node to a canvas |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | Creates PDF from the canvas image |
| [Font Awesome](https://fontawesome.com) | 6.4.0 | Icons (phone, email, globe, location) |
| [Google Fonts](https://fonts.google.com) | — | 10 web fonts (Poppins, Roboto, Playfair, etc.) |

### Hosting
- **Cloudflare Pages** — free static hosting, auto-deploys on `git push`

---

## 🚀 Deployment

### Prerequisites
- A [GitHub](https://github.com) account
- A [Cloudflare](https://dash.cloudflare.com/sign-up) account (free tier is enough)
- [Git](https://git-scm.com/) installed

### Step 1 — Push to GitHub

**First time:**
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add .
git commit -m "Initial commit"
git branch -M main
git pull origin main --rebase
git push -u origin main
```

**Every update after that:**
```bash
git add .
git commit -m "update"
git pull origin main --rebase
git push
```

### Step 2 — Connect Cloudflare Pages

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → **Create** → **Pages**
3. Click **Connect to Git** → select your repository
4. Build settings:
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (root)
5. Click **Save and Deploy**

Every future `git push` to `main` will trigger an automatic redeploy in ~30 seconds.

### Step 3 — Custom Domain (Optional)
In Cloudflare Pages → your project → **Custom domains** → add your domain. SSL is automatic.

---

## 🎨 Card Design System

### Formats & Dimensions

| Format | CSS Class | Preview Size | Real-world |
|---|---|---|---|
| Horizontal | `card-horizontal` | 450×250px | 90×50mm |
| Vertical | `card-vertical` | 250×450px | 50×90mm |
| Square | `card-square` | 320×320px | 65×65mm |

### Corner Accent — CSS Border Triangle Trick

The corner triangles are pure CSS — no images, no SVGs:

```css
.corner-tl {
    width: 0; height: 0;
    border-top: 140px solid <accent-color>;
    border-right: 140px solid transparent;
}
```

The accent colour is set dynamically via JavaScript: `cornerTL.style.borderTopColor = d.accentColor`.

### Typography Scaling System

Font sizes use a CSS custom property `--f-scale` so the entire card scales from one slider:

```css
.card-name    { font-size: calc(24px * var(--f-scale, 1)); }
.card-title   { font-size: calc(13px * var(--f-scale, 1)); }
.card-details { font-size: calc(11px * var(--f-scale, 1)); }
```

Set via JS: `card.style.setProperty('--f-scale', d.fontScale)`

### Background Layering

All backgrounds are composited using CSS `background-image` with multiple layers:

```
Layer 1 (top):    rgba(0,0,0, overlay)   ← darkening slider
Layer 2 (bottom): solid colour / image / texture
```

```javascript
// Example for image background:
card.style.backgroundImage =
  `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay})),
   url(${uploadedImage})`;
```

---

## 📥 Export System

### PNG Export
Uses `html2canvas` to render the card DOM to a `<canvas>`, then triggers a file download.

- **Scale 2×** = good for WhatsApp / web sharing
- **Scale 4×** = recommended default — sharp on all screens
- **Scale 8×** = print quality (~600 DPI equivalent)

### PDF Export
Renders to canvas first, then embeds the PNG into a jsPDF document. The card is centred on an A4 page at real-world millimetre dimensions so it can be taken to a print shop.

| Format | PDF orientation | Card size on paper |
|---|---|---|
| Horizontal | Landscape | 90×50mm centred |
| Vertical | Portrait | 50×90mm centred |
| Square | Portrait | 65×65mm centred |

### QR Code — vCard Format
The QR encodes a standard **vCard 3.0** string:

```
BEGIN:VCARD
VERSION:3.0
FN:Full Name
ORG:Company
TITLE:Designation
TEL;TYPE=WORK,VOICE:+91 ...
EMAIL;TYPE=PREF,INTERNET:email@example.com
URL:https://website.com
ADR;TYPE=WORK:;;Address;;;;
END:VCARD
```

When scanned, Android and iOS both offer to save the contact directly to the phone.

---

## 📱 Responsive Behaviour

| Screen Width | Layout |
|---|---|
| > 900px | Two-column grid (form left, preview right) |
| 600–900px | Single column, navbar stacks vertically |
| < 600px | Single column, full-width inputs, scrollable card preview |

On mobile the card preview area scrolls horizontally so the card is never clipped.

---

## 🔗 Navbar Profile Link

The top-right button links to **Dr. Susovon Jana's academic profile**. To update it, edit these two lines in `index.html`:

```html
<a href="https://dr-susovon.pages.dev/" target="_blank" class="profile-btn">
    <strong>Susovon Jana, Ph.D.</strong><br>
    <span>Visit Profile →</span>
</a>
```

---

## 📚 Related Documentation

- **[UPDATING.md](./UPDATING.md)** — How to customise fonts, textures, defaults, and branding
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Deep-dive into the JS render engine and export pipeline

---

## 🙏 Credits

| Resource | Link |
|---|---|
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) |
| QR Code | [node-qrcode](https://github.com/soldair/node-qrcode) |
| Screenshot | [html2canvas](https://html2canvas.hertzen.com) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) |
| Icons | [Font Awesome 6](https://fontawesome.com) |
| Fonts | [Google Fonts](https://fonts.google.com) |

---

## 📄 License

© 2025 Susovon Jana, Ph.D. — Released for reference and personal use.

---

<div align="center">
Built with pure HTML/CSS/JS &nbsp;·&nbsp; Zero dependencies &nbsp;·&nbsp; Deployed free on Cloudflare Pages
</div>
