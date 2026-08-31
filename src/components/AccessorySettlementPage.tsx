import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Calendar, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Layers, 
  X,
  TrendingUp,
  ArrowUpDown
} from 'lucide-react';

export interface SettlementRecord {
  id: string;
  month: string;
  date: string;
  customerName: string;
  licensePlate: string;
  vehicleModel: string;
  category: '隔熱紙' | '配件' | '電改' | '電子後視鏡';
  brand: string;
  itemTitle: string;
  depthSpec: string;
  vendorName: string;
  vendorCost: number;
  customerPrice: number;
  status: 'pending' | 'settled' | 'reviewing';
  notes?: string;
}

const DEFAULT_VENDORS = [
  '極光專業隔熱紙門市',
  'FSK 授權加盟施工旗艦店',
  '快譯通/大邁電改工程部',
  '星馳汽車電子工程',
  '好室精品配件工坊'
];

const INITIAL_RECORDS: SettlementRecord[] = [
  {
    id: 'SET-202608-001',
    month: '2026-08',
    date: '2026-08-28',
    customerName: '陳先生',
    licensePlate: 'BJA-8899',
    vehicleModel: 'Tesla Model Y',
    category: '隔熱紙',
    brand: '3M',
    itemTitle: '全車極透+極黑尊爵隔熱紙方案',
    depthSpec: '前擋 極透 MA70 + 車身 極黑 MB20 + 天窗 冰鑽 KT8 (滿版滿貼工法 Lv.3)',
    vendorName: '極光專業隔熱紙門市',
    vendorCost: 18500,
    customerPrice: 30500,
    status: 'pending',
    notes: '含天窗與無邊框玻璃滿版貼膜工資'
  },
  {
    id: 'SET-202608-002',
    month: '2026-08',
    date: '2026-08-26',
    customerName: '林小姐',
    licensePlate: 'EAE-1688',
    vehicleModel: 'Tesla Model 3 Highland',
    category: '電子後視鏡',
    brand: '快譯通',
    itemTitle: '快譯通 S95B 4K星光夜視電子後視鏡',
    depthSpec: '車外鏡頭防水安裝 + 專用降壓線隱藏走線 + 後保桿專用鏡頭座',
    vendorName: '快譯通/大邁電改工程部',
    vendorCost: 8800,
    customerPrice: 14000,
    status: 'pending',
    notes: '煥新版 Model 3 特殊後保桿走線工法'
  },
  {
    id: 'SET-202608-003',
    month: '2026-08',
    date: '2026-08-24',
    customerName: '張董事長',
    licensePlate: 'RCA-7777',
    vehicleModel: 'Porsche Macan EV',
    category: '配件',
    brand: 'STEK / AX Wrap',
    itemTitle: '全車鍍鉻件亮黑化包覆與水箱護罩黑化',
    depthSpec: '全車側窗框黑化 (AX高光黑) + 前氣壩黑化 + 尾標燻黑 (高抗刮深度黑化Lv.2)',
    vendorName: '好室精品配件工坊',
    vendorCost: 7500,
    customerPrice: 15000,
    status: 'settled',
    notes: '包含原廠拆裝配件工資'
  },
  {
    id: 'SET-202608-004',
    month: '2026-08',
    date: '2026-08-20',
    customerName: '黃醫師',
    licensePlate: 'BMV-9988',
    vehicleModel: 'BMW i4 M50',
    category: '電改',
    brand: '星空燈光 (StarAmbient)',
    itemTitle: '64色環艙幻彩氛圍燈與四門雙層光導',
    depthSpec: '全車18燈頭 + 四門中控隱藏式光線條 + 專用 App 獨立控光控制模組',
    vendorName: '星馳汽車電子工程',
    vendorCost: 12000,
    customerPrice: 22000,
    status: 'pending',
    notes: '原廠保固專用不破線協議盒'
  },
  {
    id: 'SET-202608-005',
    month: '2026-08',
    date: '2026-08-18',
    customerName: '許先生',
    licensePlate: 'BNN-5200',
    vehicleModel: 'Mercedes-Benz EQE SUV',
    category: '隔熱紙',
    brand: 'FSK 冰鑽',
    itemTitle: 'FSK 冰鑽 KT 全車旗艦頂級隔熱紙',
    depthSpec: '前擋 KT68 (高透光高隔熱) + 車身 KT15 (高隱密奈米陶瓷) (滿貼施工)',
    vendorName: 'FSK 授權加盟施工旗艦店',
    vendorCost: 23000,
    customerPrice: 37500,
    status: 'settled',
    notes: '廠商附送原廠6年電子保固卡'
  },
  {
    id: 'SET-202608-006',
    month: '2026-08',
    date: '2026-08-15',
    customerName: '郭經理',
    licensePlate: 'ATP-3366',
    vehicleModel: 'Lexus RX500h',
    category: '電子後視鏡',
    brand: '大邁 (DAMAI)',
    itemTitle: '大邁 M996 2K前後雙錄串流電子後視鏡',
    depthSpec: '車外防水鏡頭 + 車內靜電貼 + 保險絲盒專用不斷電供電線',
    vendorName: '快譯通/大邁電改工程部',
    vendorCost: 7500,
    customerPrice: 12800,
    status: 'reviewing',
    notes: '等待廠商發票對帳'
  },
  {
    id: 'SET-202608-007',
    month: '2026-08',
    date: '2026-08-10',
    customerName: '蔡小姐',
    licensePlate: 'BPQ-6688',
    vehicleModel: 'Tesla Model Y',
    category: '電改',
    brand: '邁斯 (MAIS)',
    itemTitle: '前備箱電動開合與腳踢感應升級',
    depthSpec: '雙桿靜音電吸馬達 + 防水感應雷達 + 車內大螢幕控制連動',
    vendorName: '星馳汽車電子工程',
    vendorCost: 9500,
    customerPrice: 16800,
    status: 'settled',
    notes: '已含專用模組測試費用'
  },
  {
    id: 'SET-202607-001',
    month: '2026-07',
    date: '2026-07-29',
    customerName: '鄭先生',
    licensePlate: 'AFG-1122',
    vehicleModel: 'Audi Q8 e-tron',
    category: '隔熱紙',
    brand: '桑馬克 (SunMark)',
    itemTitle: '桑馬克 Smart + XC MAX 尊榮隔熱紙',
    depthSpec: '前擋 Smart 70 (智慧光控) + 車身 XC 20 (防爆陶瓷)',
    vendorName: '極光專業隔熱紙門市',
    vendorCost: 19000,
    customerPrice: 32500,
    status: 'settled',
    notes: '7月份廠商款項已完成電匯'
  },
  {
    id: 'SET-202607-002',
    month: '2026-07',
    date: '2026-07-22',
    customerName: '廖先生',
    licensePlate: 'CLT-9900',
    vehicleModel: 'Tesla Model 3',
    category: '電子後視鏡',
    brand: 'DOD',
    itemTitle: 'DOD T-one plus 結合後鏡頭一體式電子後視鏡',
    depthSpec: '前/後雙錄 + 鏡頭角度自動調整 + Tesla專用支架固定',
    vendorName: '快譯通/大邁電改工程部',
    vendorCost: 13000,
    customerPrice: 20000,
    status: 'settled',
    notes: '7月份全額結清'
  }
];

