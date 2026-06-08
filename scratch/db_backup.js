import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Read .env file manually
const envPath = path.resolve('.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}\\s*=\\s*([^\\n\\r]+)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing from .env!');
  process.exit(1);
}

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'customers',
  'inventory',
  'inventory_logs',
  'purchase_records',
  'finance_records',
  'finance_settlements',
  'vehicle_master'
];

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join('scratch', 'backups', `backup_data_${timestamp}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`Created backup directory: ${backupDir}`);

  for (const table of tables) {
    console.log(`Backing up table: ${table}...`);
    try {
      let allData = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .range(from, from + pageSize - 1);
        
        if (error) {
          // Some tables might not exist yet, log a warning and continue
          if (error.message.includes('does not exist') || error.code === '42P01') {
            console.warn(`Table ${table} does not exist in the database, skipping.`);
            break;
          }
          throw error;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          from += pageSize;
        } else {
          hasMore = false;
        }

        if (data && data.length < pageSize) {
          hasMore = false;
        }
      }

      if (allData.length > 0 || table === 'customers') {
        const filePath = path.join(backupDir, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(allData, null, 2), 'utf-8');
        console.log(`Successfully backed up ${allData.length} records to ${filePath}`);
      }
    } catch (err) {
      console.error(`Failed to back up table ${table}:`, err);
    }
  }

  console.log('Database backup complete!');
}

runBackup();
