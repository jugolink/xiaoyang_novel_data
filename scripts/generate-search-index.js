const fs = require('fs');
const path = require('path');

const NOVELS_DIR = path.join(process.cwd(), 'novels_data');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'search.json');

function generateIndex() {
  if (!fs.existsSync(NOVELS_DIR)) {
    console.warn('novels_data directory not found, skipping search index generation.');
    return;
  }

  const entries = fs.readdirSync(NOVELS_DIR, { withFileTypes: true });
  const searchData = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const novelDir = path.join(NOVELS_DIR, entry.name);
    const configPath = path.join(novelDir, 'novel.json');
    
    if (!fs.existsSync(configPath)) continue;
    
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      continue;
    }

    const novelId = config.slug || entry.name;
    
    searchData.push({
      id: novelId,
      title: config.title,
      author: config.author || '',
      desc: config.desc || '',
      url: `/novel/${novelId}`
    });
  }

  // Ensure public directory exists
  const publicDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(searchData), 'utf-8');
  console.log(`✅ Search index generated with ${searchData.length} novels.`);
}

generateIndex();
