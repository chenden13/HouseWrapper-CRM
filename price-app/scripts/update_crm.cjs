const fs = require('fs');
const path = require('path');

const pendingEditPath = 'C:/car-shop-projects/car-shop-crm/src/components/PendingEditForm.tsx';
let pendingContent = fs.readFileSync(pendingEditPath, 'utf8');

// 1. PPF_PRICING and PPF_ACTIVE_SERIES in PendingEditForm.tsx
const oldPpfDef = `const PPF_PRICING: Record<string, Record<string, number>> = {
  'AX': {
    '亮面': 90000,
    '消光': 100000
  },
  'Pixel8bot': {
    '亮面': 100000,
    '消光': 110000
  },
  '3M': {
    '100g (亮面)': 110000,
    '150g (亮面)': 125000,
    '200g (亮面)': 135000,
    '200m (消光)': 145000
  },
  'Stek': {
    'Lite (亮面)': 130000,
    'Matte (消光)': 140000
  }
};`;

const newPpfDef = `const PPF_PRICING: Record<string, Record<string, number>> = {
  'AX': {
    'K系列 (亮面)': 90000,
    'X系列 (亮面)': 100000,
    'M系列 (消光)': 100000,
    // 完整保留舊規格與簡寫相容性
    '亮面': 90000,
    '消光': 100000,
    'K系列': 90000,
    'X系列': 100000,
    'M系列': 100000,
  },
  'Pixel8bit': {
    '亮面 (7.5mil)': 100000,
    '消光 (8.5mil)': 110000,
    '亮面': 100000,
    '消光': 110000,
  },
  'Pixel8bot': {
    '亮面 (7.5mil)': 100000,
    '消光 (8.5mil)': 110000,
    '亮面': 100000,
    '消光': 110000,
  },
  '3M': {
    '150g (亮面)': 125000,
    '200g (亮面)': 135000,
    '200m (消光)': 145000,
    // 完整保留舊規格相容性
    '100g (亮面)': 110000,
    '150g': 125000,
    '200g': 135000,
    '200m': 145000,
  },
  'Stek': {
    'C clear (亮面)': 110000,
    'DYNO PURE+ (亮面)': 140000,
    'C matte (消光)': 120000,
    'Dyno matte (消光)': 150000,
    // 原本 stek 亮面即新版 dyno pure+ $140,000，消光即新版 dyno matte $150,000，完整保留相容性
    'Lite (亮面)': 140000,
    'Matte (消光)': 150000,
    '亮面': 140000,
    '消光': 150000,
    'C clear': 110000,
    'DYNO PURE+': 140000,
    'C matte': 120000,
    'Dyno matte': 150000,
  }
};

// 犀牛皮規格選項（下拉選單主要顯示的新規格列表）
const PPF_ACTIVE_SERIES: Record<string, string[]> = {
  'AX': ['K系列 (亮面)', 'X系列 (亮面)', 'M系列 (消光)'],
  'Pixel8bit': ['亮面 (7.5mil)', '消光 (8.5mil)'],
  'Pixel8bot': ['亮面 (7.5mil)', '消光 (8.5mil)'],
  '3M': ['150g (亮面)', '200g (亮面)', '200m (消光)'],
  'Stek': ['C clear (亮面)', 'DYNO PURE+ (亮面)', 'C matte (消光)', 'Dyno matte (消光)']
};`;

if (pendingContent.includes(oldPpfDef)) {
  pendingContent = pendingContent.replace(oldPpfDef, newPpfDef);
  console.log('Replaced PPF_PRICING definition in PendingEditForm.tsx');
} else {
  console.log('Warning: oldPpfDef not found directly, checking normalized line endings...');
  const normalize = (str) => str.replace(/\r\n/g, '\n');
  pendingContent = normalize(pendingContent).replace(normalize(oldPpfDef), normalize(newPpfDef));
}

// 2. Brand dropdown in PendingEditForm.tsx
const oldBrand = `                  : (formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮')
                    ? ['AX', 'Pixel8bot', '3M', 'Stek']`;
const newBrand = `                  : (formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮')
                    ? (formData.mainServiceBrand === 'Pixel8bot' ? ['AX', 'Pixel8bit', 'Pixel8bot', '3M', 'Stek'] : ['AX', 'Pixel8bit', '3M', 'Stek'])`;

