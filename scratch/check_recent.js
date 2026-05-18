import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecent() {
  console.log('--- 正在檢查資料庫最近更新的 10 筆資料 ---');
  
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, updated_at, status')
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('查詢失敗:', error);
    return;
  }

  data.forEach((c, idx) => {
    console.log(`${idx + 1}. [${c.id}] ${c.name} | 狀態: ${c.status} | 更新時間: ${c.updated_at}`);
  });
}

checkRecent();
