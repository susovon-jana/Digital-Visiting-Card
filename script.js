let uploadedBackgroundImage = null;

// Form Toggle Logic
document.getElementById('bgType').addEventListener('change', function() {
    document.getElementById('bgColorContainer').style.display = this.value === 'color' ? 'block' : 'none';
    document.getElementById('bgTextureContainer').style.display = this.value === 'texture' ? 'block' : 'none';
    document.getElementById('bgImageContainer').style.display = this.value === 'image' ? 'block' : 'none';
    renderCard();
});

// Handle Image Upload
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

function getData() {
    const get = id => {
        const el = document.getElementById(id);
        return el ? (el.value.trim() || el.placeholder || "") : "";
    };
    
    // Get radio button value
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
        scale: parseInt(document.getElementById("exportScale").value, 10)
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

    // Add Corner Accents (Professional Design)
    if (d.accentColor !== 'transparent') {
        const cornerTL = document.createElement("div");
        cornerTL.className = "corner-tl";
        cornerTL.style.backgroundColor = d.accentColor;
        
        const cornerBR = document.createElement("div");
        cornerBR.className = "corner-br";
        cornerBR.style.backgroundColor = d.accentColor;
        
        card.appendChild(cornerTL);
        card.appendChild(cornerBR);
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
    
    // Temporarily revert mobile scaling for a perfect, full-size capture
    card.style.transform = "scale(1)"; 

    const canvas = await html2canvas(card, { 
        scale: getData().scale, 
        useCORS: true, 
        backgroundColor: null 
    });

    // Restore mobile scaling
    card.style.transform = ""; 

    const link = document.createElement("a");
    link.download = `${getData().name.replace(/\s+/g, '_')}_Card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

/******** HIGH-RES PDF EXPORT ********/
async function downloadPDF() {
    const card = document.getElementById("cardPreview");
    const d = getData();

    // Temporarily revert mobile scaling for perfect, full-size capture
    card.style.transform = "scale(1)";

    const canvas = await html2canvas(card, { scale: d.scale, useCORS: true });
    
    // Restore mobile scaling
    card.style.transform = "";

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
    // Listen for all input changes (excluding image upload which handles itself)
    document.querySelectorAll("#cardForm input:not([type='file']), #cardForm textarea, #cardForm select, input[name='cardFormat']").forEach(el => {
        el.addEventListener("input", renderCard);
        el.addEventListener("change", renderCard);
    });

    document.getElementById("resetBtn").onclick = () => {
        document.getElementById("cardForm").reset();
        uploadedBackgroundImage = null;
        document.getElementById("bgType").dispatchEvent(new Event('change'));
        renderCard();
    };
    
    document.getElementById("pngBtn").onclick = downloadPNG;
    document.getElementById("pdfBtn").onclick = downloadPDF;

    renderCard(); 
};