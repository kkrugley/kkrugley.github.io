document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
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
    let currentUrl = '';      // To hold the generated URL for filenames

    // --- Generate QR Code ---
    const generateQRCode = () => {
        const url = urlInput.value.trim();
        if (!url) {
            setStatus('Please enter a URL.', 'warning');
            urlInput.focus();
            return;
        }

        if (!isValidHttpUrl(url)) {
             setStatus('Please enter a valid URL (starting with http:// or https://).', 'warning');
             urlInput.focus();
             return;
        }


        setStatus('Generating...', 'info');
        clearQRCode(); // Clear previous QR code
        disableDownloadButtons();
        currentUrl = url; // Store for filename suggestion

        // Use setTimeout to allow the UI to update before heavy lifting
        setTimeout(() => {
            try {
                currentQRCode = new QRCode(qrCodeContainer, {
                    text: url,
                    width: QR_CODE_SIZE,
                    height: QR_CODE_SIZE,
                    colorDark: "#ffffff", // White dots on dark theme
                    colorLight: "rgba(0,0,0,0)", // Transparent background
                    correctLevel: QRCode.CorrectLevel.L // Low error correction
                });

                // Hide placeholder, show canvas/img
                if (qrPlaceholder) qrPlaceholder.style.display = 'none';

                setStatus('QR Code Generated.', 'success');
                enableDownloadButtons();

            } catch (error) {
                console.error("QR Code Generation Error:", error);
                setStatus(`Error generating QR Code: ${error.message}`, 'danger');
                clearQRCode(); // Clear potential partial generation
            }
        }, 10); // Small delay
    };

    // --- Event Listeners ---
    generateBtn.addEventListener('click', generateQRCode);
    // Allow Enter key in input field
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });

    downloadPngBtn.addEventListener('click', downloadPNG);
    downloadDxfBtn.addEventListener('click', downloadDXF);

    // --- Helper Functions ---
    function setStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = `text-center text-${type} mb-3`; // Use Bootstrap text color classes
         // Add role=alert for accessibility on status changes
        statusMessage.setAttribute('role', 'alert');
    }

    function clearQRCode() {
        qrCodeContainer.innerHTML = ''; // Clear the container
        // Re-add placeholder if it was removed
        if (!qrCodeContainer.querySelector('#qrPlaceholder')) {
            qrCodeContainer.appendChild(qrPlaceholder);
        }
         if (qrPlaceholder) qrPlaceholder.style.display = 'block'; // Show placeholder
        currentQRCode = null;
        currentUrl = '';
    }

     function isValidHttpUrl(string) {
        let url;
        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }

    function disableDownloadButtons() {
        downloadPngBtn.disabled = true;
        downloadDxfBtn.disabled = true;
    }

    function enableDownloadButtons() {
        downloadPngBtn.disabled = false;
        downloadDxfBtn.disabled = false;
    }

    function suggestFilename(url) {
        if (!url) return "qrcode";
        try {
            let name = url.replace(/^https?:\/\//, '').replace(/\/$/, ''); // Remove protocol and trailing slash
            name = name.replace(/[^a-zA-Z0-9-_.]/g, '_'); // Replace invalid chars with underscore
            return name.substring(0, 50) || "qrcode";
        } catch {
            return "qrcode";
        }
    }

    // --- Download Logic ---
    function downloadPNG() {
        if (!currentQRCode) {
            setStatus('Generate QR code first.', 'warning');
            return;
        }

        // Find the canvas element created by qrcode.js
        const canvas = qrCodeContainer.querySelector('canvas');
        // Or the image element if canvas wasn't used (less likely with our config)
        const img = qrCodeContainer.querySelector('img');

        let dataUrl = null;
        if (canvas) {
            dataUrl = canvas.toDataURL('image/png');
        } else if (img) {
            // If it's an image, we need to draw it to a temporary canvas to export
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.naturalWidth;
            tempCanvas.height = img.naturalHeight;
            const ctx = tempCanvas.getContext('2d');
            // Ensure background is white for PNG if original was transparent
            ctx.fillStyle = '#FFFFFF'; // WHITE Background
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(img, 0, 0);
            dataUrl = tempCanvas.toDataURL('image/png');
        }


        if (dataUrl) {
            const filename = `${suggestFilename(currentUrl)}.png`;
            triggerDownload(dataUrl, filename);
            setStatus(`PNG ready for download: ${filename}`, 'info');
        } else {
             setStatus('Could not get PNG data.', 'danger');
        }
    }

    function downloadDXF() {
        if (!currentQRCode || !currentQRCode._oQRCode) {
             setStatus('Generate QR code first or data unavailable.', 'warning');
            return;
        }

        setStatus('Generating DXF...', 'info');

        // Allow UI update
        setTimeout(() => {
            try {
                const qrData = currentQRCode._oQRCode;
                const moduleCount = qrData.moduleCount;
                const modules = qrData.modules; // 2D array [row][col] boolean (true = dark)

                let dxfContent = `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n`; // Minimal header
                dxfContent += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n1\n`; // Layer table start
                dxfContent += `0\nLAYER\n2\nQR_LINES\n70\n0\n62\n7\n6\nCONTINUOUS\n`; // Define layer 0 (white/black depending on view) color 7=white/black
                dxfContent += `0\nENDTAB\n0\nENDSEC\n`; // Layer table end
                dxfContent += `0\nSECTION\n2\nENTITIES\n`; // Entities section

                const lineStep = DXF_MODULE_SIZE / (DXF_LINES_PER_MODULE + 1);

                for (let row = 0; row < moduleCount; row++) {
                    for (let col = 0; col < moduleCount; col++) {
                        if (modules[row][col]) { // If module is dark (true)
                            // Calculate DXF coordinates (Y is inverted)
                            const x0 = col * DXF_MODULE_SIZE;
                            const y0 = (moduleCount - 1 - row) * DXF_MODULE_SIZE;
                            const x1 = x0 + DXF_MODULE_SIZE;
                            //const y1 = y0 + DXF_MODULE_SIZE; // Not needed for horizontal lines

                            // Generate horizontal lines for hatching
                            for (let i = 1; i <= DXF_LINES_PER_MODULE; i++) {
                                const lineY = y0 + i * lineStep;
                                dxfContent += `0\nLINE\n`;       // Entity type
                                dxfContent += `8\nQR_LINES\n`; // Layer name
                                dxfContent += `10\n${x0}\n`;    // Start X
                                dxfContent += `20\n${lineY}\n`; // Start Y
                                dxfContent += `30\n0.0\n`;      // Start Z
                                dxfContent += `11\n${x1}\n`;    // End X
                                dxfContent += `21\n${lineY}\n`; // End Y
                                dxfContent += `31\n0.0\n`;      // End Z
                            }
                        }
                    }
                }

                dxfContent += `0\nENDSEC\n0\nEOF\n`; // End of entities, End of file

                const blob = new Blob([dxfContent], { type: 'application/dxf' });
                const url = URL.createObjectURL(blob);
                const filename = `${suggestFilename(currentUrl)}.dxf`;

                triggerDownload(url, filename);
                URL.revokeObjectURL(url); // Clean up blob URL
                setStatus(`DXF ready for download: ${filename}`, 'info');

            } catch (error) {
                 console.error("DXF Generation Error:", error);
                 setStatus(`Error generating DXF: ${error.message}`, 'danger');
            }
        }, 10); // Small delay for UI update
    }


    function triggerDownload(href, filename) {
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
    }

    // --- Initial State ---
    disableDownloadButtons();
    setStatus('Enter a URL and click Generate.');
});