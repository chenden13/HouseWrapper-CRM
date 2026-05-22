import fs from 'fs';
import path from 'path';

const logFile = 'C:\\Users\\chend\\.gemini\\antigravity-ide\\brain\\e6e6645f-7e91-4c10-82c3-51786457d58a\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logFile, 'utf8');
const lines = content.split('\n');

const stepsToPrint = [368, 380, 398, 406];

lines.forEach(line => {
  if (!line) return;
  try {
    const obj = JSON.parse(line);
    if (stepsToPrint.includes(obj.step_index)) {
      console.log(`=== Step ${obj.step_index} (${obj.type}) ===`);
      console.log('Keys:', Object.keys(obj));
      if (obj.content) {
        console.log('Content length:', obj.content.length);
        console.log('Content snippet:', obj.content.substring(0, 800));
      }
      console.log('=====================================\n');
    }
  } catch (err) {}
});
