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

const getNextDay = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

const getDaysDiff = (startStr, endStr) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end.getTime() < start.getTime()) return 1;
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const getDatesRange = (startStr, totalDays) => {
  const dates = [];
  const start = new Date(startStr);
  for (let i = 0; i < totalDays; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    dates.push(current.toISOString().split('T')[0]);
  }
  return dates;
};

async function run() {
  const { data: allData, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('getCustomers error:', error);
    return;
  }

  const customers = allData.map(item => {
    const extraData = (typeof item.data === 'object' && item.data !== null) ? item.data : {};
    return {
      ...extraData,
      id: item.id,
      name: item.name,
      phone: item.phone,
      plateNumber: item.plate_number,
      brand: item.brand,
      model: item.model,
      status: item.status,
      totalAmount: item.total_amount,
      cost: item.cost,
      revenue: item.revenue,
      updatedAt: item.updated_at
    };
  });

  const activeCustomers = customers.filter(c => {
    if (c.id.startsWith('EVENT-')) return true;
    return ['deposit', 'scheduled', 'construction'].includes(c.status);
  });

  console.log(`總客戶數: ${customers.length}, 活躍客戶數: ${activeCustomers.length}`);

  activeCustomers.forEach(customer => {
    const model = customer.model || '未定車型';
    const filmColor = customer.filmColor || '未定色膜';
    const ownerName = customer.name || '無名車主';
    const isCustom = customer.id.startsWith('EVENT-');

    const eventsToSend = [];

    if (isCustom) {
      if (customer.expectedStartDate) {
        eventsToSend.push({
          title: `${ownerName}-局部施工`,
          startDate: customer.expectedStartDate,
          endDate: getNextDay(customer.expectedStartDate)
        });
      }
    } else {
      if (customer.expectedStartDate) {
        eventsToSend.push({
          title: `${ownerName}-${model}-${filmColor}-今日留車`,
          startDate: customer.expectedStartDate,
          endDate: getNextDay(customer.expectedStartDate)
        });
      }

      const delDate = customer.expectedEndDate || customer.deliveryDate;
      if (delDate) {
        eventsToSend.push({
          title: `${ownerName}-${model}-${filmColor}-今日交車`,
          startDate: delDate,
          endDate: getNextDay(delDate)
        });
      }

      if (customer.constructionStartDate) {
        const totalDays = getDaysDiff(customer.constructionStartDate, customer.constructionEndDate || customer.constructionStartDate);
        if (totalDays >= 3) {
          const dates = getDatesRange(customer.constructionStartDate, totalDays);
          dates.forEach((date, index) => {
            eventsToSend.push({
              title: `${ownerName}-${model}-${filmColor}-施工進度 (${index + 1}/${totalDays})`,
              startDate: date,
              endDate: getNextDay(date)
            });
          });
        } else {
          const start = customer.constructionStartDate;
          const end = getNextDay(customer.constructionEndDate || customer.constructionStartDate);
          const isSpanningTwoDays = customer.constructionStartDate && 
                                    customer.constructionEndDate && 
                                    customer.constructionStartDate !== customer.constructionEndDate;
          eventsToSend.push({
            title: `${ownerName}-${model}-${filmColor}-今天要完成${isSpanningTwoDays ? '半台' : '全台'}`,
            startDate: start,
            endDate: end
          });
        }
      }
    }

    // Print details if name matches targets
    if (['胡仲廷', '陳紹鵬', '陳致宇', '黃偉哲'].some(name => customer.name.includes(name))) {
      console.log(`\n客戶: ${customer.name} (Status: ${customer.status}, ID: ${customer.id})`);
      console.log('原始日期欄位:');
      console.log(`- expectedStartDate: ${customer.expectedStartDate}`);
      console.log(`- expectedEndDate: ${customer.expectedEndDate}`);
      console.log(`- constructionStartDate: ${customer.constructionStartDate}`);
      console.log(`- constructionEndDate: ${customer.constructionEndDate}`);
      console.log(`- deliveryDate: ${customer.deliveryDate}`);
      console.log('生成的 Google Calendar 事件:');
      console.log(JSON.stringify(eventsToSend, null, 2));
    }
  });
}

run();
