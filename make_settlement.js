const fs = require('fs');
fs.mkdirSync('src/components', { recursive: true });
const target = 'src/components/AccessorySettlementPage.tsx';
fs.writeFileSync(target, import React, { useState, useMemo } from 'react';
import { Calculator, Calendar, Search, Plus, Download, CheckCircle2, Clock, AlertCircle, Building2, Layers, X, TrendingUp } from 'lucide-react';

export interface SettlementRecord { id: string; month: string; date: string; customerName: string; licensePlate: string; vehicleModel: string; category: '隔熱紙' | '配件' | '電改' | '電子後視鏡'; brand: string; itemTitle: string; depthSpec: string; vendorName: string; vendorCost: number; customerPrice: number; status: 'pending' | 'settled' | 'reviewing'; notes?: string; }
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
export const AccessorySettlementPage: React.FC = () => {
  const [records, setRecords] = useState<SettlementRecord[]>(INITIAL_RECORDS);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<SettlementRecord>>({
    month: '2026-08', date: new Date().toISOString().split('T')[0], category: '隔熱紙', brand: '', itemTitle: '', depthSpec: '', vendorName: '', vendorCost: 0, customerPrice: 0, customerName: '', licensePlate: '', vehicleModel: '', status: 'pending', notes: ''
  });

  const monthsList = useMemo(() => Array.from(new Set(records.map(r => r.month))).sort().reverse(), [records]);
  const vendorsList = useMemo(() => Array.from(new Set(records.map(r => r.vendorName))).sort(), [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedMonth !== 'all' && r.month !== selectedMonth) return false;
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (selectedVendor !== 'all' && r.vendorName !== selectedVendor) return false;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const match = r.customerName.toLowerCase().includes(query) || r.licensePlate.toLowerCase().includes(query) || r.vehicleModel.toLowerCase().includes(query) || r.brand.toLowerCase().includes(query) || r.itemTitle.toLowerCase().includes(query) || r.depthSpec.toLowerCase().includes(query) || r.vendorName.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [records, selectedMonth, selectedCategory, selectedVendor, selectedStatus, searchTerm]);
  const stats = useMemo(() => {
    const totalVendorCost = filteredRecords.reduce((acc, curr) => acc + curr.vendorCost, 0);
    const totalCustomerRevenue = filteredRecords.reduce((acc, curr) => acc + curr.customerPrice, 0);
    const totalGrossProfit = totalCustomerRevenue - totalVendorCost;
    const pendingVendorCost = filteredRecords.filter(r => r.status === 'pending').reduce((acc, curr) => acc + curr.vendorCost, 0);
    const settledVendorCost = filteredRecords.filter(r => r.status === 'settled').reduce((acc, curr) => acc + curr.vendorCost, 0);
    return { count: filteredRecords.length, totalVendorCost, totalCustomerRevenue, totalGrossProfit, pendingVendorCost, settledVendorCost };
  }, [filteredRecords]);

  const vendorBreakdown = useMemo(() => {
    const map: Record<string, { totalCost: number; pendingCost: number; settledCost: number; itemsCount: number }> = {};
    filteredRecords.forEach(r => {
      if (!map[r.vendorName]) map[r.vendorName] = { totalCost: 0, pendingCost: 0, settledCost: 0, itemsCount: 0 };
      map[r.vendorName].totalCost += r.vendorCost;
      map[r.vendorName].itemsCount += 1;
      if (r.status === 'pending') map[r.vendorName].pendingCost += r.vendorCost;
      else if (r.status === 'settled') map[r.vendorName].settledCost += r.vendorCost;
    });
    return Object.entries(map).map(([vendor, data]) => ({ vendor, ...data }));
  }, [filteredRecords]);

  const handleToggleStatus = (id: string) => {
    setRecords(prev => prev.map(item => item.id === id ? { ...item, status: item.status === 'pending' ? 'settled' : item.status === 'settled' ? 'reviewing' : 'pending' } : item));
  };

  const handleSettleVendorAll = (vendorName: string) => {
    setRecords(prev => prev.map(item => item.vendorName === vendorName && (selectedMonth === 'all' || item.month === selectedMonth) ? { ...item, status: 'settled' } : item));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemTitle || !formData.vendorName || !formData.vendorCost) { alert('請填寫完整項目名稱、廠商名稱及應付金額！'); return; }
    const newRecord: SettlementRecord = {
      id: SET--,
      month: formData.month || '2026-08', date: formData.date || new Date().toISOString().split('T')[0], customerName: formData.customerName || '散客', licensePlate: formData.licensePlate || '未填寫', vehicleModel: formData.vehicleModel || '一般車型', category: (formData.category as any) || '配件', brand: formData.brand || '原廠/合作品牌', itemTitle: formData.itemTitle, depthSpec: formData.depthSpec || '標準工法細節', vendorName: formData.vendorName, vendorCost: Number(formData.vendorCost) || 0, customerPrice: Number(formData.customerPrice) || 0, status: (formData.status as any) || 'pending', notes: formData.notes || ''
    };
    setRecords(prev => [newRecord, ...prev]);
    setIsModalOpen(false);
  };
  const handleExportCSV = () => {
    const headers = ['結算單號', '月份', '日期', '顧客姓名', '車牌', '車型', '項目類別', '深度品牌', '項目名稱', '施工深度/規格細節', '配合廠商', '應付廠商金額', '顧客報價', '估計毛利', '結算狀態', '備註'];
    const rows = filteredRecords.map(r => [r.id, r.month, r.date, r.customerName, r.licensePlate, r.vehicleModel, r.category, r.brand, " \\, \\\, r.vendorName, r.vendorCost, r.customerPrice, r.customerPrice - r.vendorCost, r.status === 'settled' ? '已結算' : r.status === 'pending' ? '待結算' : '對帳中', \\\]);
 const csvContent = \\\uFEFF\ + [headers.join(','), ...rows.map(e => e.join(','))].join('\\n');
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.setAttribute('href', url); link.setAttribute('download', 好室多膜_CRM配件費用結算對帳單_\.csv);
 document.body.appendChild(link); link.click(); document.body.removeChild(link);
 };

 return (
 <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
 <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
 <Calculator size={28} />
 </div>
 <div>
 <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>配件費用對帳結算系統</h2>
 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>彙整每個月隔熱紙、配件、電改與電子後視鏡之深度品牌、施工細節與應付廠商款項</span>
 </div>
 </div>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
 <Download size={18} /> 匯出 Excel 對帳單
 </button>
 <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: '#fff', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)' }}>
 <Plus size={18} /> 新增配件對帳紀錄
 </button>
 </div>
 </header>
