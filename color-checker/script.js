let colors = [];
let mainColorIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Генерация 5 блоков с уникальными случайными HEX-кодами
  for (let i = 0; i < 5; i++) {
    let color = getRandomColor();
    colors.push(color);
    updateCanvas(i + 1);
    document.querySelector(`#block${i + 1} .hex-input`).value = color;
  }
  validateColors(); // Всегда активна кнопка
});

// Генерация случайного HEX-кода
function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

// Обновление цвета canvas для блока с заданным индексом
function updateCanvas(index) {
  const canvas = document.querySelector(`#block${index} canvas`);
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.fillStyle = colors[index - 1];
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Обработка ввода HEX-кода (обновление в реальном времени)
function updateColor(index) {
  const input = document.querySelector(`#block${index} .hex-input`);
  const value = input.value.trim();
  if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
    colors[index - 1] = value;
  } else {
    colors[index - 1] = "#FFFFFF";
  }
  updateCanvas(index);
  validateColors();
}

// Выбор главного цвета с визуальным выделением
function setMainColor(index) {
  document.querySelectorAll(".color-block").forEach(block =>
    block.classList.remove("main-color")
  );
  mainColorIndex = index - 1;
  document.getElementById(`block${index}`).classList.add("main-color");
}

// Кнопка всегда активна – валидация не блокирует проверку
function validateColors() {
  document.getElementById("checkButton").disabled = false;
}

