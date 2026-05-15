const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function exportToExcel() {
  console.log('Fetching vehicle master from Supabase...');
  const { data, error } = await supabase.from('vehicle_master').select('*');
  
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  console.log(`Fetched ${data.length} records. Preparing Excel file...`);
  
  // Prepare data for Excel
  const excelData = data.sort((a, b) => a.brand.localeCompare(b.brand)).map(v => ({
    '廠牌': v.brand,
    '車型': v.model,
    '尺寸': v.size
  }));
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(workbook, worksheet, '車型對照表');
  
  const fileName = 'vehicle_mapping_export.xlsx';
  XLSX.writeFile(workbook, fileName);
  
  console.log(`✅ Success! Exported to ${fileName}`);
}

exportToExcel();