const norm = (s) => s.replace(/\r\n/g, '\n');
if (norm(pendingContent).includes(norm(oldBrand))) {
  pendingContent = norm(pendingContent).replace(norm(oldBrand), norm(newBrand));
  console.log('Replaced brand dropdown in PendingEditForm.tsx');
}

// 3. Series dropdown in PendingEditForm.tsx
const oldSeries = `          {(formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮') && formData.mainServiceBrand && (
            <div className="form-group col-span-2">
              <label className="form-label" style={{ color: '#059669', fontWeight: 'bold' }}>規格/系列</label>
              <select name="mainServiceSeries" className="form-control" value={formData.mainServiceSeries || ''} onChange={handleChange} style={{ borderColor: '#10b981', background: '#f0fdf4' }}>
                <option value="">選擇規格</option>
                {Object.keys(PPF_PRICING[formData.mainServiceBrand] || {}).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}`;

const newSeries = `          {(formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮') && formData.mainServiceBrand && (
            <div className="form-group col-span-2">
              <label className="form-label" style={{ color: '#059669', fontWeight: 'bold' }}>規格/系列</label>
              <select name="mainServiceSeries" className="form-control" value={formData.mainServiceSeries || ''} onChange={handleChange} style={{ borderColor: '#10b981', background: '#f0fdf4' }}>
                <option value="">選擇規格</option>
                {(() => {
                  const brand = formData.mainServiceBrand;
                  const active = PPF_ACTIVE_SERIES[brand] || Object.keys(PPF_PRICING[brand] || {});
                  const current = formData.mainServiceSeries;
                  const options = current && !active.includes(current) ? [current, ...active] : active;
                  return options.map(s => <option key={s} value={s}>{s}</option>);
                })()}
              </select>
            </div>
          )}`;

if (norm(pendingContent).includes(norm(oldSeries))) {
  pendingContent = norm(pendingContent).replace(norm(oldSeries), norm(newSeries));
  console.log('Replaced series dropdown in PendingEditForm.tsx');
}

fs.writeFileSync(pendingEditPath, pendingContent, 'utf8');
console.log('Successfully written PendingEditForm.tsx');

// ========================
// 4. Update PriceInquiryPage.tsx in car-shop-crm
// ========================
const priceInquiryPath = 'C:/car-shop-projects/car-shop-crm/src/components/PriceInquiryPage.tsx';
let inquiryContent = fs.readFileSync(priceInquiryPath, 'utf8');

const oldInquiryPpf = `const PPF_PRICING: Record<string, Record<string, number>> = {
  '亮面犀牛皮': {
    'AX (亮面)': 90000,
    'Pixel8bot (亮面)': 100000,
    '3M 100g (亮面)': 110000,
    '3M 150g (亮面)': 125000,
    '3M 200g (亮面)': 135000,
    'Stek Lite (亮面)': 130000
  },
  '消光犀牛皮': {
    'AX (消光)': 100000,
    'Pixel8bot (消光)': 110000,
    '3M 200m (消光)': 145000,
    'Stek Matte (消光)': 140000
  }
};`;

const newInquiryPpf = `const PPF_PRICING: Record<string, Record<string, number>> = {
  '亮面犀牛皮': {
    'AX K系列 (亮面 7.5mil)': 90000,
    'AX X系列 (亮面 8.5mil)': 100000,
    'Stek C clear (亮面 7.5mil)': 110000,
    '3M 150g (亮面 7.5mil)': 125000,
    '3M 200g (亮面 7.9mil)': 135000,
    'Stek DYNO PURE+ (亮面 8mil)': 140000
  },
  '消光犀牛皮': {
    'AX M系列 (消光 8.5mil)': 100000,
    'Stek C matte (消光 7.5mil)': 120000,
    '3M 200m (消光 7.9mil)': 145000,
    'Stek Dyno matte (消光 8mil)': 150000
  }
};`;

if (norm(inquiryContent).includes(norm(oldInquiryPpf))) {
  inquiryContent = norm(inquiryContent).replace(norm(oldInquiryPpf), norm(newInquiryPpf));
  fs.writeFileSync(priceInquiryPath, inquiryContent, 'utf8');
  console.log('Successfully written PriceInquiryPage.tsx');
} else {
  console.log('Warning: oldInquiryPpf not found!');
}

console.log('All CRM updates completed successfully!');
