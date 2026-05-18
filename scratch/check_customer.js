import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function superSearch() {
  console.log('--- 正在執行地毯式全庫搜尋 ---');
  
  // 1. 搜尋任何姓名包含「黃」或「欽」的人
  const { data: nameResults } = await supabase
    .from('customers')
    .select('id, name, phone, plate_number, status')
    .or('name.ilike.%黃%,name.ilike.%欽%');

  // 2. 搜尋電話包含 918 或 881 的人
  const { data: phoneResults } = await supabase
    .from('customers')
    .select('id, name, phone, plate_number, status')
    .or('phone.ilike.%918%,phone.ilike.%881%');

  const combined = [...(nameResults || []), ...(phoneResults || [])];
  
  // 去重
  const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

  if (unique.length === 0) {
    console.log('❌ 搜尋結果：連單個字都搜尋不到。資料確定不在雲端。');
  } else {
    console.log(`🔍 找到 ${unique.length} 筆可能的相似資料：`);
    unique.forEach(t => {
      console.log(`- [${t.id}] ${t.name} | 電話: ${t.phone} | 車牌: ${t.plate_number} | 狀態: ${t.status}`);
    });
  }
}

superSearch();
