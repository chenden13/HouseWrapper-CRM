import fs from 'fs';
import path from 'path';

const logFile = 'C:\\Users\\chend\\.gemini\\antigravity-ide\\brain\\e6e6645f-7e91-4c10-82c3-51786457d58a\\.system_generated\\logs\\transcript.jsonl';

const content = fs.readFileSync(logFile, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (!line) return;
  try {
    const obj = JSON.parse(line);
    const text = JSON.stringify(obj);
    
    // Look for any database printouts of inventory items
    if (text.includes('Zone G items') || text.includes('INV-G-1') || (text.includes('currentMeters') && text.includes('Brand'))) {
      console.log(`Line ${idx + 1}: Step ${obj.step_index}, Type: ${obj.type}`);
      if (obj.content) console.log(`  Content: ${obj.content.substring(0, 500)}`);
      if (obj.output) console.log(`  Output: ${obj.output.substring(0, 1000)}`);
      console.log('----------------------------------------------------');
    }
  } catch (err) {}
});
