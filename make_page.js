const fs = require('fs');

fs.mkdirSync('src/components', { recursive: true });

const code1 = import React, { useState, useMemo } from 'react';
import { 
  Calculator, Calendar, Search, Plus, Download, CheckCircle2, Clock, AlertCircle, Building2, Layers, X, TrendingUp
} from 'lucide-react';

export interface SettlementRecord {
  id: string; month: string; date: string; customerName: string; licensePlate: string; vehicleModel: string;
  category: '隔熱紙' | '配件' | '電改' | '電子後視鏡'; brand: string; itemTitle: string; depthSpec: string;
  vendorName: string; vendorCost: number; customerPrice: number; status: 'pending' | 'settled' | 'reviewing'; notes?: string;
}
;
fs.writeFileSync('src/components/AccessorySettlementPage.tsx', code1, 'utf8');


const code2 = 
const INITIAL_RECORDS: SettlementRecord[] = [
  { id: 'SET-202608-001', month: '2026-08', date: '2026-08-28', customerName: '陳先生', licensePlate: 'BJA-8899', vehicleModel: 'Tesla Model Y', category: '隔熱紙', brand: '3M', itemTitle: '全車極透+極黑尊爵隔熱紙方案', depthSpec: '前擋 極透 MA70 + 車身 極黑 MB20 + 天窗 冰鑽 KT8 (滿版滿貼工法 Lv.3)', vendorName: '極光專業隔熱紙門市', vendorCost: 18500, customerPrice: 30500, status: 'pending', notes: '含天窗與無邊框玻璃滿版貼膜工資' },
  { id: 'SET-202608-002', month: '2026-08', date: '2026-08-26', customerName: '林小姐', licensePlate: 'EAE-1688', vehicleModel: 'Tesla Model 3 Highland', category: '電子後視鏡', brand: '快譯通', itemTitle: '快譯通 S95B 4K星光夜視電子後視鏡', depthSpec: '車外鏡頭防水安裝 + 專用降壓線隱藏走線 + 後保桿專用鏡頭座', vendorName: '快譯通/大邁電改工程部', vendorCost: 8800, customerPrice: 14000, status: 'pending', notes: '煥新版 Model 3 特殊後保桿走線工法' },
  { id: 'SET-202608-003', month: '2026-08', date: '2026-08-24', customerName: '張董事長', licensePlate: 'RCA-7777', vehicleModel: 'Porsche Macan EV', category: '配件', brand: 'STEK / AX Wrap', itemTitle: '全車鍍鉻件亮黑化包覆與水箱護罩黑化', depthSpec: '全車側窗框黑化 (AX高光黑) + 前氣壩黑化 + 尾標燻黑 (高抗刮深度黑化Lv.2)', vendorName: '好室精品配件工坊', vendorCost: 7500, customerPrice: 15000, status: 'settled', notes: '包含原廠拆裝配件工資' },
  { id: 'SET-202608-004', month: '2026-08', date: '2026-08-20', customerName: '黃醫師', licensePlate: 'BMV-9988', vehicleModel: 'BMW i4 M50', category: '電改', brand: '星空燈光 (StarAmbient)', itemTitle: '64色環艙幻彩氛圍燈與四門雙層光導', depthSpec: '全車18燈頭 + 四門中控隱藏式光線條 + 專用 App 獨立控光控制模組', vendorName: '星馳汽車電子工程', vendorCost: 12000, customerPrice: 22000, status: 'pending', notes: '原廠保固專用不破線協議盒' },
  { id: 'SET-202608-005', month: '2026-08', date: '2026-08-18', customerName: '許先生', licensePlate: 'BNN-5200', vehicleModel: 'Mercedes-Benz EQE SUV', category: '隔熱紙', brand: 'FSK 冰鑽', itemTitle: 'FSK 冰鑽 KT 全車旗艦頂級隔熱紙', depthSpec: '前擋 KT68 (高透光高隔熱) + 車身 KT15 (高隱密奈米陶瓷) (滿貼施工)', vendorName: 'FSK 授權加盟施工旗艦店', vendorCost: 23000, customerPrice: 37500, status: 'settled', notes: '廠商附送原廠6年電子保固卡' },
  { id: 'SET-202608-006', month: '2026-08', date: '2026-08-15', customerName: '郭經理', licensePlate: 'ATP-3366', vehicleModel: 'Lexus RX500h', category: '電子後視鏡', brand: '大邁 (DAMAI)', itemTitle: '大邁 M996 2K前後雙錄串流電子後視鏡', depthSpec: '車外防水鏡頭 + 車內靜電貼 + 保險絲盒專用不斷電供電線', vendorName: '快譯通/大邁電改工程部', vendorCost: 7500, customerPrice: 12800, status: 'reviewing', notes: '等待廠商發票對帳' },
  { id: 'SET-202608-007', month: '2026-08', date: '2026-08-10', customerName: '蔡小姐', licensePlate: 'BPQ-6688', vehicleModel: 'Tesla Model Y', category: '電改', brand: '邁斯 (MAIS)', itemTitle: '前備箱電動開合與腳踢感應升級', depthSpec: '雙桿靜音電吸馬達 + 防水感應雷達 + 車內大螢幕控制連動', vendorName: '星馳汽車電子工程', vendorCost: 9500, customerPrice: 16800, status: 'settled', notes: '已含專用模組測試費用' },
  { id: 'SET-202607-001', month: '2026-07', date: '2026-07-29', customerName: '鄭先生', licensePlate: 'AFG-1122', vehicleModel: 'Audi Q8 e-tron', category: '隔熱紙', brand: '桑馬克 (SunMark)', itemTitle: '桑馬克 Smart + XC MAX 尊榮隔熱紙', depthSpec: '前擋 Smart 70 (智慧光控) + 車身 XC 20 (防爆陶瓷)', vendorName: '極光專業隔熱紙門市', vendorCost: 19000, customerPrice: 32500, status: 'settled', notes: '7月份廠商款項已完成電匯' },
  { id: 'SET-202607-002', month: '2026-07', date: '2026-07-22', customerName: '廖先生', licensePlate: 'CLT-9900', vehicleModel: 'Tesla Model 3', category: '電子後視鏡', brand: 'DOD', itemTitle: 'DOD T-one plus 結合後鏡頭一體式電子後視鏡', depthSpec: '前/後雙錄 + 鏡頭角度自動調整 + Tesla專用支架固定', vendorName: '快譯通/大邁電改工程部', vendorCost: 13000, customerPrice: 20000, status: 'settled', notes: '7月份全額結清' }
];
;
fs.appendFileSync('src/components/AccessorySettlementPage.tsx', code2, 'utf8');

