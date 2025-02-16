document.addEventListener('DOMContentLoaded', () => {
    const colorBlocksContainer = document.querySelector('.color-blocks');
    const checkButton = document.getElementById('check-button');
    const notification = document.getElementById('notification');
    const colorHarmonySelect = document.getElementById('color-harmony');
  
    const colors = [];
    let mainColorIndex = null;
  
    // Function to generate a random HEX color
    function getRandomHexColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
  
    // Function to create a color block
    function createColorBlock(index) {
      const block = document.createElement('div');
      block.className = 'color-block';
  
      // Canvas
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      const initialColor = getRandomHexColor();
      ctx.fillStyle = initialColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      block.appendChild(canvas);
  
      // "Make Main" label
      const makeMain = document.createElement('div');
      makeMain.className = 'make-main';
      makeMain.textContent = 'сделать главным';
      makeMain.onclick = () => setMainColor(index); // Set the main color on click
      block.appendChild(makeMain);
  
      // Input
      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group';
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 7;
      input.placeholder = '#FFFFFF';
      input.value = initialColor; // Set initial random color
      input.className = 'form-control form-control-sm';
      input.addEventListener('input', () => updateColor(index));
      inputGroup.appendChild(input);
      block.appendChild(inputGroup);
  
      colorBlocksContainer.appendChild(block);
  
      colors.push({ canvas, ctx, input, color: initialColor });
    }
  
    // Generate 5 color blocks
    for (let i = 0; i < 5; i++) {
      createColorBlock(i);
    }
  
    // Update color on input change
    function updateColor(index) {
      const value = colors[index].input.value;
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
        colors[index].color = value;
        colors[index].ctx.fillStyle = value;
        colors[index].ctx.fillRect(0, 0, colors[index].canvas.width, colors[index].canvas.height);
      } else {
        colors[index].ctx.fillStyle = '#ffffff';
        colors[index].ctx.fillRect(0, 0, colors[index].canvas.width, colors[index].canvas.height);
      }
      updateCheckButtonState();
    }
  
    // Enable/disable the "Check" button
    function updateCheckButtonState() {
      const validColors = colors.filter(color => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color.input.value));
      checkButton.disabled = validColors.length < 2;
      checkButton.classList.toggle('btn-primary', validColors.length >= 2);
      checkButton.classList.toggle('btn-secondary', validColors.length < 2);
    }
  
    // Set or update the main color
    function setMainColor(index) {
      // If the same block is clicked again, do nothing
      if (mainColorIndex === index) return;
  
      // Reset previous main color
      if (mainColorIndex !== null) {
        colors[mainColorIndex].input.style.backgroundColor = ''; // Remove highlight
      }
  
      // Set new main color
      mainColorIndex = index;
      colors[mainColorIndex].input.style.backgroundColor = '#e9ecef'; // Highlight the new main color
    }
  
    // Check color compatibility
    checkButton.addEventListener('click', () => {
      const validColors = colors
        .map((color, index) => ({ color: color.color, index }))
        .filter(({ color }) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color));
  
      if (!mainColorIndex) {
        alert('Выберите главный цвет!');
        return;
      }
  
      const harmonyType = colorHarmonySelect.value;
      const areCompatible = areColorsCompatible(validColors.map(c => c.color), harmonyType);
  
      if (areCompatible) {
        notification.className = 'notification success';
        notification.textContent = 'Все указанные цвета являются совместимыми!';
      } else {
        adjustColors(validColors, harmonyType);
        notification.className = 'notification error';
        notification.textContent = 'Цвета были скорректированы для совместимости.';
      }
    });
  
    // Convert HEX to HSL
    function hexToHsl(hex) {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;
  
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
  
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
  
      return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }
  
    // Convert HSL to HEX
    function hslToHex(h, s, l) {
      h /= 360;
      s /= 100;
      l /= 100;
  
      let r, g, b;
      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
  
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
  
      const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  
    // Check compatibility based on harmony type
    function areColorsCompatible(colorArray, harmonyType) {
      if (!mainColorIndex) {
        alert('Выберите главный цвет!');
        return false;
      }
  
      const mainColor = hexToHsl(colors[mainColorIndex].color);
      const compatibleColors = [];
  
      switch (harmonyType) {
        case 'analogous':
          compatibleColors.push(
            hslToHex((mainColor.h + 30) % 360, mainColor.s, mainColor.l),
            hslToHex((mainColor.h - 30 + 360) % 360, mainColor.s, mainColor.l)
          );
          break;
        case 'complementary':
          compatibleColors.push(hslToHex((mainColor.h + 180) % 360, mainColor.s, mainColor.l));
          break;
        case 'triad':
          compatibleColors.push(
            hslToHex((mainColor.h + 120) % 360, mainColor.s, mainColor.l),
            hslToHex((mainColor.h + 240) % 360, mainColor.s, mainColor.l)
          );
          break;
        case 'split-complementary':
          compatibleColors.push(
            hslToHex((mainColor.h + 150) % 360, mainColor.s, mainColor.l),
            hslToHex((mainColor.h + 210) % 360, mainColor.s, mainColor.l)
          );
          break;
        case 'square':
          compatibleColors.push(
            hslToHex((mainColor.h + 90) % 360, mainColor.s, mainColor.l),
            hslToHex((mainColor.h + 180) % 360, mainColor.s, mainColor.l),
            hslToHex((mainColor.h + 270) % 360, mainColor.s, mainColor.l)
          );
          break;
        case 'monochromatic':
          compatibleColors.push(
            hslToHex(mainColor.h, mainColor.s, Math.min(mainColor.l + 20, 100)),
            hslToHex(mainColor.h, mainColor.s, Math.max(mainColor.l - 20, 0))
          );
          break;
        default:
          console.log(`Unknown harmony type: ${harmonyType}`);
          return false;
      }
  
      // Check if all colors match the compatible colors
      return colorArray.every(color => compatibleColors.includes(color));
    }
  
    // Adjust colors to match the selected harmony
    function adjustColors(colorArray, harmonyType) {
      if (!mainColorIndex) {
        alert('Выберите главный цвет!');
        return;
      }
  
      const mainColor = hexToHsl(colors[mainColorIndex].color);
  
      colorArray.forEach(({ index }) => {
        if (index === mainColorIndex) return; // Skip the main color
  
        let newColor;
        switch (harmonyType) {
          case 'analogous':
            newColor = hslToHex((mainColor.h + 30) % 360, mainColor.s, mainColor.l);
            break;
          case 'complementary':
            newColor = hslToHex((mainColor.h + 180) % 360, mainColor.s, mainColor.l);
            break;
          case 'triad':
            newColor = hslToHex((mainColor.h + 120) % 360, mainColor.s, mainColor.l);
            break;
          case 'split-complementary':
            newColor = hslToHex((mainColor.h + 150) % 360, mainColor.s, mainColor.l);
            break;
          case 'square':
            newColor = hslToHex((mainColor.h + 90) % 360, mainColor.s, mainColor.l);
            break;
          case 'monochromatic':
            newColor = hslToHex(mainColor.h, mainColor.s, Math.min(mainColor.l + 20, 100));
            break;
          default:
            console.log(`Unknown harmony type: ${harmonyType}`);
            return;
        }
  
        // Update the color in the UI
        colors[index].color = newColor;
        colors[index].input.value = newColor;
        colors[index].ctx.fillStyle = newColor;
        colors[index].ctx.fillRect(0, 0, colors[index].canvas.width, colors[index].canvas.height);
      });
    }
  });