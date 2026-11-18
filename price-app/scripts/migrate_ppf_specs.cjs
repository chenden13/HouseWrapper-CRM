const fs = require('fs');
const dotenv = fs.readFileSync('C:/car-shop-projects/car-shop-crm/.env', 'utf8');
const env = {};
dotenv.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k) env[k] = v.join('=').trim();
});

const { createClient } = require('C:/car-shop-projects/car-shop-crm/node_modules/@supabase/supabase-js');
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

function normalizePpfSpec(brand, series, color, mainService) {
  let newBrand = brand || '';
  let newSeries = series || '';
  let newColor = color || '';

  if (newBrand === 'Pixel8bot') newBrand = 'Pixel8bit';

  const isPpf = !mainService || mainService.includes('犀牛皮');

  if (isPpf) {
    if (newBrand === 'Stek') {
      const cleanSeries = newSeries.replace(/^Stek\s+/i, '');
      if (['Lite (亮面)', 'Lite', '亮面', 'DYNO PURE+'].includes(cleanSeries)) {
        newSeries = 'DYNO PURE+ (亮面)';
      } else if (['Matte (消光)', 'Matte', '消光', 'Dyno matte'].includes(cleanSeries)) {
        newSeries = 'Dyno matte (消光)';
      } else if (cleanSeries === 'C clear') {
        newSeries = 'C clear (亮面)';
      } else if (cleanSeries === 'C matte') {
        newSeries = 'C matte (消光)';
      }

      const cleanColor = newColor.replace(/^Stek\s+/i, '');
      if (['Lite (亮面)', 'Lite', '亮面', 'DYNO PURE+'].includes(cleanColor)) {
        newColor = 'DYNO PURE+ (亮面)';
      } else if (['Matte (消光)', 'Matte', '消光', 'Dyno matte'].includes(cleanColor)) {
        newColor = 'Dyno matte (消光)';
      } else if (cleanColor === 'C clear') {
        newColor = 'C clear (亮面)';
      } else if (cleanColor === 'C matte') {
        newColor = 'C matte (消光)';
      }
    } else if (newBrand === 'AX') {
      if (['亮面', 'K系列'].includes(newSeries)) {
        newSeries = 'K系列 (亮面)';
      } else if (['消光', 'M系列'].includes(newSeries)) {
        newSeries = 'M系列 (消光)';
      } else if (newSeries === 'X系列') {
        newSeries = 'X系列 (亮面)';
      }

      if (['亮面', 'K系列'].includes(newColor)) {
        newColor = 'K系列 (亮面)';
      } else if (['消光', 'M系列'].includes(newColor)) {
        newColor = 'M系列 (消光)';
      } else if (newColor === 'X系列') {
        newColor = 'X系列 (亮面)';
      }
    } else if (newBrand === 'Pixel8bit') {
      if (newSeries === '亮面') newSeries = '亮面 (7.5mil)';
      else if (newSeries === '消光') newSeries = '消光 (8.5mil)';

      if (newColor === '亮面') newColor = '亮面 (7.5mil)';
      else if (newColor === '消光') newColor = '消光 (8.5mil)';
    }
  }

  return { brand: newBrand, series: newSeries, color: newColor };
}

async function migrate() {
  console.log('Fetching all customers from Supabase...');
  let all = [];
  let from = 0;
  let pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from('customers').select('*').range(from, from + pageSize - 1);
    if (error) { console.error(error); return; }
    all = all.concat(data);
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  console.log('Total customers in database:', all.length);

  const updates = [];
  for (const c of all) {
    const extra = c.data || {};
    const origBrand = extra.mainServiceBrand || '';
    const origSeries = extra.mainServiceSeries || '';
    const origColor = extra.filmColor || '';
    const mainService = extra.mainService || '';

    const { brand, series, color } = normalizePpfSpec(origBrand, origSeries, origColor, mainService);

    if (brand !== origBrand || series !== origSeries || color !== origColor) {
      const updatedData = {
        ...extra,
        mainServiceBrand: brand,
        mainServiceSeries: series,
        filmColor: color
      };
      updates.push({
        id: c.id,
        name: c.name,
        old: { brand: origBrand, series: origSeries, color: origColor },
        new: { brand, series, color },
        updatedData
      });
    }
  }

  console.log(`Found ${updates.length} customers to update in database.`);
  for (const u of updates) {
    console.log(`- [${u.id}] ${u.name}: Brand: "${u.old.brand}" -> "${u.new.brand}", Series: "${u.old.series}" -> "${u.new.series}", Color: "${u.old.color}" -> "${u.new.color}"`);
  }

  // Execute update
  console.log('\nApplying updates to Supabase...');
  let successCount = 0;
  for (const u of updates) {
    const { error } = await supabase
      .from('customers')
      .update({ data: u.updatedData })
      .eq('id', u.id);

    if (error) {
      console.error(`Failed to update customer ${u.id} (${u.name}):`, error);
    } else {
      successCount++;
    }
  }

  console.log(`\nMigration completed! Successfully updated ${successCount}/${updates.length} customer records.`);
}

migrate();
