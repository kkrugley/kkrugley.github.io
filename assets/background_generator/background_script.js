const canvas = document.getElementById("wallpaper");
const ctx = canvas.getContext("2d");

// Устанавливаем размеры канваса на весь экран
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Настройки
const symbols = ["◌̂", "◌̀", "◌́", "◌̄", "◌̆"];
const bgColor = "#FAFAFA";
const symbolColor = "#F2F2F2"; // Полупрозрачный серый цвет (50% прозрачности)#F7F7F7
const elements = [];
const minSizePercent = 0.04; // 4% от меньшей стороны экрана
const maxSizePercent = 0.05; // 5% от меньшей стороны экрана
const density = 0.5; // От 0 до 1. Чем меньше значение, тем меньше символов.
const totalSymbols = Math.floor(500 * density);


// Заливка фона
ctx.fillStyle = bgColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Функция для проверки пересечений
function isOverlapping(x, y, size) {
    return elements.some(el => {
        const dx = el.x - x;
        const dy = el.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (el.size + size) / 2; // Простая проверка пересечения
    });
}

// Генерация символов
const maxAttempts = 1000; // Ограничение на попытки размещения
for (let i = 0; i < totalSymbols; i++) {
    let attempts = 0;
    let placed = false;
    while (attempts < maxAttempts && !placed) {
        attempts++;
        const size = Math.random() * (maxSizePercent - minSizePercent) * Math.min(canvas.width, canvas.height) + (minSizePercent * Math.min(canvas.width, canvas.height));
        const x = Math.random() * (canvas.width - size) + size / 2;
        const y = Math.random() * (canvas.height - size) + size / 2;
        const angle = Math.random() * 360;

        if (!isOverlapping(x, y, size)) {
            elements.push({ x, y, size });
            placed = true;

            // Рисуем символ
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.font = `${size}px Arial`;
            ctx.fillStyle = symbolColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(symbols[Math.floor(Math.random() * symbols.length)], 0, 0);
            ctx.restore();
        }
    }
}