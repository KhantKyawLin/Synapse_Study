const fs = require('fs');
const path = require('path');

const EXCEL_FOLDER = './flash_cards_excel_files';
const OUTPUT_FILE = './data.json';

// Helper to parse CSV lines correctly (handling quotes and commas)
function parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += c;
        }
    }
    result.push(cur);
    return result;
}

function updateData() {
    console.log('🔍 Scanning for flashcard files...');
    
    if (!fs.existsSync(EXCEL_FOLDER)) {
        console.error(`❌ Folder not found: ${EXCEL_FOLDER}`);
        return;
    }

    const files = fs.readdirSync(EXCEL_FOLDER).filter(f => f.endsWith('.csv'));
    let allCards = [];

    files.forEach(file => {
        const filePath = path.join(EXCEL_FOLDER, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        // Auto-determine category from filename
        // Matches "2_antigen_flashcards_immunology.csv" -> "Immunology - Antigen"
        let category = "General";
        const parts = file.replace('.csv', '').split('_');
        
        if (parts.length >= 4) {
             const topic = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
             const subject = parts[3].charAt(0).toUpperCase() + parts[3].slice(1);
             category = `${subject} - ${topic}`;
        } else {
            // Fallback for simpler names like "Pathology_Basics.csv"
            category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        }

        lines.forEach((line) => {
            const columns = parseCSVLine(line);
            if (columns.length >= 2) {
                let question = columns[0].trim().replace(/^"|"$/g, '');
                let answer = columns.slice(1).join(',').trim().replace(/^"|"$/g, '');
                
                if (question && answer) {
                    allCards.push({
                        category: category,
                        question: question,
                        answer: answer
                    });
                }
            }
        });
        console.log(`✅ Loaded ${lines.filter(l => l.trim()).length} lines from: ${file}`);
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allCards, null, 2));
    console.log(`\n🎉 Success! data.json updated with ${allCards.length} total cards.`);
}

updateData();
