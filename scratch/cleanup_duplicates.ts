
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDuplicates() {
  const { data: customers, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('Error fetching customers:', error);
    return;
  }

  const phoneMap = new Map();
  const toDelete = [];

  customers.forEach(c => {
    if (!c.phone) return;
    if (phoneMap.has(c.phone)) {
      const existing = phoneMap.get(c.phone);
      // Logic: if one ID starts with 'C-' or '無編號' or 'C00' and the other is numeric,
      // the numeric one is likely the manual update.
      const isExistingTemp = existing.id.startsWith('C-') || existing.id.startsWith('無編號') || existing.id.startsWith('C00');
      const isNewTemp = c.id.startsWith('C-') || c.id.startsWith('無編號') || c.id.startsWith('C00');

      if (isExistingTemp && !isNewTemp) {
        toDelete.push(existing.id);
        phoneMap.set(c.phone, c);
      } else if (!isExistingTemp && isNewTemp) {
        toDelete.push(c.id);
      } else {
        // Both are same type, keep the one with more data or newer?
        // For now, let's just mark for manual review or pick one.
        console.log(`Ambiguous duplicate for ${c.phone}: ${existing.id} vs ${c.id}`);
      }
    } else {
      phoneMap.set(c.phone, c);
    }
  });

  console.log('To delete:', toDelete);
  
  if (toDelete.length > 0) {
    const { error: delError } = await supabase.from('customers').delete().in('id', toDelete);
    if (delError) console.error('Delete error:', delError);
    else console.log('Successfully deleted duplicates.');
  }
}

analyzeDuplicates();
