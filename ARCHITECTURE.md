# Architecture & Technical Reference

A complete technical breakdown of how the Visiting Card Builder works internally.

---

## File Responsibilities

| File | Role |
|---|---|
| `index.html` | Page structure, all form controls, CDN script tags |
| `style.css` | All visual styling — card formats, textures, responsive layout |
| `script.js` | All logic — rendering, QR generation, PNG/PDF export |
| `logo.svg` | SVG favicon — inline vector, no raster scaling needed |

---

## JavaScript Architecture (`script.js`)

The entire app runs on **four core functions** plus event wiring:

```
window.onload
  └── Wire all input → renderCard()
  └── Wire buttons → downloadPNG / downloadPDF / reset

getData()           ← reads all form fields into one plain object
renderCard()        ← builds card HTML from getData() output
downloadPNG()       ← html2canvas → PNG download
downloadPDF()       ← html2canvas → jsPDF → PDF download
generateVCard(d)    ← builds vCard 3.0 string for QR encoding
```

---

## `getData()` — The State Snapshot

Every time any input changes, `getData()` is called to read the entire form into a flat object:

```javascript
{
    // Text content
    company, name, title, phone, email, website, address,

    // Background
    bgType,       // "color" | "texture" | "image"
    bgColor,      // hex string
    bgTexture,    // "kraft" | "linen" | "carbon" | "mesh"
    bgImageFit,   // "cover" | "contain" | "100% 100%"
    bgOverlay,    // 0–0.9 float (darkening slider)

    // Styling
    textColor,    // hex string
    accentColor,  // hex string
    format,       // "horizontal" | "vertical" | "square"
    scale,        // 2 | 4 | 8 (export resolution)

    // Watermark
    wmPosition,   // "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
    wmShape,      // "original" | "circle" | "square"
    wmSize,       // px (20–250)
    wmOpacity,    // 0.05–1

    // Typography
    fontFamily,   // CSS font-family string
    fontScale,    // 0.7–1.4 multiplier
    fontBold,     // boolean
    fontItalic,   // boolean

    // Content visibility
    showCompany, showName, showTitle, showPhone,
    showEmail, showWebsite, showAddress, showQR
}
```

For text inputs, `getData()` falls back to the `placeholder` value if the field is empty — so the preview always shows something meaningful.

---

## `renderCard()` — The Render Engine

This function rebuilds the card's entire inner HTML from scratch on every change. The sequence is:

### 1. Format & Typography

```javascript
card.className = `card-preview card-${d.format}`;
card.style.fontFamily = d.fontFamily;
card.style.setProperty('--f-scale', d.fontScale);
card.style.setProperty('--f-style', d.fontItalic ? 'italic' : 'normal');
card.style.setProperty('--f-weight-bold', d.fontBold ? '900' : '700');
card.style.setProperty('--f-weight-med',  d.fontBold ? '700' : '500');
```

CSS variables propagate instantly to all `.card-name`, `.card-title`, `.card-details` children.

### 2. Background Compositing

All backgrounds use layered `background-image` to composite the darkening overlay on top:

```
Solid colour:  linear-gradient(overlay) + linear-gradient(bgColor)
Texture:       CSS class added (e.g. .bg-kraft) + optional overlay layer
Custom image:  linear-gradient(overlay) + url(base64DataURL)
```

The `backgroundSize` for textures is left at its CSS-class default (`cover` or pattern repeat). For custom images it respects the `bgImageFit` select value.

### 3. Corner Accents

Two `<div>` elements use the CSS zero-width/height border triangle technique:

```javascript
const cornerTL = document.createElement("div");
cornerTL.className = "corner-tl";
cornerTL.style.borderTopColor = d.accentColor;
```

```css
/* The CSS trick: only one border has colour; the adjacent one is transparent */
.corner-tl {
    width: 0; height: 0;
    border-top:   140px solid <colour>;
    border-right: 140px solid transparent;
}
```

### 4. Watermark / Logo Layer

The watermark `<img>` is inserted after corners but before text content, so it sits in z-index order:

```
z-index 0: card background
z-index 1: corner accents + watermark (wm-center, wm-circle etc.)
z-index 2: card-left text + card-right QR
```

Shape is applied via CSS class:
- `.wm-original` → `border-radius: 0`
- `.wm-circle` → `border-radius: 50%`
- `.wm-square` → `border-radius: 12px`

When shape is circle or square, `height` is set equal to `width` to force a square bounding box before `border-radius` clips it.

### 5. Left Panel — Text Content

Each field is conditionally added based on its `show*` boolean:

```javascript
if (d.showName) leftHtml += `<div class="card-name">${d.name}</div>`;
```

The divider line is only rendered if at least one "header" field (company/name/title) AND at least one "contact" field (phone/email/website/address) are visible — prevents a floating line appearing alone.

### 6. Right Panel — QR Code

The QR is generated using `QRCode.toCanvas()` inside a `requestAnimationFrame` callback. This ensures the `<canvas>` element is in the DOM before the library tries to paint to it:

```javascript
requestAnimationFrame(() => {
    QRCode.toCanvas(qrCanvas, generateVCard(d), {
        width: 500,   // High-res canvas — CSS scales it down
        margin: 0,
        color: { dark: "#000000", light: "#ffffff" }
    });
});
```

The canvas is rendered at 500×500px internally but displayed at 110×110px via CSS — this ensures the QR is sharp even in 8× exports.

---

## Export Pipeline

### PNG Export

```
renderCard() → current DOM state
    ↓
html2canvas(card, { scale: d.scale, useCORS: true })
    ↓
canvas.toDataURL("image/png")
    ↓
<a download="Name_Card.png"> auto-click → file download
```

`useCORS: true` allows html2canvas to capture externally-hosted images (background textures from transparenttextures.com). Without this, cross-origin images render as blank.

### PDF Export

```
html2canvas → PNG data URL
    ↓
new jsPDF(orientation, "mm", "a4")
    ↓
calculate centred x/y position on A4 page
    ↓
pdf.addImage(imgData, "PNG", x, y, cardWmm, cardHmm)
    ↓
pdf.save("Name_PrintHQ.pdf")
```

The card is placed at its real-world millimetre dimensions (`90×50mm`, `50×90mm`, or `65×65mm`) centred on an A4 page. This makes the PDF ready to hand to a printer who can cut to size.

---

## CSS Architecture (`style.css`)

### Custom Properties Used on `.card-preview`

| Property | Set by | Used by |
|---|---|---|
| `--f-scale` | `fontScale` slider | All `.card-*` font-size calcs |
| `--f-style` | italic checkbox | `font-style` on `.card-preview` |
| `--f-weight-bold` | bold checkbox | `.card-company`, `.card-name` |
| `--f-weight-med` | bold checkbox | `.card-title`, `.card-details` |

### Card Format Classes

Each format class overrides layout direction, padding, text alignment, and QR size:

```css
.card-horizontal { width: 450px; height: 250px; flex-direction: row; }
.card-vertical   { width: 250px; height: 450px; flex-direction: column; }
.card-square     { width: 320px; height: 320px; flex-direction: column; }
```

### Texture Classes

Textures use `!important` on `background-image` to override the inline style set by `renderCard()`:

```css
.bg-kraft {
    background-image:
        url('https://www.transparenttextures.com/patterns/cardboard-flat.png'),
        linear-gradient(#e0c49c, #e0c49c) !important;
}
```

The second layer (`linear-gradient`) provides the base colour so the tile always has a background even if the texture PNG fails to load.

### Responsive Breakpoints

```
> 900px  : Two-column grid layout
600–900px: Single column; navbar stacks vertically, no fixed positioning
< 600px  : Compact inputs; preview holder scrolls horizontally
```

The `body { padding-top: 85px }` offset for the fixed navbar is reset to `0` at ≤ 900px because the navbar becomes `position: static` at that breakpoint.

---

## Event Wiring

All form events are wired in `window.onload` with a single loop:

```javascript
document.querySelectorAll("input:not([type='file']), textarea, select")
    .forEach(el => {
        el.addEventListener("input", renderCard);
        el.addEventListener("change", renderCard);
    });
```

`input` fires on every keystroke (text fields, sliders).  
`change` fires on dropdown selection and checkbox toggle.  
Both are wired so sliders feel instant and dropdowns also trigger a re-render.

File inputs (`type="file"`) are excluded from this loop and handled separately because they need to read the file via `FileReader` before passing data to `renderCard()`.

---

## Global State

Only two pieces of state live outside the form:

```javascript
let uploadedBackgroundImage = null;  // base64 data URL or null
let uploadedWatermarkImage = null;   // base64 data URL or null
```

Both are set by their respective `FileReader.onload` callbacks and cleared by the Reset button. Everything else is read directly from the DOM in `getData()`.

---

## vCard Format Reference

The QR encodes vCard 3.0 — the universally supported standard for contact exchange:

```
BEGIN:VCARD
VERSION:3.0
N:Full Name;;;;
FN:Full Name
ORG:Company Name
TITLE:Designation
TEL;TYPE=WORK,VOICE:+91 xxxxx xxxxx
EMAIL;TYPE=PREF,INTERNET:email@example.com
URL:https://website.com
ADR;TYPE=WORK:;;Address (newlines replaced with spaces);;;;
END:VCARD
```

Supported by: iOS Contacts, Android Contacts, Google Contacts, Outlook, and all major QR scanner apps.

---

## Known Limitations

| Item | Detail |
|---|---|
| Texture CORS on export | `useCORS: true` handles most cases; some firewall configs may block external texture URLs |
| Script/decorative fonts in PDF | `html2canvas` renders the DOM visually — fonts look identical to the preview |
| Large background images | Very high-res uploaded images may slow down `html2canvas` on 8× scale export |
| QR canvas in export | Rendered at 500px internally — always sharp, even at 8× scale |
| Offline use | CDN libraries (QRCode, html2canvas, jsPDF, Font Awesome, Google Fonts) require internet |
