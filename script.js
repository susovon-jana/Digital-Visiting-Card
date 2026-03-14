let uploadedBackgroundImage = null;
let uploadedWatermarkImage = null; // NEW

// Form Toggle Logic
document.getElementById('bgType').addEventListener('change', function() {
    document.getElementById('bgColorContainer').style.display = this.value === 'color' ? 'block' : 'none';
    document.getElementById('bgTextureContainer').style.display = this.value === 'texture' ? 'block' : 'none';
    document.getElementById('bgImageContainer').style.display = this.value === 'image' ? 'block' : 'none';
    renderCard();
});

// Handle Background Image Upload
document.getElementById('bgImageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedBackgroundImage = event.target.result;
            renderCard();
        };
        reader.readAsDataURL(file);
    }
});

// NEW: Handle Watermark / Logo Upload
document.getElementById('wmImageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedWatermarkImage = event.target.result;
            document.getElementById('wmControls').style.display = 'block'; // Show advanced controls
            renderCard();
        };
        reader.readAsDataURL(file);
    } else {
        uploadedWatermarkImage = null;
        document.getElementById('wmControls').style.display = 'none'; // Hide controls
        renderCard();
    }
});

function getData() {
    const get = id => {
        const el = document.getElementById(id);
        return el ? (el.value.trim() || el.placeholder || "") : "";
    };
    
    const format = document.querySelector('input[name="cardFormat"]:checked').value;

    return {
        company: get("company"),
        name: get("name"),
        title: get("title"),
        phone: get("phone"),
        email: get("email"),
        website: get("website"),
        address: get("address"),
        bgType: document.getElementById("bgType").value,
        bgColor: document.getElementById("bgColor").value,
        bgTexture: document.getElementById("bgTexture").value,
        bgImageFit: document.getElementById("bgImageFit").value,
        bgOverlay: document.getElementById("bgOverlay").value,
        textColor: document.getElementById("textColor").value,
        accentColor: document.getElementById("accentColor").value,
        format: format,
        scale: parseInt(document.getElementById("exportScale").value, 10),
        
        // NEW: Watermark details
        wmPosition: document.getElementById("wmPosition").value,
        wmShape: document.getElementById("wmShape").value,
        wmSize: document.getElementById("wmSize").value,
        wmOpacity: document.getElementById("wmOpacity").value
    };
}

function generateVCard(d) {
    return `BEGIN:VCARD\nVERSION:3.0\nN:${d.name};;;;\nFN:${d.name}\nORG:${d.company}\nTITLE:${d.title}\nTEL;TYPE=WORK,VOICE:${d.phone}\nEMAIL;TYPE=PREF,INTERNET:${d.email}\nURL:${d.website}\nADR;TYPE=WORK:;;${d.address.replace(/\n/g, ' ')};;;;\nEND:VCARD`;
}

