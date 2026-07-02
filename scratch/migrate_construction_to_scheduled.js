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
  console.log("Connecting to Supabase to migrate 'construction' status...");
  
  // Find customers with 'construction' status
  const { data: currentConstruction, error: findError } = await supabase
    .from('customers')
    .select('id, name, status')
    .eq('status', 'construction');

  if (findError) {
    console.error("Error fetching construction customers:", findError);
    return;
  }

  console.log("Found construction cases to migrate:", currentConstruction);

  if (currentConstruction.length === 0) {
    console.log("No cases found with status 'construction'. Nothing to migrate.");
    return;
  }

  const idsToUpdate = currentConstruction.map(c => c.id);

  // Update status to 'scheduled'
  const { data: updateData, error: updateError } = await supabase
    .from('customers')
    .update({ status: 'scheduled' })
    .in('id', idsToUpdate)
    .select();

  if (updateError) {
    console.error("Error migrating status to scheduled:", updateError);
    return;
  }

  console.log("Successfully migrated status to 'scheduled' for:", updateData.map(c => ({ id: c.id, name: c.name, status: c.status })));
}

main().catch(console.error);
