const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function exportVehicleMaster() {
  console.log('Fetching vehicle master from Supabase...');
  const { data, error } = await supabase.from('vehicle_master').select('*');
  
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  console.log(`Fetched ${data.length} records.`);
  fs.writeFileSync('vehicle_master_export.json', JSON.stringify(data, null, 2));
  
  // Also create a markdown table
  let md = '# 車型尺寸對照表\n\n| 廠牌 | 車型 | 尺寸 |\n| --- | --- | --- |\n';
  data.sort((a, b) => a.brand.localeCompare(b.brand)).forEach(v => {
    md += `| ${v.brand} | ${v.model} | ${v.size} |\n`;
  });
  
  fs.writeFileSync('vehicle_mapping.md', md);
  console.log('Exported to vehicle_mapping.md and vehicle_master_export.json');
}

exportVehicleMaster();
