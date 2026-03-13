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
        scale: parseInt(document.getElementById("exportScale").value, 10)
    };
}

function generateVCard(d) {
    return `BEGIN:VCARD\nVERSION:3.0\nN:${d.name};;;;\nFN:${d.name}\nORG:${d.company}\nTITLE:${d.title}\nTEL;TYPE=WORK,VOICE:${d.phone}\nEMAIL;TYPE=PREF,INTERNET:${d.email}\nURL:${d.website}\nADR;TYPE=WORK:;;${d.address.replace(/\n/g, ' ')};;;;\nEND:VCARD`;
}

function renderCard() {
    const d = getData();
    const card = document.getElementById("cardPreview");

    // Clear old classes & inline styles
    card.className = "card-preview";
    card.style.backgroundImage = "";
    card.style.backgroundSize = "cover"; // Default
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
        // Apply the auto-adjust strategy the user selected
        card.style.backgroundSize = d.bgImageFit;
    }

    // Apply Text Color
    card.style.color = d.textColor;
    card.innerHTML = "";

    /* Left Side */
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

    /* Right Side */
    const rightSide = document.createElement("div");
    rightSide.className = "card-right";
    const qrCanvas = document.createElement("canvas");
    rightSide.appendChild(qrCanvas);

    card.appendChild(leftSide);
    card.appendChild(rightSide);

    /* Generate HIGH-RES QR Code (500px internal size) */
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
    const scaleFactor = getData().scale; 

    const canvas = await html2canvas(card, { 
        scale: scaleFactor, 
        useCORS: true, 
        backgroundColor: null 
    });

    const link = document.createElement("a");
    link.download = `${getData().name.replace(/\s+/g, '_')}_HQ.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

/******** HIGH-RES PDF EXPORT ********/
async function downloadPDF() {
    const card = document.getElementById("cardPreview");
    const scaleFactor = getData().scale; 

    const canvas = await html2canvas(card, { scale: scaleFactor, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("l", "mm", "a4"); 

    const cardWmm = 90;
    const cardHmm = 50;

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const x = (pageW - cardWmm) / 2;
    const y = (pageH - cardHmm) / 2;

    pdf.addImage(imgData, "PNG", x, y, cardWmm, cardHmm, undefined, 'FAST');
    pdf.save(`${getData().name.replace(/\s+/g, '_')}_PrintHQ.pdf`);
}

/******** INIT ********/
window.onload = () => {
    document.querySelectorAll("#cardForm input, #cardForm textarea, #cardForm select").forEach(el => {
        if (el.id !== 'bgImageUpload') {
            el.addEventListener("input", renderCard);
        }
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