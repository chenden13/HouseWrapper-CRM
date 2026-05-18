import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function preciseCleanup() {
  console.log('--- 正在執行「精確日期」去重掃除 ---');
  
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*');

  if (error) {
    console.error('讀取失敗:', error.message);
    return;
  }

  const seen = new Map();
  const toDelete = [];

  customers.forEach(c => {
    // 精確標準：姓名 + 電話 + 車牌 + 施工日期
    const date = c.expectedStartDate || c.deliveryDate || '';
    const key = `${String(c.name || '').trim()}_${String(c.phone || '').trim()}_${String(c.plateNumber || '').trim()}_${date}`.toLowerCase();
    
    if (seen.has(key)) {
      toDelete.push(c.id);
    } else {
      seen.set(key, c.id);
    }
  });

  if (toDelete.length === 0) {
    console.log('✅ 檢查完畢：沒有發現完全重複（含日期）的資料。');
    return;
  }

  console.log(`發現 ${toDelete.length} 筆完全重複資料，準備精確刪除...`);

  for (const id of toDelete) {
    const { error: delError } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (delError) {
      console.error(`刪除失敗 [${id}]:`, delError.message);
    } else {
      console.log(`已刪除完全重複項: ${id}`);
    }
  }

  console.log(`--- 精確掃除完成！共清理 ${toDelete.length} 筆資料 ---`);
}

preciseCleanup();
