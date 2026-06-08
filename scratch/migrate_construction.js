import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env manually since we don't have dotenv
const envPath = path.resolve('.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    // Remove surrounding quotes if any
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.substring(1, value.length - 1);
    }
    if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Fetch customers with status 'construction'
  console.log("Fetching customers with status 'construction'...");
  const { data: customers, error: fetchError } = await supabase
    .from('customers')
    .select('id, name, status')
    .eq('status', 'construction');

  if (fetchError) {
    console.error('Error fetching customers:', fetchError);
    process.exit(1);
  }

  console.log(`Found ${customers.length} customers with status 'construction'.`);

  if (customers.length === 0) {
    console.log('No customers to migrate.');
    return;
  }

  for (const customer of customers) {
    console.log(`Migrating customer "${customer.name}" (ID: ${customer.id}) from 'construction' to 'scheduled'...`);
    const { error: updateError } = await supabase
      .from('customers')
      .update({ status: 'scheduled' })
      .eq('id', customer.id);

    if (updateError) {
      console.error(`Error updating customer ${customer.id}:`, updateError);
    } else {
      console.log(`Successfully migrated "${customer.name}".`);
    }
  }

  console.log('Migration complete.');
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
