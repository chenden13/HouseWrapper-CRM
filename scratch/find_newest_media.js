import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\chend\\.gemini\\antigravity-ide\\brain\\9611345c-b76f-4ca0-8c5f-d9bafd76f914\\.tempmediaStorage';
const files = fs.readdirSync(dir).map(f => {
  const p = path.join(dir, f);
  const stat = fs.statSync(p);
  return { name: f, mtime: stat.mtimeMs, size: stat.size };
});

files.sort((a, b) => b.mtime - a.mtime);

console.log('Newest files:');
files.slice(0, 5).forEach(f => {
  console.log(`${f.name} - ${new Date(f.mtime).toISOString()} - ${f.size} bytes`);
});
