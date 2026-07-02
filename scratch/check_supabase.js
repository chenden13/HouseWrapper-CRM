import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
      value = value.replace(/(^"|"$)/g, '');
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Connecting to Supabase:", supabaseUrl);
  
  // Search by name
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or('name.ilike.%江大瑋%,name.ilike.%于善豪%');

  if (error) {
    console.error("Error querying customers:", error);
    return;
  }

  console.log("Results found in DB:", data.length);
  console.log(JSON.stringify(data, null, 2));

  // Let's also check if there are customers with status 'construction' or similar
  const { data: constructionData, error: constructionErr } = await supabase
    .from('customers')
    .select('id, name, status');

  if (constructionErr) {
    console.error("Error checking construction status:", constructionErr);
  } else {
    // Group by status
    const countByStatus = {};
    constructionData.forEach(c => {
      countByStatus[c.status] = (countByStatus[c.status] || 0) + 1;
    });
    console.log("Customer counts by status:", countByStatus);
    
    // Find customers in status 'construction' or similar
    const constructionList = constructionData.filter(c => c.status === 'construction' || c.status === '施工中');
    console.log("Customers with 'construction' or '施工中' status in DB:", constructionList);
  }
}

main().catch(console.error);