// Проверка совместимости и коррекция цветов по выбранной схеме
function checkCompatibility() {
  const scheme = document.getElementById("schemeSelector").value;
  const mainHSL = hexToHSL(colors[mainColorIndex]); // h в [0,1]
  let j = 0; // счетчик для блоков, не являющихся главным

  switch (scheme) {
    case "analogous": {
      // Смещения: -30, -15, 15, 30 градусов
      const offsets = [-30, -15, 15, 30];
      for (let i = 0; i < colors.length; i++) {
        if (i === mainColorIndex) continue;
        let mainHueDegrees = mainHSL.h * 360;
        let newHueDegrees = (mainHueDegrees + offsets[j] + 360) % 360;
        let newHue = newHueDegrees / 360;
        colors[i] = HSLToHex(newHue, mainHSL.s, mainHSL.l);
        updateCanvas(i + 1);
        document.querySelector(`#block${i + 1} .hex-input`).value = colors[i];
        j++;
      }
      showNotification("Аналоговая схема применена!", "success");
      break;
    }
    case "monochromatic": {
      // Изменение яркости: варианты -0.2, -0.1, +0.1, +0.2
      const offsets = [-0.2, -0.1, 0.1, 0.2];
      for (let i = 0; i < colors.length; i++) {
        if (i === mainColorIndex) continue;
        let newL = mainHSL.l + offsets[j];
        newL = Math.min(Math.max(newL, 0), 1);
        colors[i] = HSLToHex(mainHSL.h, mainHSL.s, newL);
        updateCanvas(i + 1);
        document.querySelector(`#block${i + 1} .hex-input`).value = colors[i];
        j++;
      }
      showNotification("Монохромная схема применена!", "success");
      break;
    }
    case "triad": {
      // Альтернирование между mainHue+120 и mainHue+240
      for (let i = 0; i < colors.length; i++) {
        if (i === mainColorIndex) continue;
        let offset = (j % 2 === 0) ? 120 : 240;
        let newHueDegrees = (mainHSL.h * 360 + offset) % 360;
        let newHue = newHueDegrees / 360;
        colors[i] = HSLToHex(newHue, mainHSL.s, mainHSL.l);
        updateCanvas(i + 1);
        document.querySelector(`#block${i + 1} .hex-input`).value = colors[i];
        j++;
      }
      showNotification("Триадная схема применена!", "success");
      break;
    }
    case "complementary": {
      // Чередование: для неглавных – один оставляем основной, другой – комплементарный (mainHue+180)
      for (let i = 0; i < colors.length; i++) {
        if (i === mainColorIndex) continue;
        let offset = (j % 2 === 0) ? 0 : 180;
        let newHueDegrees = (mainHSL.h * 360 + offset) % 360;
        let newHue = newHueDegrees / 360;
        colors[i] = HSLToHex(newHue, mainHSL.s, mainHSL.l);
        updateCanvas(i + 1);
        document.querySelector(`#block${i + 1} .hex-input`).value = colors[i];
        j++;
      }
      showNotification("Комплементарная схема применена!", "success");
      break;
    }
    case "split-complementary": {
      // Альтернируем между (mainHue+180-30) и (mainHue+180+30)
      for (let i = 0; i < colors.length; i++) {
        if (i === mainColorIndex) continue;
        let offset = (j % 2 === 0) ? -30 : 30;
        let newHueDegrees = (mainHSL.h * 360 + 180 + offset + 360) % 360;
        let newHue = newHueDegrees / 360;
        colors[i] = HSLToHex(newHue, mainHSL.s, mainHSL.l);
        updateCanvas(i + 1);
        document.querySelector(`#block${i + 1} .hex-input`).value = colors[i];
        j++;
      }
      showNotification("Сплит-комплементарная схема применена!", "success");
      break;
    }
    case "square": {
      // Смещения: +90, +180, +270, +360 (последнее совпадает с основным)
      const offsets = [90, 180, 270, 360];
      for (let i = 0; i < colors.length; i++) {
        if (i === mainColorIndex) continue;
        let newHueDegrees = (mainHSL.h * 360 + offsets[j]) % 360;
        let newHue = newHueDegrees / 360;
        colors[i] = HSLToHex(newHue, mainHSL.s, mainHSL.l);
        updateCanvas(i + 1);
        document.querySelector(`#block${i + 1} .hex-input`).value = colors[i];
        j++;
      }
      showNotification("Квадратная схема применена!", "success");
      break;
    }
    case "compound": {
      // Комплексная схема: берем комплементарный цвет (mainHue+180) и добавляем смещения -30, 30, -15, 15
      const offsets = [-30, 30, -15, 15];
      for (let i = 0; i < colors.length; i++) {
        if (i === mainColorIndex) continue;
        let compHueDegrees = (mainHSL.h * 360 + 180) % 360;
        let newHueDegrees = (compHueDegrees + offsets[j] + 360) % 360;
        let newHue = newHueDegrees / 360;
        colors[i] = HSLToHex(newHue, mainHSL.s, mainHSL.l);
        updateCanvas(i + 1);
        document.querySelector(`#block${i + 1} .hex-input`).value = colors[i];
        j++;
      }
      showNotification("Комплексная схема применена!", "success");
      break;
    }
    case "shades": {
      // Оттенки: уменьшаем яркость для каждого неглавного блока
      for (let i = 0; i < colors.length; i++) {
        if (i === mainColorIndex) continue;
        let newL = mainHSL.l - 0.15 * (j + 1);
        if (newL < 0) newL = 0;
        colors[i] = HSLToHex(mainHSL.h, mainHSL.s, newL);
        updateCanvas(i + 1);
        document.querySelector(`#block${i + 1} .hex-input`).value = colors[i];
        j++;
      }
      showNotification("Оттенки применены!", "success");
      break;
    }
    default: {
      showNotification("Неизвестная схема!", "error");
      break;
    }
  }
}

// Отображение уведомления с плавным появлением/исчезновением
function showNotification(message, type) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = "notification mt-3 " + (type === "success" ? "bg-success text-white" : "bg-danger text-white");
  notification.style.display = "block";
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.style.display = "none";
    }, 500);
  }, 3000);
}

// Копирование HEX-кода в буфер обмена
function copyToClipboard(index) {
  const hexValue = document.querySelector(`#block${index} .hex-input`).value;
  navigator.clipboard.writeText(hexValue).then(() => {
    alert("HEX код скопирован: " + hexValue);
  });
}

/* --- Функции конвертации между HEX, RGB и HSL --- */

// HEX -> RGB
function hexToRGB(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// RGB -> HSL
function RGBToHSL(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

// HSL -> RGB
function HSLToRGB(h, s, l) {
  let r, g, b;
  if(s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// RGB -> HEX
function RGBToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
}

// HEX -> HSL
function hexToHSL(hex) {
  const rgb = hexToRGB(hex);
  return RGBToHSL(rgb.r, rgb.g, rgb.b);
}

// HSL -> HEX
function HSLToHex(h, s, l) {
  const rgb = HSLToRGB(h, s, l);
  return RGBToHex(rgb.r, rgb.g, rgb.b);
}
