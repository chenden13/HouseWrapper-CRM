const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');

const dotenv = fs.readFileSync('.env', 'utf8');
const env = {};
dotenv.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importNewSizes() {
  console.log('Reading 尺寸表.xlsx...');
  const workbook = XLSX.readFile('尺寸表.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  const vehicleMap = new Map();
  const columnGroups = [0, 4, 8, 12, 16, 20];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    
    columnGroups.forEach(startIndex => {
      const brand = String(row[startIndex] || '').trim();
      const model = String(row[startIndex + 1] || '').trim();
      const size = String(row[startIndex + 2] || '').trim();
      
      if (brand && model && brand !== '廠牌') {
        const id = `${brand}_${model}`.replace(/\s+/g, '_').toLowerCase();
        vehicleMap.set(id, { id, brand, model, size });
      }
    });
  }
  
  const vehicles = Array.from(vehicleMap.values());
  console.log(`Parsed ${vehicles.length} UNIQUE vehicle mappings.`);
  
  if (vehicles.length === 0) return;

  // Clear existing data to ensure a clean overwrite
  console.log('Clearing existing vehicle_master data...');
  const { error: deleteError } = await supabase.from('vehicle_master').delete().neq('id', 'placeholder_that_doesnt_exist');
  if (deleteError) {
    console.warn('Delete error (might be expected if RLS is on):', deleteError.message);
  }

  console.log('Upserting data to Supabase...');
  const batchSize = 50; // Smaller batches to avoid RLS/timeout issues
  for (let i = 0; i < vehicles.length; i += batchSize) {
    const batch = vehicles.slice(i, i + batchSize);
    const { error } = await supabase.from('vehicle_master').upsert(batch);
    if (error) {
      console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
      // Try one by one if batch fails to find the problematic record
      for (const item of batch) {
        const { error: singleError } = await supabase.from('vehicle_master').upsert(item);
        if (singleError) console.error(`  - Failed on ${item.id}:`, singleError.message);
      }
    } else {
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} uploaded.`);
    }
  }

  console.log('Done!');
}

importNewSizes();
