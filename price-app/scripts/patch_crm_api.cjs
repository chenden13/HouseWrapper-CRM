const fs = require('fs');
const apiPath = 'C:/car-shop-projects/car-shop-crm/src/lib/api.ts';
let content = fs.readFileSync(apiPath, 'utf8');

const helper = `
export const normalizePpfSpec = (brand?: string, series?: string, color?: string, mainService?: string) => {
  let newBrand = brand || '';
  let newSeries = series || '';
  let newColor = color || '';

  if (newBrand === 'Pixel8bot') newBrand = 'Pixel8bit';

  const isPpf = !mainService || mainService.includes('犀牛皮');

  if (isPpf) {
    if (newBrand === 'Stek') {
      const cleanSeries = newSeries.replace(/^Stek\\s+/i, '');
      if (['Lite (亮面)', 'Lite', '亮面', 'DYNO PURE+'].includes(cleanSeries)) {
        newSeries = 'DYNO PURE+ (亮面)';
      } else if (['Matte (消光)', 'Matte', '消光', 'Dyno matte'].includes(cleanSeries)) {
        newSeries = 'Dyno matte (消光)';
      } else if (cleanSeries === 'C clear') {
        newSeries = 'C clear (亮面)';
      } else if (cleanSeries === 'C matte') {
        newSeries = 'C matte (消光)';
      }

      const cleanColor = newColor.replace(/^Stek\\s+/i, '');
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
};
`;

const targetGetCustomers = `    return (allData || []).map(item => {
      const extraData = (typeof item.data === 'object' && item.data !== null) ? item.data : {};
      return {
        ...extraData,
        id: item.id,
        name: item.name,`;

const replacementGetCustomers = `    return (allData || []).map(item => {
      const extraData = (typeof item.data === 'object' && item.data !== null) ? item.data : {};
      const norm = normalizePpfSpec(
        extraData.mainServiceBrand,
        extraData.mainServiceSeries,
        extraData.filmColor,
        extraData.mainService
      );
      return {
        ...extraData,
        mainServiceBrand: norm.brand,
        mainServiceSeries: norm.series,
        filmColor: norm.color,
        id: item.id,
        name: item.name,`;

const normStr = s => s.replace(/\r\n/g, '\n');
if (!normStr(content).includes('normalizePpfSpec')) {
  content = normStr(content).replace('export const api = {', helper + '\nexport const api = {');
}

if (normStr(content).includes(normStr(targetGetCustomers))) {
  content = normStr(content).replace(normStr(targetGetCustomers), normStr(replacementGetCustomers));
  console.log('Successfully updated getCustomers in api.ts');
} else {
  console.log('Warning: targetGetCustomers not found!');
}

fs.writeFileSync(apiPath, content, 'utf8');
console.log('Wrote updated api.ts');
