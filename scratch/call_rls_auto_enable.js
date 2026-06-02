import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://emqtgyntrpounnmssxcf.supabase.co', 
  'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo'
);

async function run() {
  console.log('Calling rls_auto_enable...');
  try {
    const { data, error } = await supabase.rpc('rls_auto_enable');
    if (error) {
      console.error('RPC Error:', error);
    } else {
      console.log('RPC Success. Return value:', data);
    }
  } catch (err) {
    console.error('Execution Error:', err);
  }
}

run();
