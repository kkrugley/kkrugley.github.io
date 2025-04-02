document.addEventListener('DOMContentLoaded', () => {
    // Updated ID reference to match HTML change
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
    let currentData = '';     // To hold the generated data for filenames

    // --- Generate QR Code ---
    const generateQRCode = () => {
        const inputText = textInput.value.trim(); // Get data from input

        // Only check if the input is empty
        if (!inputText) {
            setStatus('Please enter some data to encode.', 'warning');
            textInput.focus();
            return;
        }

        setStatus('Generating...', 'info');
        clearQRCode(); // Clear previous QR code
        disableDownloadButtons();
        currentData = inputText; // Store the input data for filename suggestion

        // Use setTimeout to allow the UI to update before heavy lifting
        setTimeout(() => {
            try {
                currentQRCode = new QRCode(qrCodeContainer, {
                    text: inputText, // Use the input text directly
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
        currentData = '';
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

    // Updated filename suggestion for generic text
    function suggestFilename(inputText) {
        if (!inputText) return "qrcode_data";
        try {
            // Replace whitespace with underscore, remove unsafe chars
            let name = inputText.trim().replace(/\s+/g, '_');
            name = name.replace(/[^a-zA-Z0-9_.-]/g, ''); // Allow letters, numbers, _, ., -
            // Limit length
            name = name.substring(0, 50);
            // Ensure it's not empty after cleaning
            return name || "qrcode_data";
        } catch {
            return "qrcode_data"; // Fallback
        }
    }


    // --- Download Logic ---
    function downloadPNG() {
        if (!currentQRCode) {
            setStatus('Generate QR code first.', 'warning');
            return;
        }

        const canvas = qrCodeContainer.querySelector('canvas');
        const img = qrCodeContainer.querySelector('img');
        let dataUrl = null;

        if (canvas) {
            dataUrl = canvas.toDataURL('image/png');
        } else if (img) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.naturalWidth;
            tempCanvas.height = img.naturalHeight;
            const ctx = tempCanvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(img, 0, 0);
            dataUrl = tempCanvas.toDataURL('image/png');
        }

        if (dataUrl) {
            // Use currentData (the actual input) for filename suggestion
            const filename = `${suggestFilename(currentData)}.png`;
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

        setTimeout(() => {
            try {
                const qrData = currentQRCode._oQRCode;
                const moduleCount = qrData.moduleCount;
                const modules = qrData.modules;

                let dxfContent = `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n`;
                dxfContent += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n1\n`;
                dxfContent += `0\nLAYER\n2\nQR_LINES\n70\n0\n62\n7\n6\nCONTINUOUS\n`;
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
                                dxfContent += `0\nLINE\n8\nQR_LINES\n10\n${x0}\n20\n${lineY}\n30\n0.0\n11\n${x1}\n21\n${lineY}\n31\n0.0\n`;
                            }
                        }
                    }
                }

                dxfContent += `0\nENDSEC\n0\nEOF\n`;

                const blob = new Blob([dxfContent], { type: 'application/dxf' });
                const url = URL.createObjectURL(blob);
                // Use currentData (the actual input) for filename suggestion
                const filename = `${suggestFilename(currentData)}.dxf`;

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
    setStatus('Enter data above and click Generate.'); // Updated initial message
});