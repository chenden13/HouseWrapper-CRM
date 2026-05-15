
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
  const { data: customers, error } = await supabase.from('customers').select('id, name, phone, plate_number');
  if (error) {
    console.error('Error fetching customers:', error);
    return;
  }

  const phoneMap = new Map();
  const duplicates = [];

  customers.forEach(c => {
    if (!c.phone) return;
    if (phoneMap.has(c.phone)) {
      const original = phoneMap.get(c.phone);
      duplicates.push({ phone: c.phone, original, duplicate: c });
    } else {
      phoneMap.set(c.phone, c);
    }
  });

  if (duplicates.length === 0) {
    console.log('No duplicates found by phone number.');
  } else {
    console.log('Found potential duplicates:');
    duplicates.forEach(d => {
      console.log(`Phone: ${d.phone}`);
      console.log(`  - ${d.original.id} (${d.original.name})`);
      console.log(`  - ${d.duplicate.id} (${d.duplicate.name})`);
    });
  }
}

checkDuplicates();
