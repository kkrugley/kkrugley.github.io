document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const prompt = document.getElementById('prompt');
    const inputLine = document.getElementById('input-line');
    const statusLine = document.getElementById('status-line');

    let appState = 'WELCOME'; // 'WELCOME', 'MAIN_MENU', 'AWAITING_RETURN'
    const spinnerChars = ['🌍', '🌎', '🌏'];
    let spinnerInterval;

    const content = {
        welcomeTitle: "Pavel Kruhlei // CLI Portfolio",
        // EDITED: Changed the message to prompt for Enter key
        welcomeMessage: `[dim]Версия 1.0[/dim]
Добро пожаловать в интерактивное портфолио!

[dim]Нажмите Enter, чтобы продолжить...[/dim]`,
        mainMenuTitle: "Главное меню",
        mainMenu: `1. Обо мне
2. Портфолио
3. Навыки
4. Контакты
5. Очистить`,
        returnMessage: `[dim]Нажмите Enter, чтобы вернуться в главное меню...[/dim]`,
        unknownCommand: `[bold red]❌ Ошибка:[/bold red] Команда не найдена.`,
        processingStatus: "Обработка запроса...",
        aboutTitle: "Обо мне",
        aboutContent: `Привет! Я Павел, мультидисциплинарный дизайнер и создатель цифрового контента из Познани, Польша.

Моя страсть — превращать идеи в высококачественные 3D-модели, фотореалистичные рендеры и увлекательные визуализации. Я сочетаю технические навыки с креативным подходом для достижения наилучшего результата.`,
        portfolioTitle: "Портфолио",
        portfolioContent: [
            { key: "Meshpoint Room:", value: "Анимация облака точек, созданная с помощью фотограмметрии. <a href='https://kkrugley.artstation.com/projects/G8APrd' target='_blank'>[Смотреть на ArtStation]</a>" },
            { key: "Clothespin Comp:", value: "3D-композиция, демонстрирующая внимание к деталям и текстурам. <a href='https://kkrugley.artstation.com/projects/ZaGlO0' target='_blank'>[Смотреть на ArtStation]</a>" },
            { key: "Product Renders:", value: "Коллекция коммерческих рендеров для различных продуктов. <a href='https://www.behance.net/kkrugley' target='_blank'>[Смотреть на Behance]</a>" }
        ],
        skillsTitle: "Ключевые навыки",
        skillsContent: `[bold yellow]3D и Дизайн:[/bold yellow]
  - 3D-моделирование и рендеринг
  - Промышленный и продуктовый дизайн
  - Генерация концепций
  - Фотограмметрия

[bold yellow]Программное обеспечение:[/bold yellow]
  - Blender, Fusion 360, KeyShot, Solidworks`
        ,
        contactTitle: "Контакты",
        contactContent: [
            { key: "Email:", value: "<a href='mailto:kkrugley@proton.me'>kkrugley@proton.me</a>" },
            { key: "LinkedIn:", value: "<a href='https://www.linkedin.com/in/pavel-kruhlei' target='_blank'>linkedin.com/in/pavel-kruhlei</a>" },
            { key: "Behance:", value: "<a href='https://www.behance.net/kkrugley' target='_blank'>behance.net/kkrugley</a>" },
            { key: "ArtStation:", value: "<a href='https://kkrugley.artstation.com/' target='_blank'>kkrugley.artstation.com</a>" }
        ],
    };

    // --- Helper Functions to Mimic 'rich' ---

    function parseBBCode(text) {
        return text.replace(/\[([^\]]+)\]([^\[]+)\[\/[^\]]+\]/g, (match, tag, content) => {
            const classes = tag.replace('/', '').trim();
            return `<span class="${classes}">${content}</span>`;
        });
    }

    function createPanel(title, body, color) {
        const titleHtml = `<div class="panel-title">${title}</div>`;
        const bodyHtml = parseBBCode(body);
        return `<div class="panel ${color}">${titleHtml}${bodyHtml}</div>`;
    }

    function createTable(data) {
        const tableRows = data.map(item =>
            `<div class="table-key">${parseBBCode(item.key)}</div><div>${parseBBCode(item.value)}</div>`
        ).join('');
        return `<div class="rich-table">${tableRows}</div>`;
    }

    function showStatus(message) {
        let i = 0;
        clearInterval(spinnerInterval);
        statusLine.style.display = 'flex';
        spinnerInterval = setInterval(() => {
            statusLine.innerHTML = `<span class="spinner">${spinnerChars[i % spinnerChars.length]}</span> ${message}`;
            i++;
        }, 200);
    }

    function hideStatus() {
        clearInterval(spinnerInterval);
        statusLine.style.display = 'none';
    }

    // --- Core Application Logic ---

    function clearScreen() { output.innerHTML = ''; }
    
    function print(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    function showMainMenu() {
        clearScreen();
        const menuPanel = createPanel(content.mainMenuTitle, content.mainMenu, 'default-panel');
        print(menuPanel);
        appState = 'MAIN_MENU';
        inputLine.style.display = 'flex';
        input.focus();
    }
    
    function showWelcomeScreen() {
        clearScreen();
        const welcomePanel = createPanel(content.welcomeTitle, content.welcomeMessage, 'green');
        print(welcomePanel);
        appState = 'WELCOME';
        inputLine.style.display = 'none'; // Hide input line on welcome screen
        // EDITED: Removed setTimeout
    }

    function showPage(pageContent) {
        clearScreen();
        showStatus(content.processingStatus);
        
        setTimeout(() => {
            hideStatus();
            print(pageContent);
            print(parseBBCode(content.returnMessage));
            appState = 'AWAITING_RETURN';
            inputLine.style.display = 'none';
        }, 500);
    }

    function handleCommand(command) {
        const cmd = command.toLowerCase().trim();
        print(`<span style="color:var(--prompt-color)">></span> ${command}`);

        if (appState === 'MAIN_MENU') {
            switch (cmd) {
                case '1': case 'about':
                    showPage(createPanel(content.aboutTitle, content.aboutContent, 'yellow'));
                    break;
                case '2': case 'portfolio':
                    showPage(createPanel(content.portfolioTitle, createTable(content.portfolioContent), 'yellow'));
                    break;
                case '3': case 'skills':
                    showPage(createPanel(content.skillsTitle, content.skillsContent, 'yellow'));
                    break;
                case '4': case 'contact':
                    showPage(createPanel(content.contactTitle, createTable(content.contactContent), 'yellow'));
                    break;
                case '5': case 'clear':
                    showMainMenu();
                    break;
                default:
                    print(createPanel(content.unknownCommand, `Команда '${command}' не распознана.`, 'red'));
            }
        }
    }

    // --- Event Listeners ---
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && appState === 'MAIN_MENU') {
            const command = input.value;
            if (command) {
                handleCommand(command);
                input.value = '';
            }
        }
    });
    
    // EDITED: This listener now handles both WELCOME and AWAITING_RETURN states
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (appState === 'AWAITING_RETURN' || appState === 'WELCOME')) {
            showMainMenu();
        }
    });

    // --- Initial Start ---
    showWelcomeScreen();
});