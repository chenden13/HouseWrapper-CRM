import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
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

async function run() {
  const filePath = 'C:/Users/chend/Downloads/HouseWrapper_正式匯入範本.xlsx';
  if (!fs.existsSync(filePath)) {
    console.error(`檔案不存在: ${filePath}`);
    return;
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws);

  // 尋找黃重欽
  const targetRow = data.find((row) => String(row['姓名'] || '').trim() === '黃重欽');
  if (!targetRow) {
    console.error('未在 Excel 中找到「黃重欽」的資料！');
    return;
  }

  console.log('在 Excel 中找到原始資料行:', targetRow);

  // 進行與 ExcelImport.tsx 完全相同的映射與轉換
  const isChecked = (val) => {
    const s = String(val || '').trim().toUpperCase();
    return s === 'O' || s === 'TRUE' || s === '是' || s === '1';
  };

  const parseDate = (val) => {
    if (!val) return '';
    if (typeof val === 'number') {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }
    let s = String(val).replace(/\//g, '-').trim();
    if (s.includes(' ')) s = s.split(' ')[0];
    return s;
  };

  // 設定編號為 10056
  const customerObj = {
    id: '10056', // 將編號設定為 10056
    name: String(targetRow['姓名'] || targetRow['客戶姓名'] || ''),
    phone: String(targetRow['電話'] || ''),
    plate_number: String(targetRow['車牌'] || ''),
    brand: targetRow['品牌'] ? String(targetRow['品牌']) : null, // 資料表是 brand, model
    model: String(targetRow['車種'] || targetRow['車型'] || ''),
    status: 'completed',
    
    total_amount: Number(targetRow['金額']) || 0,
    cost: Number(targetRow['成本']) || 0,
    revenue: Number(targetRow['收益']) || (Number(targetRow['金額']) || 0) - (Number(targetRow['成本']) || 0),
    
    data: {
      notes: String(targetRow['備註'] || ''),
      filmColor: String(targetRow['膜料細項'] || targetRow['膜料顏色'] || ''),
      mainService: String(targetRow['施工項目'] || targetRow['主施工項目'] || ''),
      mainServiceBrand: String(targetRow['品牌'] || targetRow['膜料品牌'] || ''),
      
      materialOrdered: isChecked(targetRow['是否叫貨']),
      quoteCreated: isChecked(targetRow['是否建立報價單']),
      giftGiven: isChecked(targetRow['大禮包發送'] || targetRow['大禮包交付']),
      formSent: isChecked(targetRow['表單發送'] || targetRow['表單+注意事項']),
      followUp2Weeks: isChecked(targetRow['兩周關心'] || targetRow['2周追蹤']),
      inCalendar: isChecked(targetRow['是否加入行事曆']),
      photosSent: isChecked(targetRow['照片是否傳送'] || targetRow['完工照發送']),
      
      expectedStartDate: parseDate(targetRow['施工時間']),
      expectedEndDate: parseDate(targetRow['預計施工時間']),
      deliveryDate: parseDate(targetRow['預計交車時間'] || targetRow['交車時間']),
      checkupDate: parseDate(targetRow['健檢時間']),
      
      posId: String(targetRow['POS系統編號'] || ''),
    }
  };

  console.log('準備寫入資料庫的 customerObj:', customerObj);

  // 寫入 Supabase
  const { data: resData, error: resError } = await supabase
    .from('customers')
    .insert(customerObj)
    .select();

  if (resError) {
    console.error('寫入 Supabase 失敗:', resError);
  } else {
    console.log('成功寫入資料庫，回傳資料:', resData);
  }
}

run();
