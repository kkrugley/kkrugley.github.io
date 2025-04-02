document.addEventListener('DOMContentLoaded', () => {
    // Updated ID reference
    const textInput = document.getElementById('textInput');
    const generateBtn = document.getElementById('generateBtn');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadDxfBtn = document.getElementById('downloadDxfBtn');
    const statusMessage = document.getElementById('statusMessage');

    const QR_CODE_SIZE = 256; // Display size in pixels
    const DXF_MODULE_SIZE = 10; // Size of each QR module in DXF units
    const DXF_LINES_PER_MODULE = 50; // Number of lines for hatching

    let currentQRCode = null; // To hold the qrcode.js instance
    let currentInputText = ''; // To hold the generated text for filenames

    // --- Generate QR Code ---
    const generateQRCode = () => {
        const inputText = textInput.value.trim(); // Get text from input
        if (!inputText) {
            // Updated status message
            setStatus('Please enter text or URL to encode.', 'warning');
            textInput.focus();
            return;
        }

        // Removed URL validation block - any non-empty text is now valid

        setStatus('Generating...', 'info');
        clearQRCode(); // Clear previous QR code
        disableDownloadButtons();
        currentInputText = inputText; // Store for filename suggestion

        // Use setTimeout to allow the UI to update before heavy lifting
        setTimeout(() => {
            try {
                currentQRCode = new QRCode(qrCodeContainer, {
                    text: inputText,
                    width: QR_CODE_SIZE,
                    height: QR_CODE_SIZE,
                    colorDark: "#000000",        // BLACK dots (will be inverted to white)
                    colorLight: "rgba(0,0,0,0)", // Transparent background
                    correctLevel: QRCode.CorrectLevel.L
                });

                if (qrPlaceholder) qrPlaceholder.style.display = 'none';
                setStatus('QR Code Generated!', 'success');
                enableDownloadButtons();

            } catch (error) {
                console.error("QR Code Generation Error:", error);
                setStatus(`Error generating QR Code: ${error.message}`, 'danger');
                clearQRCode();
            }
        }, 10); // Small delay
    };

    // --- Event Listeners ---
    generateBtn.addEventListener('click', generateQRCode);
    // Allow Enter key in input field
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });

    downloadPngBtn.addEventListener('click', downloadPNG);
    downloadDxfBtn.addEventListener('click', downloadDXF);

    // --- Helper Functions ---
    function setStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = `text-center text-${type} mb-3`;
        statusMessage.setAttribute('role', 'alert');
    }

    function clearQRCode() {
        qrCodeContainer.innerHTML = '';
        if (!qrCodeContainer.querySelector('#qrPlaceholder')) {
            qrCodeContainer.appendChild(qrPlaceholder);
        }
        if (qrPlaceholder) qrPlaceholder.style.display = 'block';
        currentQRCode = null;
        currentInputText = ''; // Clear stored text
    }

    // Removed isValidHttpUrl function as it's no longer needed

    function disableDownloadButtons() {
        downloadPngBtn.disabled = true;
        downloadDxfBtn.disabled = true;
    }

    function enableDownloadButtons() {
        downloadPngBtn.disabled = false;
        downloadDxfBtn.disabled = false;
    }

    // suggestFilename works reasonably well for general text too
    function suggestFilename(inputText) {
        if (!inputText) return "qrcode";
        try {
            // Attempt to treat as URL first for cleaner names if it is one
            let name = inputText;
            try {
                 const url = new URL(inputText);
                 if (url.protocol === "http:" || url.protocol === "https:") {
                    name = url.hostname + url.pathname;
                 }
            } catch (_) {
                // Not a valid URL, treat as plain text
            }

            name = name.replace(/^https?:\/\//, '').replace(/\/$/, ''); // Clean URL parts if present
            name = name.replace(/[^a-zA-Z0-9-_.]/g, '_'); // Replace invalid chars
            // Prevent excessively long filenames from text
            return name.substring(0, 50) || "qrcode";
        } catch {
            return "qrcode";
        }
    }


    // --- Download Logic (PNG processing remains the same) ---
    function downloadPNG() {
        if (!currentQRCode) {
            setStatus('Generate QR code first.', 'warning');
            return;
        }
    
        const originalCanvas = qrCodeContainer.querySelector('canvas');
        const originalImg = qrCodeContainer.querySelector('img');
    
        if (!originalCanvas && !originalImg) {
            setStatus('Could not find QR code element.', 'danger');
            return;
        }
    
        setStatus('Processing PNG for download...', 'info');
    
        setTimeout(() => {
            try {
                let dataUrl;
                if (originalCanvas) {
                    dataUrl = originalCanvas.toDataURL('image/png');
                } else {
                    // For img element, create canvas with white background
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = originalImg.naturalWidth;
                    tempCanvas.height = originalImg.naturalHeight;
                    tempCtx.fillStyle = '#ffffff';
                    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    tempCtx.drawImage(originalImg, 0, 0);
                    dataUrl = tempCanvas.toDataURL('image/png');
                }
    
                const filename = `${suggestFilename(currentInputText)}.png`;
                triggerDownload(dataUrl, filename);
                setStatus(`PNG ready for download: ${filename}`, 'info');
    
            } catch (error) {
                console.error("PNG Processing Error:", error);
                setStatus(`Error processing PNG: ${error.message}`, 'danger');
            }
        }, 10);
    }

    // --- Download Logic (DXF remains the same) ---
    function downloadDXF() {
        if (!currentQRCode || !currentQRCode._oQRCode) {
             setStatus('Generate QR code first or data unavailable.', 'warning');
            return;
        }
        // ... (DXF generation code is identical to the previous version) ...
        setStatus('Generating DXF...', 'info');
        setTimeout(() => {
            try {
                const qrData = currentQRCode._oQRCode;
                const moduleCount = qrData.moduleCount;
                const modules = qrData.modules;
                let dxfContent = `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n`;
                dxfContent += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n1\n`;
                dxfContent += `0\nLAYER\n2\nQR_LINES\n70\n0\n62\n0\n6\nCONTINUOUS\n`;
                dxfContent += `0\nENDTAB\n0\nENDSEC\n`;
                dxfContent += `0\nSECTION\n2\nENTITIES\n`;
                const lineStep = DXF_MODULE_SIZE / (DXF_LINES_PER_MODULE + 1);

                for (let row = 0; row < moduleCount; row++) {
                    for (let col = 0; col < moduleCount; col++) {
                        if (modules[row][col]) {
                            const x0 = col * DXF_MODULE_SIZE;
                            const y0 = (moduleCount - 1 - row) * DXF_MODULE_SIZE;
                            const x1 = x0 + DXF_MODULE_SIZE;
                            for (let i = 1; i <= DXF_LINES_PER_MODULE; i++) {
                                const lineY = y0 + i * lineStep;
                                dxfContent += `0\nLINE\n8\nQR_LINES\n`;
                                dxfContent += `10\n${x0}\n20\n${lineY}\n30\n0.0\n`;
                                dxfContent += `11\n${x1}\n21\n${lineY}\n31\n0.0\n`;
                            }
                        }
                    }
                }
                dxfContent += `0\nENDSEC\n0\nEOF\n`;
                const blob = new Blob([dxfContent], { type: 'application/dxf' });
                const url = URL.createObjectURL(blob);
                 // Use currentInputText for filename suggestion
                const filename = `${suggestFilename(currentInputText)}.dxf`;
                triggerDownload(url, filename);
                URL.revokeObjectURL(url);
                setStatus(`DXF ready for download: ${filename}`, 'info');
            } catch (error) {
                 console.error("DXF Generation Error:", error);
                 setStatus(`Error generating DXF: ${error.message}`, 'danger');
            }
        }, 10);
    }


    function triggerDownload(href, filename) {
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Initial State ---
    disableDownloadButtons();
    // Updated initial message
    setStatus('Enter text or URL and click Generate');
});