function renderCard() {
    const d = getData();
    const card = document.getElementById("cardPreview");

    // Clear old classes & inline styles, apply format class
    card.className = `card-preview card-${d.format}`;
    card.style.backgroundImage = "";
    card.style.backgroundSize = "cover"; 
    card.style.backgroundPosition = "center";
    
    // Apply Background & Overlay
    const overlay = `rgba(0,0,0,${d.bgOverlay})`;
    if (d.bgType === 'color') {
        card.style.backgroundImage = `linear-gradient(${overlay}, ${overlay}), linear-gradient(${d.bgColor}, ${d.bgColor})`;
    } else if (d.bgType === 'texture') {
        card.classList.add(`bg-${d.bgTexture}`);
        if(d.bgOverlay > 0) {
            card.style.backgroundImage = `linear-gradient(${overlay}, ${overlay})`;
        }
    } else if (d.bgType === 'image' && uploadedBackgroundImage) {
        card.style.backgroundImage = `linear-gradient(${overlay}, ${overlay}), url(${uploadedBackgroundImage})`;
        card.style.backgroundSize = d.bgImageFit;
    }

    // Apply Text Color
    card.style.color = d.textColor;
    card.innerHTML = "";

    // Add Corner Accents
    if (d.accentColor !== 'transparent') {
        const cornerTL = document.createElement("div");
        cornerTL.className = "corner-tl";
        cornerTL.style.borderTopColor = d.accentColor; 
        
        const cornerBR = document.createElement("div");
        cornerBR.className = "corner-br";
        cornerBR.style.borderBottomColor = d.accentColor; 
        
        card.appendChild(cornerTL);
        card.appendChild(cornerBR);
    }

    // NEW: Add Watermark / Logo Layer
    if (uploadedWatermarkImage) {
        const wm = document.createElement("img");
        wm.src = uploadedWatermarkImage;
        wm.className = `watermark-img wm-${d.wmPosition} wm-${d.wmShape}`;
        wm.style.width = `${d.wmSize}px`;
        
        // If they pick a circle or square, force height = width so it cuts a perfect shape
        if (d.wmShape === 'circle' || d.wmShape === 'square') {
            wm.style.height = `${d.wmSize}px`;
        }
        
        wm.style.opacity = d.wmOpacity;
        card.appendChild(wm);
    }

    /* Left Side Content */
    const leftSide = document.createElement("div");
    leftSide.className = "card-left";
    leftSide.innerHTML = `
        <div class="card-company">${d.company}</div>
        <div class="card-name">${d.name}</div>
        <div class="card-title">${d.title}</div>
        <div class="card-divider"></div>
        <div class="card-details">
            <div><i class="fa-solid fa-phone"></i> ${d.phone}</div>
            <div><i class="fa-solid fa-envelope"></i> ${d.email}</div>
            <div><i class="fa-solid fa-globe"></i> ${d.website.replace(/^https?:\/\//, '')}</div>
            <div><i class="fa-solid fa-location-dot"></i> ${d.address.replace(/\n/g, ", ")}</div>
        </div>
    `;

    /* Right Side Content (QR) */
    const rightSide = document.createElement("div");
    rightSide.className = "card-right";
    const qrCanvas = document.createElement("canvas");
    rightSide.appendChild(qrCanvas);

    card.appendChild(leftSide);
    card.appendChild(rightSide);

    /* Generate HIGH-RES QR Code */
    requestAnimationFrame(() => {
        QRCode.toCanvas(
            qrCanvas,
            generateVCard(d),
            { 
                width: 500,  
                margin: 0,
                color: { dark: "#000000", light: "#ffffff" }
            },
            (error) => { if (error) console.error(error); }
        );
    });
}

/******** HIGH-RES PNG EXPORT ********/
async function downloadPNG() {
    const card = document.getElementById("cardPreview");
    const canvas = await html2canvas(card, { 
        scale: getData().scale, 
        useCORS: true, 
        backgroundColor: null 
    });

    const link = document.createElement("a");
    link.download = `${getData().name.replace(/\s+/g, '_')}_Card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

/******** HIGH-RES PDF EXPORT ********/
async function downloadPDF() {
    const card = document.getElementById("cardPreview");
    const d = getData();

    const canvas = await html2canvas(card, { scale: d.scale, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    
    let cardWmm, cardHmm, pdfOrientation;
    if (d.format === 'horizontal') {
        cardWmm = 90; cardHmm = 50; pdfOrientation = "l";
    } else if (d.format === 'vertical') {
        cardWmm = 50; cardHmm = 90; pdfOrientation = "p";
    } else if (d.format === 'square') {
        cardWmm = 65; cardHmm = 65; pdfOrientation = "p";
    }

    const pdf = new jsPDF(pdfOrientation, "mm", "a4"); 

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const x = (pageW - cardWmm) / 2;
    const y = (pageH - cardHmm) / 2;

    pdf.addImage(imgData, "PNG", x, y, cardWmm, cardHmm, undefined, 'FAST');
    pdf.save(`${d.name.replace(/\s+/g, '_')}_PrintHQ.pdf`);
}

/******** INIT ********/
window.onload = () => {
    // Listen for ALL input changes on the entire page
    document.querySelectorAll("input:not([type='file']), textarea, select").forEach(el => {
        el.addEventListener("input", renderCard);
        el.addEventListener("change", renderCard);
    });

    document.getElementById("resetBtn").onclick = () => {
        document.getElementById("cardForm").reset();
        uploadedBackgroundImage = null;
        uploadedWatermarkImage = null; // NEW
        document.getElementById("bgType").dispatchEvent(new Event('change'));
        document.getElementById("wmControls").style.display = 'none'; // NEW
        renderCard();
    };
    
    document.getElementById("pngBtn").onclick = downloadPNG;
    document.getElementById("pdfBtn").onclick = downloadPDF;

    renderCard(); 
};