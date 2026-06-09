const fs = require('fs');
const path = require('path');

const exportDir = 'C:\\Users\\proek\\Desktop\\СТРАХОВКА\\ChatExport_2026-03-26';
const companies = ['wiener', 'dunav', 'uniqa', 'generali', 'triglav', 'ddor'];
const aliases = {
    'wiener': ['wiener', 'винер', 'виньер'],
    'dunav': ['dunav', 'дунав'],
    'uniqa': ['uniqa', 'уника', 'унику'],
    'generali': ['generali', 'дженерали', 'генерали'],
    'triglav': ['triglav', 'триглав'],
    'ddor': ['ddor', 'ддор']
};

const results = {
    wiener: [],
    dunav: [],
    uniqa: [],
    generali: [],
    triglav: [],
    ddor: []
};

// Простой парсинг HTML регулярками для извлечения сообщений
function parseMessages(html) {
    const messages = [];
    const regex = /<div class="message default clearfix"[^>]*>([\s\S]*?)<\/div>(?=\s*<div class="message)/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
        const msgHtml = match[1];
        
        // Достаём текст
        const textMatch = msgHtml.match(/<div class="text"[^>]*>([\s\S]*?)<\/div>/);
        if (!textMatch) continue;
        
        let text = textMatch[1]
            .replace(/<br>/g, ' ')
            .replace(/<[^>]+>/g, '') // Убираем остальные теги
            .replace(/\s+/g, ' ')
            .trim();
            
        if (text.length < 10 || text.length > 500) continue; // Игнорируем слишком короткие и 너무 длинные
        
        // Вытаскиваем дату для меты
        const dateMatch = msgHtml.match(/<div class="pull_right date details" title="([^"]+)">/);
        const dateStr = dateMatch ? dateMatch[1] : '';
        const year = dateStr.match(/\d{4}/) ? dateStr.match(/\d{4}/)[0] : '2025';
        
        messages.push({ text, date: dateStr, year });
    }
    return messages;
}

const files = fs.readdirSync(exportDir).filter(f => f.startsWith('messages') && f.endsWith('.html'));
console.log(`Found ${files.length} message files.`);

let totalMentions = 0;

for (const file of files) {
    const filePath = path.join(exportDir, file);
    const html = fs.readFileSync(filePath, 'utf-8');
    const messages = parseMessages(html);
    
    for (const msg of messages) {
        const lowerText = msg.text.toLowerCase();
        
        for (const comp of companies) {
            const hasMention = aliases[comp].some(alias => lowerText.includes(alias));
            if (hasMention) {
                // Проверяем, нет ли дубликатов (иногда люди пересылают одно и то же)
                if (!results[comp].some(r => r.text === msg.text)) {
                    results[comp].push({
                        mood: 'neu', // По умолчанию нейтральный
                        text: `${comp.charAt(0).toUpperCase() + comp.slice(1)}: ${msg.text.substring(0, 150)}${msg.text.length > 150 ? '...' : ''}`,
                        meta: `Telegram, ${msg.year}`
                    });
                    totalMentions++;
                }
            }
        }
    }
}

console.log(`Total unique mentions extracted: ${totalMentions}`);
for (const comp of companies) {
    console.log(`${comp}: ${results[comp].length}`);
}

fs.writeFileSync('C:\\Users\\proek\\Desktop\\PROEKTZ\\vector-mariner\\raw_reviews.json', JSON.stringify(results, null, 2));
console.log('Saved to raw_reviews.json');
