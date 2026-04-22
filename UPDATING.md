# Customising & Updating the Card Builder

This guide covers every part of the project you might want to change — from adding new fonts and textures to rebranding the navbar — without breaking anything.

---

## 🔤 Adding New Fonts

### Step 1 — Add the Google Fonts import

In `index.html`, find the long `<link>` tag for Google Fonts and add your font to the `family=` list. Example — adding **Dancing Script**:

```html
<!-- Before -->
family=Poppins:ital,wght@0,400;0,700

<!-- After — append with & -->
family=Poppins:ital,wght@0,400;0,700&family=Dancing+Script:wght@400;700
```

### Step 2 — Add it to the dropdown

In `index.html`, find the `<select id="fontFamily">` element and add an `<option>` inside the appropriate `<optgroup>`:

```html
<optgroup label="Elegant & Script">
    <!-- existing options... -->
    <option value="'Dancing Script', cursive">Dancing Script</option>
</optgroup>
```

The `value` must exactly match the CSS font-family string (including quotes and fallback).

> **Fonts that don't need Google Fonts:** System fonts like `Monotype Corsiva`, `Papyrus`, and `Segoe Script` are already installed on most Windows machines — they work without any CDN link.

---

## 🖼 Adding New Background Textures

Textures are CSS background images. To add one:

### Step 1 — Define the CSS class

In `style.css`, add a new class following the same pattern as the existing ones:

```css
/* Existing examples */
.bg-kraft  { background-image: url('https://www.transparenttextures.com/patterns/cardboard-flat.png'), linear-gradient(#e0c49c, #e0c49c) !important; }
.bg-linen  { background-image: url('https://www.transparenttextures.com/patterns/linen.png'), linear-gradient(#f3efe4, #f3efe4) !important; }

/* New texture — add below */
.bg-concrete { background-image: url('https://www.transparenttextures.com/patterns/concrete-wall.png'), linear-gradient(#b0b0b0, #b0b0b0) !important; }
```

Browse free seamless textures at [transparenttextures.com](https://www.transparenttextures.com).

### Step 2 — Add it to the dropdown

In `index.html`, find `<select id="bgTexture">` and add an option:

```html
<select id="bgTexture">
    <option value="kraft">Kraft Paper</option>
    <option value="linen">Linen</option>
    <option value="carbon">Carbon Fiber</option>
    <option value="mesh">Dark Mesh</option>
    <option value="concrete">Concrete Wall</option>  <!-- new -->
</select>
```

The `value` must match the CSS class suffix (e.g., `concrete` → `.bg-concrete`).

---

## 🎨 Changing the Default Card Colours

The default accent colour (blue) and text colour (dark) are set as `value` attributes on the colour inputs in `index.html`:

```html
<!-- Corner accent colour -->
<input type="color" id="accentColor" value="#0d47a1">

<!-- Text colour -->
<input type="color" id="textColor" value="#222222">

<!-- Background colour -->
<input type="color" id="bgColor" value="#ffffff">
```

Change the `value` hex to set a new default. Users can still override it via the colour picker.

---

## 🏷 Rebranding the Navbar

### Change the title

In `index.html`:

```html
<h1 class="nav-title">Visiting Card Builder</h1>
```

Replace with your app name.

### Change or remove the profile button

The top-right button links to the creator's profile. To point it elsewhere:

```html
<a href="https://YOUR-WEBSITE.com/" target="_blank" class="profile-btn">
    <strong>Your Name</strong><br>
    <span>Visit Profile →</span>
</a>
```

To remove it entirely, delete the entire `<a class="profile-btn">...</a>` block and remove `.profile-btn` from `style.css`.

### Change the navbar colour

In `style.css`:

```css
.navbar { background: #0d47a1; ... }
```

Replace `#0d47a1` with any colour. The profile button gradient will also need updating:

```css
.profile-btn { background: linear-gradient(135deg, #2a7bff, #1b5ddb); ... }
```

---

## 🖼 Changing the Favicon

The favicon is `logo.svg`. It's an SVG so it scales perfectly at any size.

To replace it:
- **With a PNG:** `<link rel="icon" type="image/png" href="favicon.png">`
- **With your own SVG:** simply overwrite `logo.svg`

---

## 📐 Changing Default Card Format

The default format on page load is **Horizontal**. To change it, find the radio input and add `checked`:

```html
<!-- Make Vertical the default instead -->
<input type="radio" id="fmtVert" name="cardFormat" value="vertical" checked>
```

Remove `checked` from the `fmtHorz` line at the same time.

---

## 📏 Adjusting Card Dimensions (Preview Size)

Card dimensions in the browser preview are set in `style.css`:

```css
.card-horizontal { width: 450px; height: 250px; }
.card-vertical   { width: 250px; height: 450px; }
.card-square     { width: 320px; height: 320px; }
```

> **Note:** These are screen pixel sizes. The real-world print dimensions (90×50mm etc.) are defined separately inside `downloadPDF()` in `script.js` — change both if you want a different physical card size.

```javascript
// In downloadPDF() in script.js
if (d.format === 'horizontal') {
    cardWmm = 90; cardHmm = 50;   // ← change real-world mm here
}
```

---

## ✅ Adding or Removing Content Fields

To add a new field (e.g., LinkedIn URL):

### Step 1 — Add the form input (`index.html`)

```html
<label>LinkedIn</label>
<input id="linkedin" type="url" placeholder="https://linkedin.com/in/yourname">
```

### Step 2 — Add a toggle checkbox (`index.html`)

```html
<label><input type="checkbox" id="showLinkedin" checked> LinkedIn</label>
```

### Step 3 — Read the value in `getData()` (`script.js`)

```javascript
linkedin: get("linkedin"),
showLinkedin: document.getElementById("showLinkedin").checked,
```

### Step 4 — Render it in `renderCard()` (`script.js`)

```javascript
if (d.showLinkedin) leftHtml += `<div><i class="fa-brands fa-linkedin"></i> ${d.linkedin.replace(/^https?:\/\//, '')}</div>`;
```

---

## 🖨 Changing Export Resolutions

The export scale options are in `index.html`:

```html
<select id="exportScale">
    <option value="2">Standard (Good for Web)</option>
    <option value="4" selected>High (Sharp HQ)</option>
    <option value="8">Ultra (Print Quality 8x)</option>
</select>
```

You can add or remove options. The `value` is the pixel multiplier passed to `html2canvas({ scale: N })`. Higher values produce sharper images but larger files. `value="4"` is the default (has `selected`).

---

## 🚢 Deploying Updates

After any file change:

```bash
git add .
git commit -m "update: describe what changed"
git pull origin main --rebase
git push
```

Cloudflare Pages will auto-redeploy within ~30 seconds.
