import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowUpDown,
  Trash2
} from 'lucide-react';
import type { Customer } from '../types';

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
  isManual?: boolean;
}

interface AccessorySettlementPageProps {
  customers?: Customer[];
}

const DEFAULT_VENDORS = [
  '麟光',
  '昆哥',
  '極光專業隔熱紙門市',
  'FSK 授權加盟施工旗艦店',
  '快譯通/大邁電改工程部',
  '星馳汽車電子工程',
  '好室精品配件工坊'
];

export const AccessorySettlementPage: React.FC<AccessorySettlementPageProps> = ({ customers = [] }) => {
  // Local storage for manually added records
  const [manualRecords, setManualRecords] = useState<SettlementRecord[]>(() => {
    try {
      const saved = localStorage.getItem('crm_manual_settlements');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_manual_settlements', JSON.stringify(manualRecords));
    } catch (e) {
      console.error('Failed to save manual settlements', e);
    }
  }, [manualRecords]);

  // Dynamically extract real records from CRM customers database
  const realCustomerRecords = useMemo(() => {
    const extracted: SettlementRecord[] = [];

    customers.forEach(c => {
      const dateVal = (c as any).windowTintDate || (c as any).constructionDate || (c as any).date || (c as any).createdAt || new Date().toISOString().split('T')[0];
      const monthVal = dateVal.substring(0, 7);
      const custName = c.name || (c as any).customerName || '客戶';
      const plate = (c as any).licensePlate || (c as any).plate || '';
      const car = (c as any).carModel || (c as any).vehicleModel || (c as any).carType || '';

      // 1. 隔熱紙施工紀錄
      if ((c as any).windowTintPrice || (c as any).windowTintVendor || (c as any).windowTintPresetId || (c as any).tintBrandFront || (c as any).windowTintCustomName) {
        const vendor = (c as any).windowTintVendor || '未指定廠商';
        const price = Number((c as any).windowTintPrice) || 0;
        const cost = Number((c as any).windowTintVendorCost) || Number((c as any).tintCost) || 0;
        
        let depthDetails = [];
        if ((c as any).tintBrandFront) depthDetails.push(`前擋: ${(c as any).tintBrandFront} ${(c as any).tintModelFront || ''} ${(c as any).tintDepthFront || ''}`.trim());
        if ((c as any).tintBrandSideFront) depthDetails.push(`前側: ${(c as any).tintBrandSideFront} ${(c as any).tintModelSideFront || ''} ${(c as any).tintDepthSideFront || ''}`.trim());
        if ((c as any).tintBrandSideRear) depthDetails.push(`後側: ${(c as any).tintBrandSideRear} ${(c as any).tintModelSideRear || ''} ${(c as any).tintDepthSideRear || ''}`.trim());
        if ((c as any).tintBrandRear) depthDetails.push(`後擋: ${(c as any).tintBrandRear} ${(c as any).tintModelRear || ''} ${(c as any).tintDepthRear || ''}`.trim());
        if ((c as any).tintBrandSunroof) depthDetails.push(`天窗: ${(c as any).tintBrandSunroof} ${(c as any).tintModelSunroof || ''} ${(c as any).tintDepthSunroof || ''}`.trim());

        const specText = depthDetails.length > 0 ? depthDetails.join(' | ') : ((c as any).windowTintCustomName || '全車隔熱紙施工配置');

        extracted.push({
          id: `TINT-${c.id || Math.random().toString(36).substr(2, 6)}`,
          month: monthVal,
          date: dateVal,
          customerName: custName,
          licensePlate: plate,
          vehicleModel: car,
          category: '隔熱紙',
          brand: (c as any).tintBrandFront || (c as any).windowTintBrand || '隔熱紙',
          itemTitle: (c as any).windowTintCustomName || (c as any).windowTintPresetId || '隔熱紙方案',
          depthSpec: specText,
          vendorName: vendor,
          vendorCost: cost,
          customerPrice: price,
          status: c.status === 'completed' || (c as any).status === 'archive' ? 'settled' : 'pending',
          notes: (c as any).notes || (c as any).tintNotes || ''
        });
      }

      // 2. 配件 / 電改 / 電子後視鏡 (如有的話)
      if (Array.isArray((c as any).accessories)) {
        (c as any).accessories.forEach((acc: any, idx: number) => {
          extracted.push({
            id: `ACC-${c.id}-${idx}`,
            month: monthVal,
            date: dateVal,
            customerName: custName,
            licensePlate: plate,
            vehicleModel: car,
            category: acc.category || (acc.name?.includes('後視鏡') ? '電子後視鏡' : acc.name?.includes('燈') || acc.name?.includes('電') ? '電改' : '配件'),
            brand: acc.brand || '合作廠商品牌',
            itemTitle: acc.name || acc.itemTitle || '配件項目',
            depthSpec: acc.spec || acc.description || '標準安裝工法',
            vendorName: acc.vendor || acc.vendorName || '合作廠商',
            vendorCost: Number(acc.cost || acc.vendorCost) || 0,
            customerPrice: Number(acc.price || acc.customerPrice) || 0,
            status: acc.status || (c.status === 'completed' ? 'settled' : 'pending'),
            notes: acc.notes || ''
          });
        });
      }
    });

    return extracted;
  }, [customers]);

  // Combine real database records with manual local records
  const allRecords = useMemo(() => {
    return [...manualRecords, ...realCustomerRecords];
  }, [manualRecords, realCustomerRecords]);

  // Filters & Sorting
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [vendorSelectMode, setVendorSelectMode] = useState<string>('麟光');
  const [customVendorInput, setCustomVendorInput] = useState<string>('');

  const [formData, setFormData] = useState<Partial<SettlementRecord>>({
    month: new Date().toISOString().substring(0, 7),
    date: new Date().toISOString().split('T')[0],
    category: '隔熱紙',
    brand: '',
    itemTitle: '',
    depthSpec: '',
    vendorName: '麟光',
    vendorCost: 0,
    customerPrice: 0,
    customerName: '',
    licensePlate: '',
    vehicleModel: '',
    status: 'pending',
    notes: ''
  });

  const monthsList = useMemo(() => {
    const set = new Set(allRecords.map(r => r.month));
    return Array.from(set).sort().reverse();
  }, [allRecords]);

  const vendorsList = useMemo(() => {
    const set = new Set(allRecords.map(r => r.vendorName));
    return Array.from(set).sort();
  }, [allRecords]);

  const filteredRecords = useMemo(() => {
    const result = allRecords.filter(r => {
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

    return result.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [allRecords, selectedMonth, selectedCategory, selectedVendor, selectedStatus, searchTerm, sortOrder]);

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
    setManualRecords(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'pending' ? 'settled' : item.status === 'settled' ? 'reviewing' : 'pending';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('確定要刪除此筆對帳紀錄嗎？')) {
      setManualRecords(prev => prev.filter(r => r.id !== id));
    }
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
      id: `MAN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
      notes: formData.notes || '',
      isManual: true
    };

    setManualRecords(prev => [newRecord, ...prev]);
    setIsModalOpen(false);
    setFormData({
      month: new Date().toISOString().substring(0, 7),
      date: new Date().toISOString().split('T')[0],
      category: '隔熱紙',
      brand: '',
      itemTitle: '',
      depthSpec: '',
      vendorName: '麟光',
      vendorCost: 0,
      customerPrice: 0,
      customerName: '',
      licensePlate: '',
      vehicleModel: '',
      status: 'pending',
      notes: ''
    });
    setVendorSelectMode('麟光');
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
              自動整合系統內現有與未來新增之隔熱紙/配件施工單紀錄 (${allRecords.length} 筆)
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
              <option value="隔熱紙">☀️ 隔熱紙</option>
              <option value="配件">🛠️ 配件</option>
              <option value="電改">⚡ 電改</option>
              <option value="電子後視鏡">📹 電子後視鏡</option>
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
                        {r.customerName} {r.licensePlate && <span style={{ color: '#6366f1', fontWeight: 'bold' }}>({r.licensePlate})</span>}
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
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>成本金額</div>
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
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
                        {r.isManual && (
                          <button
                            onClick={() => handleDeleteRecord(r.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="刪除自訂紀錄"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <Calculator size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>尚無施工配件對帳紀錄</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>請於待施工案件填寫隔熱紙廠商，或點擊右上角新增紀錄</div>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>配合廠商</label>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>深度品牌 (3M, FSK...)</label>
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
                    placeholder="例如: 新配合店家"
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
                  placeholder="例如: 全車隔熱紙貼膜"
                  value={formData.itemTitle}
                  onChange={e => setFormData({ ...formData, itemTitle: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>深度與規格細節說明</label>
                <textarea
                  placeholder="例如: 前擋 MA70 + 車身 MB20"
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