export const AccessorySettlementPage: React.FC = () => {
  const [records, setRecords] = useState<SettlementRecord[]>(INITIAL_RECORDS);
  
  // Default filter to 'all' so records are shown ordered by date descending
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [vendorSelectMode, setVendorSelectMode] = useState<string>('極光專業隔熱紙門市');
  const [customVendorInput, setCustomVendorInput] = useState<string>('');

  const [formData, setFormData] = useState<Partial<SettlementRecord>>({
    month: new Date().toISOString().substring(0, 7),
    date: new Date().toISOString().split('T')[0],
    category: '隔熱紙',
    brand: '',
    itemTitle: '',
    depthSpec: '',
    vendorName: '極光專業隔熱紙門市',
    vendorCost: 0,
    customerPrice: 0,
    customerName: '',
    licensePlate: '',
    vehicleModel: '',
    status: 'pending',
    notes: ''
  });

  const monthsList = useMemo(() => {
    const set = new Set(records.map(r => r.month));
    return Array.from(set).sort().reverse();
  }, [records]);

  const vendorsList = useMemo(() => {
    const set = new Set(records.map(r => r.vendorName));
    return Array.from(set).sort();
  }, [records]);

  // Filter and Sort by Date
  const filteredRecords = useMemo(() => {
    const result = records.filter(r => {
      if (selectedMonth !== 'all' && r.month !== selectedMonth) return false;
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (selectedVendor !== 'all' && r.vendorName !== selectedVendor) return false;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const match = 
          r.customerName.toLowerCase().includes(query) ||
          r.licensePlate.toLowerCase().includes(query) ||
          r.vehicleModel.toLowerCase().includes(query) ||
          r.brand.toLowerCase().includes(query) ||
          r.itemTitle.toLowerCase().includes(query) ||
          r.depthSpec.toLowerCase().includes(query) ||
          r.vendorName.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });

    // Default sort by date
    return result.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [records, selectedMonth, selectedCategory, selectedVendor, selectedStatus, searchTerm, sortOrder]);

  const stats = useMemo(() => {
    const totalVendorCost = filteredRecords.reduce((acc, curr) => acc + curr.vendorCost, 0);
    const totalCustomerRevenue = filteredRecords.reduce((acc, curr) => acc + curr.customerPrice, 0);
    const totalGrossProfit = totalCustomerRevenue - totalVendorCost;
    
    const pendingVendorCost = filteredRecords
      .filter(r => r.status === 'pending')
      .reduce((acc, curr) => acc + curr.vendorCost, 0);

    const settledVendorCost = filteredRecords
      .filter(r => r.status === 'settled')
      .reduce((acc, curr) => acc + curr.vendorCost, 0);

    return {
      count: filteredRecords.length,
      totalVendorCost,
      totalCustomerRevenue,
      totalGrossProfit,
      pendingVendorCost,
      settledVendorCost
    };
  }, [filteredRecords]);

  const handleToggleStatus = (id: string) => {
    setRecords(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'pending' ? 'settled' : item.status === 'settled' ? 'reviewing' : 'pending';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalVendorName = vendorSelectMode === 'other' ? customVendorInput.trim() : vendorSelectMode;

    if (!formData.itemTitle || !finalVendorName || formData.vendorCost === undefined) {
      alert('請填寫完整施工項目名稱、廠商名稱及給廠商成本金額！');
      return;
    }

    const monthVal = formData.date ? formData.date.substring(0, 7) : new Date().toISOString().substring(0, 7);

    const newRecord: SettlementRecord = {
      id: `SET-${monthVal.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      month: monthVal,
      date: formData.date || new Date().toISOString().split('T')[0],
      customerName: formData.customerName || '散客',
      licensePlate: formData.licensePlate || '未填寫',
      vehicleModel: formData.vehicleModel || '一般車型',
      category: (formData.category as any) || '隔熱紙',
      brand: formData.brand || '原廠/合作品牌',
      itemTitle: formData.itemTitle,
      depthSpec: formData.depthSpec || '標準工法細節',
      vendorName: finalVendorName,
      vendorCost: Number(formData.vendorCost) || 0,
      customerPrice: Number(formData.customerPrice) || 0,
      status: (formData.status as any) || 'pending',
      notes: formData.notes || ''
    };

    setRecords(prev => [newRecord, ...prev]);
    setIsModalOpen(false);
    setFormData({
      month: new Date().toISOString().substring(0, 7),
      date: new Date().toISOString().split('T')[0],
      category: '隔熱紙',
      brand: '',
      itemTitle: '',
      depthSpec: '',
      vendorName: '極光專業隔熱紙門市',
      vendorCost: 0,
      customerPrice: 0,
      customerName: '',
      licensePlate: '',
      vehicleModel: '',
      status: 'pending',
      notes: ''
    });
    setVendorSelectMode('極光專業隔熱紙門市');
    setCustomVendorInput('');
  };

  const handleExportCSV = () => {
    const headers = ['結算單號', '施工日期', '月份', '顧客姓名', '車牌', '車型', '項目類別', '深度品牌', '項目名稱', '施工深度/規格細節', '配合廠商', '給廠商金額(成本)', '顧客報價', '估計毛利', '結算狀態', '備註'];
    const rows = filteredRecords.map(r => [
      r.id,
      r.date,
      r.month,
      r.customerName,
      r.licensePlate,
      r.vehicleModel,
      r.category,
      r.brand,
      `"${r.itemTitle.replace(/"/g, '""')}"`,
      `"${r.depthSpec.replace(/"/g, '""')}"`,
      r.vendorName,
      r.vendorCost,
      r.customerPrice,
      r.customerPrice - r.vendorCost,
      r.status === 'settled' ? '已結算' : r.status === 'pending' ? '待結算' : '對帳中',
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `好室多膜_CRM配件費用結算對帳單_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
            <Calculator size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>
              配件費用對帳結算系統
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
              依施工日期倒序排列，手動記錄與結算隔熱紙、配件、電改及電子後視鏡廠商成本與款項
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', borderRadius: '12px', border: '1px solid #cbd5e1',
              background: '#fff', color: '#475569', fontWeight: '700', fontSize: '0.9rem',
              cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s'
            }}
          >
            <Download size={18} /> 匯出 Excel 對帳單
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: '#fff',
              fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)', transition: 'all 0.2s'
            }}
          >
            <Plus size={18} /> 新增配件對帳紀錄
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>
            <span>當期廠商應付總額 (成本)</span>
            <Building2 size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#4338ca', marginTop: '10px' }}>
            $${stats.totalVendorCost.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
            含隔熱紙、電改、配件及電子後視鏡
          </div>
        </div>

        <div style={{ padding: '20px', borderRadius: '20px', border: '1px solid #fde68a', background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b45309', fontSize: '0.85rem', fontWeight: '700' }}>
            <span>未結算廠商金額 (待撥款)</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d97706', marginTop: '10px' }}>
            $${stats.pendingVendorCost.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '6px', fontWeight: '600' }}>
            尚有 ${filteredRecords.filter(r => r.status === 'pending').length} 筆未完成對帳付款
          </div>
        </div>

        <div style={{ padding: '20px', borderRadius: '20px', border: '1px solid #dcfce7', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#15803d', fontSize: '0.85rem', fontWeight: '700' }}>
            <span>已結算付款總額</span>
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#15803d', marginTop: '10px' }}>
            $${stats.settledVendorCost.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '6px', fontWeight: '600' }}>
            已有 ${filteredRecords.filter(r => r.status === 'settled').length} 筆撥款完成
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>
            <span>顧客總報價 / 估計毛利</span>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            $${stats.totalCustomerRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '6px', fontWeight: '800' }}>
            毛利: +$${stats.totalGrossProfit.toLocaleString()} (${stats.totalCustomerRevenue > 0 ? Math.round((stats.totalGrossProfit / stats.totalCustomerRevenue) * 100) : 0}%)
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div style={{ background: '#fff', padding: '18px 24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="搜尋車型、車牌、深度品牌或廠商..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 38px', borderRadius: '12px',
                border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', color: '#1e293b'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1',
                background: '#f8fafc', fontSize: '0.9rem', fontWeight: '700', color: '#4338ca', cursor: 'pointer'
              }}
            >
              <ArrowUpDown size={16} /> 時間: {sortOrder === 'desc' ? '最新在前 (預設)' : '最舊在前'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={18} color="#4f46e5" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', cursor: 'pointer' }}
            >
              <option value="all">📅 全部時間紀錄 (按施工日期排序)</option>
              {monthsList.map(m => (
                <option key={m} value={m}>{m} 月份紀錄</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={18} color="#4f46e5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', cursor: 'pointer' }}
            >
              <option value="all">🏷️ 全部配件項目類別</option>
              <option value="隔熱紙">☀️ 隔熱紙 (3M/FSK/桑馬克/舒熱佳/Xpel...)</option>
              <option value="配件">🛠️ 配件 (黑化/套件/包覆...)</option>
              <option value="電改">⚡ 電改 (氛圍燈/電尾門/電踢...)</option>
              <option value="電子後視鏡">📹 電子後視鏡 (快譯通/大邁/DOD...)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={18} color="#4f46e5" />
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', cursor: 'pointer' }}
            >
              <option value="all">🏢 全部配合廠商</option>
              {vendorsList.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', cursor: 'pointer' }}
          >
            <option value="all">🔄 全部結算狀態</option>
            <option value="pending">⏳ 待結算 (未付款)</option>
            <option value="settled">✅ 已結算 (已付款)</option>
            <option value="reviewing">🔍 對帳中</option>
          </select>

        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                <th style={{ padding: '16px 20px' }}>施工日期 / 單號</th>
                <th style={{ padding: '16px 16px' }}>顧客 / 車型</th>
                <th style={{ padding: '16px 16px' }}>類別 & 深度品牌</th>
                <th style={{ padding: '16px 16px', minWidth: '260px' }}>施工項目與深度細節</th>
                <th style={{ padding: '16px 16px' }}>配合廠商</th>
                <th style={{ padding: '16px 16px', textAlign: 'right' }}>給廠商金額 (手填成本)</th>
                <th style={{ padding: '16px 16px', textAlign: 'right' }}>對客報價</th>
                <th style={{ padding: '16px 16px', textAlign: 'center' }}>結算狀態 (點擊切換)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r, idx) => (
                  <tr 
                    key={r.id}
                    style={{ 
                      borderBottom: idx === filteredRecords.length - 1 ? 'none' : '1px solid #f1f5f9',
                      background: r.status === 'settled' ? '#fafafa' : '#fff',
                      transition: 'background 0.2s'
                    }}
                  >
                    <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '800', color: '#1e293b' }}>{r.date}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>{r.id}</div>
                    </td>

                    <td style={{ padding: '16px 16px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>{r.vehicleModel}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                        {r.customerName} <span style={{ color: '#6366f1', fontWeight: 'bold' }}>({r.licensePlate})</span>
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px', verticalAlign: 'top' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '4px',
                        background: r.category === '隔熱紙' ? '#fff7ed' : r.category === '電改' ? '#eef2ff' : r.category === '電子後視鏡' ? '#f0fdf4' : '#fdf2f8',
                        color: r.category === '隔熱紙' ? '#c2410c' : r.category === '電改' ? '#4338ca' : r.category === '電子後視鏡' ? '#15803d' : '#be185d',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        {r.category === '隔熱紙' ? '☀️ 隔熱紙' : r.category === '電改' ? '⚡ 電改' : r.category === '電子後視鏡' ? '📹 電子後視鏡' : '🛠️ 配件'}
                      </span>
                      <div style={{ fontWeight: '800', color: '#334155', fontSize: '0.85rem' }}>
                        品牌: {r.brand}
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>{r.itemTitle}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        <strong>深度工法與規格:</strong> {r.depthSpec}
                      </div>
                      {r.notes && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                          💡 備註: {r.notes}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '16px 16px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={14} color="#64748b" /> {r.vendorName}
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#dc2626' }}>
                        $${r.vendorCost.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>手填成本金額</div>
                    </td>

                    <td style={{ padding: '16px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                        $${r.customerPrice.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 'bold' }}>
                        毛利: +$${(r.customerPrice - r.vendorCost).toLocaleString()}
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px', textAlign: 'center', verticalAlign: 'top' }}>
                      <button
                        onClick={() => handleToggleStatus(r.id)}
                        style={{
                          border: 'none', padding: '6px 14px', borderRadius: '12px', cursor: 'pointer',
                          fontWeight: '800', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: r.status === 'settled' ? '#dcfce7' : r.status === 'pending' ? '#fffbeb' : '#e0f2fe',
                          color: r.status === 'settled' ? '#15803d' : r.status === 'pending' ? '#b45309' : '#0369a1',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                        }}
                      >
                        {r.status === 'settled' ? (
                          <><CheckCircle2 size={14} /> 已完成結算</>
                        ) : r.status === 'pending' ? (
                          <><Clock size={14} /> 待對帳付款</>
                        ) : (
                          <><AlertCircle size={14} /> 對帳審核中</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <Calculator size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>沒有符合條件的結算紀錄</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>請調整頂部時間、類別或廠商篩選器</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '640px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="#4f46e5" /> 新增配件結算對帳紀錄
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>施工日期</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>項目類別</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    <option value="隔熱紙">☀️ 隔熱紙</option>
                    <option value="配件">🛠️ 配件</option>
                    <option value="電改">⚡ 電改</option>
                    <option value="電子後視鏡">📹 電子後視鏡</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>配合廠商 (選擇預設或手寫)</label>
                  <select
                    value={vendorSelectMode}
                    onChange={e => setVendorSelectMode(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    {DEFAULT_VENDORS.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                    <option value="other">✏️ 其他 (自訂手動填寫)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>深度品牌 (3M, FSK, 快譯通...)</label>
                  <input
                    type="text"
                    placeholder="請輸入品牌"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              {vendorSelectMode === 'other' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#4338ca', marginBottom: '6px' }}>請輸入自訂廠商名稱</label>
                  <input
                    type="text"
                    placeholder="例如: 新配合隔熱紙店家"
                    value={customVendorInput}
                    onChange={e => setCustomVendorInput(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #6366f1', outline: 'none', background: '#eef2ff' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>施工項目名稱</label>
                <input
                  type="text"
                  placeholder="例如: 快譯通 S95B 4K星光夜視電子後視鏡"
                  value={formData.itemTitle}
                  onChange={e => setFormData({ ...formData, itemTitle: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>深度與規格細節說明 (滿貼工法/鏡頭型態/走線等)</label>
                <textarea
                  placeholder="例如: 前擋 MA70 + 車身 MB20 (滿版滿貼工法)"
                  value={formData.depthSpec}
                  onChange={e => setFormData({ ...formData, depthSpec: e.target.value })}
                  rows={2}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>顧客姓名</label>
                  <input
                    type="text"
                    placeholder="例如: 陳先生"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>車牌號碼</label>
                  <input
                    type="text"
                    placeholder="例如: BJA-8899"
                    value={formData.licensePlate}
                    onChange={e => setFormData({ ...formData, licensePlate: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>車型</label>
                  <input
                    type="text"
                    placeholder="例如: Tesla Model Y"
                    value={formData.vehicleModel}
                    onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#dc2626', marginBottom: '6px' }}>給廠商金額 (手填成本)</label>
                  <input
                    type="number"
                    placeholder="例如: 18500"
                    value={formData.vendorCost || ''}
                    onChange={e => setFormData({ ...formData, vendorCost: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #fca5a5', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#16a34a', marginBottom: '6px' }}>對客報價</label>
                  <input
                    type="number"
                    placeholder="例如: 30500"
                    value={formData.customerPrice || ''}
                    onChange={e => setFormData({ ...formData, customerPrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #86efac', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)' }}
                >
                  確認儲存紀錄
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
