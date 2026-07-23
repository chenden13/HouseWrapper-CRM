import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

let supabaseUrl = '';
let supabaseKey = '';
try {
  const envContent = fs.readFileSync(path.join(cwd, '.env'), 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('VITE_SUPABASE_URL=')[1].trim();
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.split('VITE_SUPABASE_ANON_KEY=')[1].trim();
    }
  });
} catch (err) {
  console.error('讀取 .env 失敗:', err);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 呂仕捷的原始資料 (備份檔 ID 541 中的資料)
const originalCustomer = {
  name: "呂仕捷",
  phone: "0919977566",
  plate_number: "",
  brand: "TESLA",
  model: "model y",
  status: "construction",
  total_amount: 63000,
  cost: 0,
  revenue: 63000,
  data: {
    notes: "",
    filmColor: "電光金屬鈦灰",
    inCalendar: true,
    mainService: "全車改色膜",
    vehicleSize: "S",
    hoodPpfPrice: 0,
    detailingSize: "S",
    discountAmount: 0,
    inWashSchedule: true,
    expectedEndDate: "2026-06-12",
    materialOrdered: true,
    electricModPrice: 0,
    mainServiceBrand: "AX",
    rearCoatingPrice: 0,
    customAccessories: [],
    expectedStartDate: "2026-06-06",
    mainServiceSeries: "V系列",
    digitalMirrorPrice: 0,
    appliedDiscountName: "",
    constructionEndDate: "2026-06-11",
    constructionChecklist: [
      {
        id: "ck_std_1",
        name: "前置清潔 (預洗與表面深層清潔)",
        checked: false
      },
      {
        id: "ck_std_2",
        name: "膜料施工: 全車改色膜 (AX - 電光金屬鈦灰)",
        checked: false
      },
      {
        id: "ck_std_3",
        name: "贈送配件施工",
        checked: false
      },
      {
        id: "ck_std_4",
        name: "完工自主檢查 (收邊、氣泡、完整度)",
        checked: false
      },
      {
        id: "ck_std_5",
        name: "交車前清潔與環境整理",
        checked: false
      }
    ],
    constructionStartDate: "2026-06-10",
    inConstructionSchedule: true
  }
};

async function restore() {
  console.log('正在取得目前資料庫中最大的數值型 ID...');
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('讀取失敗:', error);
      return;
    }
    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += pageSize;
    } else {
      hasMore = false;
    }
    if (data && data.length < pageSize) {
      hasMore = false;
    }
  }

  let maxNum = 522;
  allData.forEach(c => {
    if (c.id) {
      const match = String(c.id).trim().match(/^(?:C-)?(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum && num < 100000) {
          maxNum = num;
        }
      }
    }
  });

  const targetId = String(maxNum + 1);
  console.log(`目前最大 ID: ${maxNum}，將使用新 ID: ${targetId} 來復原呂仕捷的資料。`);

  const payload = {
    id: targetId,
    ...originalCustomer
  };

  const { data: insertData, error: insertError } = await supabase
    .from('customers')
    .upsert(payload)
    .select();

  if (insertError) {
    console.error('復原失敗:', insertError);
  } else {
    console.log('成功復原呂仕捷的資料！寫入內容如下:');
    console.log(JSON.stringify(insertData, null, 2));
  }
}

restore();
