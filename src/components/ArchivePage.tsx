import React, { useState } from 'react';
import XLSX from 'xlsx-js-style';
import type { Customer, Role } from '../types';

import {
  Search, Calendar, ShieldCheck,
  ChevronDown, ChevronUp, Gift, Package, CheckCircle2, FileUp, ListChecks,
  XCircle, FileText, AlertCircle, Hash, DollarSign,
  ArrowUp, ArrowDown, Save, Image as ImageIcon, Camera, UserCheck, Clock, Trash2,
  Palette, Shield, Wind
} from 'lucide-react';


interface ArchivePageProps {
  customers: Customer[];
  onBack: () => void;
  onViewDetail: (customer: Customer) => void;
  onUpdate: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  userRole?: Role;
  onImportClick: () => void;
}




const ToggleBadge = ({
  ok, label, onToggle
}: { ok?: boolean; label: string; onToggle: () => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '5px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold',
      background: ok ? '#dcfce7' : '#f8fafc',
      color: ok ? '#166534' : '#64748b',
      border: `1.5px solid ${ok ? '#86efac' : '#e2e8f0'}`,
      cursor: 'pointer', transition: 'all 0.15s'
    }}
  >
    {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} color="#cbd5e1" />} {label}
  </button>
);

const InfoRow = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
  if (value === undefined || value === null || value === '' || value === false) return null;
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '5px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: '0.78rem', color: '#94a3b8', minWidth: '90px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1e293b' }}>{String(value)}</span>
    </div>
  );
};

const Section = ({ icon, title, children, color = '#64748b' }: { icon: React.ReactNode; title: string; children: React.ReactNode; color?: string }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color, fontWeight: 'bold', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
      {icon} {title}
    </div>
    <div style={{ paddingLeft: '4px' }}>{children}</div>
  </div>
);

const getCustomerBgColor = (service?: string) => {
  if (!service) return '#eff6ff';
  const s = service.toLowerCase();
  if (s.includes('犀牛皮') && !s.includes('迎風面')) {
    return '#f0fdf4';
  }
  if (s.includes('改色')) {
    return '#fef2f2';
  }
  return '#eff6ff';
};

const getCustomerBorderColor = (service?: string) => {
  if (!service) return '#dbeafe';
  const s = service.toLowerCase();
  if (s.includes('犀牛皮') && !s.includes('迎風面')) {
    return '#dcfce7';
  }
  if (s.includes('改色')) {
    return '#fee2e2';
  }
  return '#dbeafe';
};

export const ArchivePage: React.FC<ArchivePageProps> = ({ 
  customers, onBack, onUpdate, onEdit, onDeleteCustomer, userRole, onImportClick
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 200;

  // Extract all unique months of drop-offs for stats filter (e.g. YYYY-MM)
  const uniqueMonths = React.useMemo(() => {
    const monthsSet = new Set<string>();
    customers.forEach(c => {
      if (c.status === 'new') return;
      const dateStr = c.expectedStartDate || c.constructionStartDate || c.deliveryDate || '';
      if (/^\d{4}[-/]\d{1,2}/.test(dateStr)) {
        const parts = dateStr.split(/[-/]/);
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        monthsSet.add(`${y}-${m}`);
      }
    });
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [customers]);

  const getTodayMonthStr = () => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const twTime = new Date(utc + (3600000 * 8));
    const y = twTime.getFullYear();
    const m = String(twTime.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const todayMonth = getTodayMonthStr();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const defaultM = getTodayMonthStr();
    return uniqueMonths.includes(defaultM) ? defaultM : (uniqueMonths[0] || defaultM);
  });
  const [filterMonth, setFilterMonth] = useState<string | null>(null);

  const monthlyStats = React.useMemo(() => {
    let total = 0;
    let colorWrap = 0;
    let ppf = 0;
    let windFace = 0;
    let others = 0;

    customers.forEach(c => {
      if (c.status === 'new') return;
      const dateStr = c.expectedStartDate || c.constructionStartDate || c.deliveryDate || '';
      if (/^\d{4}[-/]\d{1,2}/.test(dateStr)) {
        const parts = dateStr.split(/[-/]/);
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const ym = `${y}-${m}`;
        
        if (ym === selectedMonth) {
          total++;
          const service = String(c.mainService || '').toLowerCase();
          
          if (service.includes('改色')) {
            colorWrap++;
          } else if (service.includes('犀牛皮') && !service.includes('迎風面')) {
            ppf++;
          } else if (service.includes('迎風面')) {
            windFace++;
          } else {
            others++;
          }
        }
      }
    });

    return { total, colorWrap, ppf, windFace, others };
  }, [customers, selectedMonth]);

  const completedCustomers = customers.filter(c => {
    const isCompletedOrActive = c.status === 'completed' || (showUnderConstruction && ['construction', 'scheduled', 'deposit'].includes(c.status));
    if (!isCompletedOrActive) return false;
    
    if (filterMonth) {
      const dateStr = c.expectedStartDate || c.constructionStartDate || c.deliveryDate || '';
      if (/^\d{4}[-/]\d{1,2}/.test(dateStr)) {
        const parts = dateStr.split(/[-/]/);
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const ym = `${y}-${m}`;
        return ym === filterMonth;
      }
      return false;
    }
    return true;
  });
  const filteredCustomers = completedCustomers
    .filter(c => {
      const name = String(c.name || '').toLowerCase();
      const phone = String(c.phone || '').toLowerCase();
      const plate = String(c.plateNumber || '').toLowerCase();
      const model = String(c.model || '').toLowerCase();
      const film = String(c.filmColor || '').toLowerCase();
      const brand = String(c.brand || '').toLowerCase();
      const mainService = String(c.mainService || '').toLowerCase();
      const mainServiceBrand = String(c.mainServiceBrand || '').toLowerCase();
      const materialCode = String(c.materialCode || '').toLowerCase();
      const windowTint = String(c.windowTint || '').toLowerCase();
      const windowTintBrand = String(c.windowTintBrand || '').toLowerCase();
      const digitalMirror = String(c.digitalMirror || '').toLowerCase();
      const electricMod = String(c.electricMod || '').toLowerCase();
      const posId = String(c.posId || '').toLowerCase();
      const notes = String(c.notes || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      return name.includes(term) || 
             phone.includes(term) || 
             plate.includes(term) || 
             model.includes(term) || 
             film.includes(term) || 
             brand.includes(term) || 
             mainService.includes(term) || 
             mainServiceBrand.includes(term) || 
             materialCode.includes(term) || 
             windowTint.includes(term) || 
             windowTintBrand.includes(term) || 
             digitalMirror.includes(term) || 
             electricMod.includes(term) || 
             posId.includes(term) || 
             notes.includes(term);
    })
    .sort((a, b) => {
      if (sortBy === 'id') {
        const idA = String(a.id || '');
        const idB = String(b.id || '');
        
        const isAutoA = idA.includes('無編號');
        const isAutoB = idB.includes('無編號');

        if (isAutoA && isAutoB) {
          // Both are auto-generated, sort by their internal timestamp/index to preserve upload order
          return sortOrder === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA);
        }
        
        if (isAutoA) return 1; // Put auto-generated at the end
        if (isAutoB) return -1;
        
        const cmp = idA.localeCompare(idB, undefined, { numeric: true });
        return sortOrder === 'asc' ? cmp : -cmp;
      } else {
        const isValidDate = (str: string) => {
          return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str);
        };

        const getSortDate = (c: Customer) => {
          return c.expectedStartDate || c.constructionStartDate || c.deliveryDate || '';
        };

        const valA = getSortDate(a);
        const valB = getSortDate(b);

        const isDateA = isValidDate(valA);
        const isDateB = isValidDate(valB);

        // Put invalid/empty dates at the very bottom
        if (isDateA && !isDateB) return -1;
        if (!isDateA && isDateB) return 1;
        if (!isDateA && !isDateB) {
          return valA.localeCompare(valB);
        }

        // Both are valid dates, normalize and compare
        const normalizeDate = (d: string) => {
          const firstPart = d.split('.')[0].trim();
          const parts = firstPart.split(/[-/]/);
          const y = parts[0];
          const m = parts[1].padStart(2, '0');
          const day = parts[2].padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const normA = normalizeDate(valA);
        const normB = normalizeDate(valB);

        return sortOrder === 'asc' ? normA.localeCompare(normB) : normB.localeCompare(normA);
      }
    });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const handleExportExcel = () => {
    const normalizeDate = (d: string) => {
      if (!d) return '';
      const firstPart = d.split('.')[0].trim();
      const parts = firstPart.split(/[-/]/);
      if (parts.length < 3) return firstPart;
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // 1. 按照施工日期由「最早」到「最晚」排序
    // 1. 獲取所有完工、定金、預約的客戶，並套用目前的搜尋過濾
    const exportTargets = customers
      .filter(c => ['completed', 'deposit', 'scheduled', 'construction'].includes(c.status))
      .filter(c => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          String(c.name || '').toLowerCase().includes(lowerSearch) || 
          String(c.phone || '').toLowerCase().includes(lowerSearch) || 
          String(c.plateNumber || '').toLowerCase().includes(lowerSearch) ||
          String(c.model || '').toLowerCase().includes(lowerSearch) ||
          String(c.filmColor || '').toLowerCase().includes(lowerSearch)
        );
      });

    const sortedData = [...exportTargets].sort((a, b) => {
      const valA = normalizeDate(a.expectedStartDate || a.expectedEndDate || a.deliveryDate || '');
      const valB = normalizeDate(b.expectedStartDate || b.expectedEndDate || b.deliveryDate || '');
      if (!valA) return 1;
      if (!valB) return -1;
      return valA.localeCompare(valB);
    });

    // 2. 準備匯出資料 (加入月份區隔概念)
    const exportData: any[] = [];
    let lastMonth = '';

    sortedData.forEach(c => {
      const date = normalizeDate(c.expectedStartDate || '');
      const month = date ? date.substring(0, 7) : '未知月份';
      
      // 試著從 model 中萃取品牌 (如果 brand 是空的)
      let brand = c.brand || '';
      let model = c.model || '';
      
      if (!brand && model) {
        const lowerModel = model.toLowerCase();
        // 常見品牌自動修正
        if (lowerModel.includes('tesla') || lowerModel.includes('model 3') || lowerModel.includes('model y') || lowerModel.includes('model x') || lowerModel.includes('model s')) {
          brand = 'Tesla';
          if (lowerModel.startsWith('tesla ')) model = model.substring(6);
        } else if (lowerModel.includes('suzuki') || lowerModel.includes('jimmy')) {
          brand = 'Suzuki';
          if (lowerModel.startsWith('suzuki ')) model = model.substring(7);
        } else if (lowerModel.includes('volkswagen') || lowerModel.includes('福斯')) {
          brand = 'Volkswagen';
          if (lowerModel.startsWith('volkswagen ')) model = model.substring(11);
          if (lowerModel.startsWith('福斯 ')) model = model.substring(3);
        } else if (lowerModel.includes('toyota') || lowerModel.includes('豐田')) {
          brand = 'Toyota';
        } else if (lowerModel.includes('porsche') || lowerModel.includes('保時捷')) {
          brand = 'Porsche';
        } else if (lowerModel.includes('bmw')) {
          brand = 'BMW';
        } else if (lowerModel.includes('benze') || lowerModel.includes('mercedes') || lowerModel.includes('賓士')) {
          brand = 'Mercedes-Benz';
        } else if (model.includes(' ')) {
          // 如果有空格，嘗試切分第一個單字作為品牌
          const parts = model.split(' ');
          brand = parts[0];
          model = parts.slice(1).join(' ');
        }
      }

      // 月份更換時加入空行作為區隔
      if (lastMonth && month !== lastMonth) {
        exportData.push({}); // 空行
      }
      lastMonth = month;

      exportData.push({
        '大禮包交付': c.giftGiven ? 'O' : 'X',
        '表單+注意事項': c.formSent ? 'O' : 'X',
        '2周追蹤': c.followUp2Weeks ? 'O' : 'X',
        '留車日期': c.expectedStartDate || '',
        '施工日期': c.constructionStartDate || '',
        '完工照發送': c.photosSent ? 'O' : 'X',
        '編號': (String(c.id).includes('無編號') || (String(c.id).startsWith('c_') && String(c.id).length > 10)) ? '無編號' : c.id,
        '客戶姓名': c.name,
        '電話': c.phone,
        '車牌': c.plateNumber,
        '汽車品牌': brand,
        '車型': model,
        '完工/交車日期': c.deliveryDate || c.expectedEndDate || '',
        '目前狀態': c.status === 'completed' ? '已完工' : c.status === 'deposit' ? '已付定金' : c.status === 'construction' ? '施工中' : '已預約',
        '交車時間': c.expectedDeliveryTime || '',
        '主施工項目': c.mainService || '',
        '膜料品牌': c.mainServiceBrand || '',
        '膜料顏色': c.filmColor || '',
        '隔熱紙': c.windowTint || '',
        '電子後視鏡': c.digitalMirror || '',
        '電動改裝': c.electricMod || '',
        '加購配件': (c.customAccessories || []).map(a => a.name).filter(n => n).join(', '),

        '施工金額': c.totalAmount || 0,
        '毛利': c.revenue || 0,
        '活動折扣': c.appliedDiscountName || '',
        '得知管道': c.fromChannel || '',
        '備註': c.notes || '',
        '施工月份': month
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // 2.5 套用樣式 (字體、標題、框線)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cell_address]) continue;

        // 全域基本樣式 (微軟正黑體)
        ws[cell_address].s = {
          font: { name: "Microsoft JhengHei", sz: 10, color: { rgb: "333333" } },
          alignment: { vertical: "center", horizontal: "left", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "EEEEEE" } },
            bottom: { style: "thin", color: { rgb: "EEEEEE" } },
            left: { style: "thin", color: { rgb: "EEEEEE" } },
            right: { style: "thin", color: { rgb: "EEEEEE" } }
          }
        };

        // 標題列樣式 (Row 0)
        if (R === 0) {
          ws[cell_address].s = {
            font: { name: "Microsoft JhengHei", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } }, // 使用與 CRM 相同的 Primary Color
            alignment: { vertical: "center", horizontal: "center" },
            border: {
              top: { style: "thin", color: { rgb: "3730A3" } },
              bottom: { style: "thin", color: { rgb: "3730A3" } },
              left: { style: "thin", color: { rgb: "3730A3" } },
              right: { style: "thin", color: { rgb: "3730A3" } }
            }
          };
        }
      }
    }
    
    // 3. 設定欄位寬度 (避免重疊)
    const wscols = [
      {wch: 12}, // 大禮包
      {wch: 10}, // 表單
      {wch: 10}, // 2周
      {wch: 12}, // 留車日期
      {wch: 12}, // 施工日期
      {wch: 12}, // 照片發送
      {wch: 8},  // 編號
      {wch: 15}, // 姓名
      {wch: 15}, // 電話
      {wch: 12}, // 車牌
      {wch: 12}, // 品牌
      {wch: 15}, // 車型
      {wch: 12}, // 完工日期
      {wch: 12}, // 交車時間
      {wch: 18}, // 項目
      {wch: 18}, // 品牌
      {wch: 18}, // 顏色
      {wch: 18}, // 隔熱紙
      {wch: 18}, // 後視鏡
      {wch: 18}, // 改裝
      {wch: 30}, // 配件
      {wch: 30}, // 贈送
      {wch: 12}, // 金額
      {wch: 12}, // 毛利
      {wch: 15}, // 折扣
      {wch: 15}, // 管道
      {wch: 40}, // 備註
      {wch: 12}, // 月份
    ];
    ws['!cols'] = wscols;

    // 4. 固定首行 (凍結視窗)
    ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "完工紀錄");
    
    // 檔名加上日期
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `crm客戶資料 ${dateStr}.xlsx`);
  };

  const toggle = (customer: Customer, field: keyof Customer) => {
    onUpdate({ ...customer, [field]: !customer[field] });
  };

  const companions: Record<string, string> = {
    alone: '單獨前來', with_wife: '攜伴(另一半)', with_child: '攜帶小孩', with_family: '全家同行'
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2; // Show 2 pages before and after current
      const range = [];
      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        range.unshift('...');
      }
      if (currentPage + delta < totalPages - 1) {
        range.push('...');
      }

      range.unshift(1);
      if (totalPages > 1) {
        range.push(totalPages);
      }

      return range;
    };

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', margin: '24px 0', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-outline" 
          disabled={currentPage === 1}
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          最前頁
        </button>
        <button 
          className="btn btn-outline" 
          disabled={currentPage === 1}
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          上一頁
        </button>

        {getPageNumbers().map((pageNum, idx) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${idx}`} style={{ color: '#94a3b8', margin: '0 4px', fontWeight: 'bold' }}>...</span>
          ) : (
            <button
              key={`page-${pageNum}`}
              onClick={() => { setCurrentPage(pageNum as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: currentPage === pageNum ? 'none' : '1px solid #e2e8f0',
                background: currentPage === pageNum ? 'var(--primary)' : '#fff',
                color: currentPage === pageNum ? '#fff' : '#64748b',
                fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: currentPage === pageNum ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {pageNum}
            </button>
          )
        ))}

        <button 
          className="btn btn-outline" 
          disabled={currentPage === totalPages}
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          下一頁
        </button>
        <button 
          className="btn btn-outline" 
          disabled={currentPage === totalPages}
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          最後頁
        </button>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '8px', fontWeight: 'bold' }}>
            ← 返回看板
          </button>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>完工案件存檔庫</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>查詢與管理所有完工與施工中服務紀錄・共 {completedCustomers.length} 筆</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {userRole === 'admin' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#059669', borderColor: '#10b981' }} onClick={onImportClick}>
                <FileUp size={16} /> Excel 匯入
              </button>
              <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#2563eb', borderColor: '#3b82f6' }} onClick={handleExportExcel}>
                <FileText size={16} /> Excel 匯出
              </button>
            </div>
          )}
          <div style={{ position: 'relative', width: '300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋姓名、電話或車牌..."
              className="form-control"
              style={{ paddingLeft: '40px', borderRadius: '30px', border: '1px solid #e2e8f0', width: '100%' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${showUnderConstruction ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                setShowUnderConstruction(prev => !prev);
                setCurrentPage(1);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 12px' }}
            >
              <Clock size={15} /> 顯示未施工車輛
            </button>

            <button 
              className={`btn ${sortBy === 'id' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                if (sortBy === 'id') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('id'); setSortOrder('desc'); }
                setCurrentPage(1);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 12px' }}
            >
              <Hash size={15} /> 編號 {sortBy === 'id' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
            
            <button 
              className={`btn ${sortBy === 'date' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                if (sortBy === 'date') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('date'); setSortOrder('desc'); }
                setCurrentPage(1);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 12px' }}
            >
              <Calendar size={15} /> 日期 {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </div>
        </div>

      </header>

      {/* 📊 月份施工統計面板 */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>當月施工統計與篩選</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
              onClick={() => {
                const idx = uniqueMonths.indexOf(selectedMonth);
                if (idx < uniqueMonths.length - 1) {
                  setSelectedMonth(uniqueMonths[idx + 1]);
                }
              }}
              disabled={uniqueMonths.indexOf(selectedMonth) >= uniqueMonths.length - 1}
            >
              ◀ 上個月
            </button>
            
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              {uniqueMonths.length > 0 ? uniqueMonths.map(m => (
                <option key={m} value={m}>{m.replace('-', ' 年 ')} 月</option>
              )) : <option value={todayMonth}>{todayMonth.replace('-', ' 年 ')} 月</option>}
            </select>
            
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
              onClick={() => {
                const idx = uniqueMonths.indexOf(selectedMonth);
                if (idx > 0) {
                  setSelectedMonth(uniqueMonths[idx - 1]);
                }
              }}
              disabled={uniqueMonths.indexOf(selectedMonth) <= 0}
            >
              下個月 ▶
            </button>

            <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px' }}></div>

            {filterMonth === selectedMonth ? (
              <button 
                className="btn" 
                style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                onClick={() => setFilterMonth(null)}
              >
                ✕ 清除篩選
              </button>
            ) : (
              <button 
                className="btn" 
                style={{ padding: '6px 14px', fontSize: '0.82rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                onClick={() => {
                  setFilterMonth(selectedMonth);
                  setCurrentPage(1);
                }}
              >
                🔍 篩選此月份車輛
              </button>
            )}
          </div>
        </div>

        {/* 統計數據小卡 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>當月施工總數</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>{monthlyStats.total} <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>台</span></div>
            </div>
          </div>

          <div style={{ background: '#fffbeb', padding: '12px 16px', borderRadius: '12px', border: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fef3c7', color: '#d97706', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Palette size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 'bold' }}>全車改色膜</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#b45309' }}>{monthlyStats.colorWrap} <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>台</span></div>
            </div>
          </div>

          <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '12px', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 'bold' }}>全車犀牛皮</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#15803d' }}>{monthlyStats.ppf} <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>台</span></div>
            </div>
          </div>

          <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '12px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#a7f3d0', color: '#059669', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wind size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 'bold' }}>迎風面保護</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#047857' }}>{monthlyStats.windFace} <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>台</span></div>
            </div>
          </div>

          <div style={{ background: '#f6f2f9', padding: '12px 16px', borderRadius: '12px', border: '1px solid #ebdcf5', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#ebdcf5', color: '#7e22ce', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ListChecks size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 'bold' }}>其他項目</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#6b21a8' }}>{monthlyStats.others} <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>台</span></div>
            </div>
          </div>

        </div>

        {filterMonth && (
          <div style={{ marginTop: '12px', background: '#eff6ff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🔍 目前正在篩選：{filterMonth.replace('-', ' 年 ')} 月的留車案件（共計 {filteredCustomers.length} 筆資料）</span>
            <button style={{ background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setFilterMonth(null)}>清除過濾條件</button>
          </div>
        )}
      </div>

      {renderPagination()}

      {/* ── Table Header ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '70px 240px 180px 110px 110px 1.5fr 100px', 
        padding: '0 16px 12px', 
        gap: '12px', 
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '8px',
        color: '#64748b',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        letterSpacing: '0.05em'
      }}>
        <div 
          onClick={() => {
            if (sortBy === 'id') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
            else { setSortBy('id'); setSortOrder('desc'); }
            setCurrentPage(1);
          }} 
          style={{ cursor: 'pointer' }}
        >
          編號
        </div>
        <div>客戶資料</div>
        <div>車輛資訊</div>
        <div>1.留車進場</div>
        <div>2.交車完工</div>
        <div>膜料品牌與備註項目</div>
        <div style={{ textAlign: 'right' }}>操作</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {paginatedCustomers.length > 0 ? paginatedCustomers.map(customer => {
          const isExpanded = expandedId === customer.id;
          return (
            <div key={customer.id} className="glass-panel" style={{ overflow: 'hidden', border: isExpanded ? '1px solid #bfdbfe' : '1px solid #e2e8f0', transition: 'border 0.2s' }}>

              {/* ── Summary Row ── */}
              <div
                onClick={() => toggleExpand(customer.id)}
                className="list-row"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '70px 240px 180px 110px 110px 1.5fr 100px',
                  alignItems: 'center',
                  padding: '16px',
                  gap: '12px',
                  background: isExpanded ? '#f0f9ff' : '#fff',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isExpanded ? '0 10px 25px -5px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.8rem' }}>
                  {String(customer.id).includes('無編號') || (String(customer.id).startsWith('c_') && String(customer.id).length > 10) ? '無編號' : (customer.id || '無編號')}
                </div>
                
                {/* 2. 客戶資料 */}
                <div style={{
                  backgroundColor: getCustomerBgColor(customer.mainService),
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${getCustomerBorderColor(customer.mainService)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '44px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', color: '#1e293b' }}>{customer.name}</span>
                    {customer.status === 'construction' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`確定要將車主「${customer.name}」設為「已完工」並移入完工區嗎？`)) {
                            const today = new Date().toISOString().split('T')[0];
                            const checkup = new Date();
                            checkup.setMonth(checkup.getMonth() + 1);
                            onUpdate({
                              ...customer,
                              status: 'completed',
                              deliveryDate: customer.deliveryDate || today,
                              checkupDate: customer.checkupDate || checkup.toISOString().split('T')[0]
                            });
                          }
                        }}
                        style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem', 
                          fontWeight: 'bold', 
                          background: '#fef3c7', 
                          color: '#d97706',
                          border: '1.5px solid #fde68a',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                        title="點擊直接設為已完工"
                      >
                        正在施工中 (點擊完工)
                      </button>
                    )}
                    {customer.status === 'deposit' && (
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 'bold', 
                        background: '#ffedd5', 
                        color: '#c2410c',
                        border: '1.5px solid #fed7aa',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        已付定金
                      </span>
                    )}
                    {customer.status === 'scheduled' && (
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 'bold', 
                        background: '#f3e8ff', 
                        color: '#7e22ce',
                        border: '1.5px solid #e9d5ff',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        已預約排程
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{customer.phone}</div>
                </div>

                {/* 3. 車輛資訊 */}
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{customer.brand} {customer.model}</div>
                </div>

                {/* 4. 原本預約日期 (留車) */}
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{customer.expectedStartDate || '—'}</div>

                {/* 6. 實際完工日期 */}
                <div onClick={(e) => e.stopPropagation()}>
                  <input type="date" value={customer.deliveryDate || ''} onChange={(e) => onUpdate({...customer, deliveryDate: e.target.value})} style={{ fontSize: '0.85rem', padding: '4px 6px', border: '1px solid transparent', borderRadius: '6px', color: '#ec4899', fontWeight: '800', background: 'transparent', cursor: 'pointer', outline: 'none' }} onFocus={(e) => { e.target.style.border = '1px solid #fbcfe8'; e.target.style.background = '#fdf2f8'; }} onBlur={(e) => { e.target.style.border = '1px solid transparent'; e.target.style.background = 'transparent'; }} />
                </div>

                {/* 7. 施工項目與備註 */}
                <div style={{ paddingRight: '20px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {customer.mainServiceBrand} - {customer.filmColor}
                    {customer.rearCoating && <span style={{ color: '#0369a1', marginLeft: '8px' }}>(+ {customer.rearCoating})</span>}
                    {customer.hasHoodPpf && <span style={{ color: '#7c3aed', marginLeft: '8px' }}>(+ 引擎蓋犀牛皮)</span>}
                  </div>
                  {customer.notes && <div className="text-truncate" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{customer.notes}</div>}
                </div>

                {/* 8. 操作 */}
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '15px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteCustomer(customer.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '5px', transition: 'color 0.2s' }}
                    className="delete-btn-hover"
                    title="刪除檔案"
                  >
                    <Trash2 size={20} />
                  </button>
                  {isExpanded ? <ChevronUp size={24} color="var(--primary)" /> : <ChevronDown size={24} color="#cbd5e1" />}
                </div>
              </div>

              {/* ── Expanded Detail Panel ── */}
              {isExpanded && (
                <div style={{ padding: '0 24px 24px', borderTop: '2px solid #eff6ff', background: '#fafcff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '32px', paddingTop: '24px' }}>

                    {/* Col 1: 施工與項目 */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                      <Section icon={<ShieldCheck size={18} />} title="施工訂購明細" color="var(--primary)">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <InfoRow label="主施工項目" value={customer.mainService} />
                          <InfoRow label="膜料顏色" value={customer.filmColor} />
                          <InfoRow label="品牌/等級" value={customer.mainServiceBrand} />
                          <InfoRow label="膜料貨號" value={customer.materialCode} />
                        </div>
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                           <InfoRow label="隔熱紙項目" value={customer.windowTint} />
                           {customer.windowTintBrand && <InfoRow label="隔熱紙品牌" value={customer.windowTintBrand} />}
                           <InfoRow label="電子後視鏡" value={customer.digitalMirror} />
                           <InfoRow label="電改項目" value={customer.electricMod} />
                        </div>
                      </Section>

                      {/* 施工過程檢核表 */}
                      <div style={{ marginTop: '20px' }}>
                        <Section icon={<ListChecks size={18} />} title="施工過程檢核 (標準 24 項)" color="#16a34a">
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                            {(customer.constructionChecklist || []).length > 0 ? customer.constructionChecklist?.map(item => (
                              <div key={item.id} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: item.checked ? '#166534' : '#64748b' }}>
                                {item.checked ? <CheckCircle2 size={12} color="#16a34a" /> : <Clock size={12} color="#cbd5e1" />}
                                <span style={{ fontWeight: item.checked ? '700' : '500' }}>{item.name}</span>
                              </div>
                            )) : <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>無檢核紀錄</div>}
                          </div>
                        </Section>
                      </div>

                      {customer.customAccessories && customer.customAccessories.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          <Section icon={<Package size={18} />} title="加裝配件" color="#6366f1">
                            {customer.customAccessories.map(acc => (
                              <InfoRow key={acc.id} label={acc.name} value={acc.price ? `$ ${acc.price.toLocaleString()}` : '—'} />
                            ))}
                          </Section>
                        </div>
                      )}



                      {/* 客戶習性與特徵 (新增) */}
                      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #f1f5f9' }}>
                        <Section icon={<UserCheck size={18} />} title="完整客戶習性觀察" color="#ec4899">
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <InfoRow label="告知管道" value={customer.fromChannel} />
                            <InfoRow label="工作地點" value={customer.location} />
                            <InfoRow label="職業" value={customer.occupation} />
                            <InfoRow label="興趣" value={customer.hobbies} />
                            <InfoRow label="同行狀態" value={customer.companion ? companions[customer.companion] : ''} />
                            <InfoRow label="性格屬性" value={customer.personality === 'introvert' ? '內向' : customer.personality === 'extrovert' ? '外向' : ''} />
                            <InfoRow label="經濟預算" value={customer.wealthLevel === 'high' ? '非常有錢' : customer.wealthLevel === 'medium' ? '中產家庭' : customer.wealthLevel === 'normal' ? '一般小資' : ''} />
                            <InfoRow label="方便聯絡" value={customer.convenientTime === 'weekday' ? '平日' : customer.convenientTime === 'weekend' ? '假日' : ''} />
                            <InfoRow label="體型外觀" value={customer.bodyType === 'slim' ? '瘦' : customer.bodyType === 'average' ? '中等' : customer.bodyType === 'heavy' ? '偏胖' : ''} />
                            <InfoRow label="髮型長度" value={customer.hairLength === 'short' ? '短髮' : customer.hairLength === 'medium' ? '中長' : customer.hairLength === 'long' ? '長髮' : ''} />
                          </div>
                          <div style={{ display: 'flex', gap: '15px', marginTop: '12px', background: '#fff1f2', padding: '8px 12px', borderRadius: '8px' }}>
                            {customer.detailOriented && <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 'bold' }}>#在意細節</span>}
                            {customer.easyGoing && <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 'bold' }}>#好相處</span>}
                            {customer.likesCalls && <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 'bold' }}>#喜歡電話</span>}
                            {customer.wearsGlasses && <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 'bold' }}>#戴眼鏡</span>}
                          </div>
                        </Section>
                      </div>
                    </div>

                    {/* Col 2: 售後追蹤與照片 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Section icon={<CheckCircle2 size={18} />} title="售後與交付狀態" color="#10b981">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                            <ToggleBadge ok={customer.giftGiven} label="大禮包交付" onToggle={() => toggle(customer, 'giftGiven')} />
                            <ToggleBadge ok={customer.formSent} label="表單+注意事項" onToggle={() => toggle(customer, 'formSent')} />
                            <ToggleBadge ok={customer.photosSent} label="完工照傳送" onToggle={() => toggle(customer, 'photosSent')} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                             <ToggleBadge ok={customer.followUp2Weeks} label="2週穏定度追蹤" onToggle={() => toggle(customer, 'followUp2Weeks')} />
                             <ToggleBadge ok={customer.followUp6Months} label="6個月健檢提醒" onToggle={() => toggle(customer, 'followUp6Months')} />
                             <ToggleBadge ok={customer.followUp1Year} label="1年活動邀約" onToggle={() => toggle(customer, 'followUp1Year')} />
                          </div>
                        </Section>
                      </div>

                      {/* 施工照片區 (新增) */}
                      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Section icon={<Camera size={18} />} title="車體受損/原樣紀錄" color="#f59e0b">
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
                             {(customer.damagePhotos || []).length > 0 ? customer.damagePhotos?.map((p, i) => (
                               <div key={i} style={{ position: 'relative' }}>
                                 <img src={p.url} alt="damage" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'zoom-in' }} onClick={() => window.open(p.url)} />
                                 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', textAlign: 'center', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}>{p.category}</div>
                               </div>
                             )) : <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>無影像紀錄</div>}
                           </div>
                        </Section>
                        <div style={{ marginTop: '20px' }}>
                           <Section icon={<ImageIcon size={18} />} title="施工與完工美照" color="#3b82f6">
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
                                {(customer.progressPhotos || []).length > 0 ? customer.progressPhotos?.map((p, i) => (
                                  <div key={i} style={{ position: 'relative' }}>
                                    <img src={p.url} alt="progress" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'zoom-in' }} onClick={() => window.open(p.url)} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', textAlign: 'center', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}>{p.category}</div>
                                  </div>
                                )) : <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>無影像紀錄</div>}
                              </div>
                           </Section>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: 財務與備註 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                       {customer.pendingItems && (
                        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '2px solid #fca5a5' }}>
                          <Section icon={<AlertCircle size={18} />} title="待辦事項 (追蹤中)" color="#ef4444">
                            <div style={{ fontSize: '0.9rem', color: '#991b1b', fontWeight: 'bold', lineHeight: 1.5 }}>
                              {customer.pendingItems}
                            </div>
                          </Section>
                        </div>
                      )}

                        <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          <Section icon={<DollarSign size={18} />} title="帳務資訊" color="#059669">
                            <InfoRow label="總成交金額" value={customer.totalAmount ? `$ ${customer.totalAmount.toLocaleString()}` : '—'} />
                            <InfoRow label="成本支出" value={customer.cost ? `$ ${customer.cost.toLocaleString()}` : '—'} />
                            {customer.appliedDiscountName && (
                              <div style={{ marginTop: '10px', padding: '10px', background: '#fdf2f8', borderRadius: '8px', fontSize: '0.8rem', color: '#be185d', fontWeight: '600' }}>
                                套用優惠: {customer.appliedDiscountName}
                              </div>
                            )}
                          </Section>
                        </div>

                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <Section icon={<FileText size={18} />} title="最後結案備註" color="#475569">
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                             {customer.notes || '無相關客戶習性記錄'}
                          </p>
                        </Section>
                      </div>

                      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Section icon={<Calendar size={18} />} title="關鍵日期紀錄" color="#3b82f6">
                          <InfoRow label="完工交車日期" value={customer.deliveryDate} />
                          <InfoRow label="實際施工期間" value={customer.constructionStartDate && customer.constructionEndDate ? `${customer.constructionStartDate} ~ ${customer.constructionEndDate}` : customer.constructionStartDate || customer.constructionEndDate || ''} />
                          <InfoRow label="下次檢查/回廠" value={customer.checkupDate} />
                          <InfoRow label="原本施工日期" value={customer.expectedStartDate} />
                        </Section>
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(customer); }} 
                        className="btn btn-primary" 
                        style={{ width: '100%', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                      >
                        <Save size={18} /> 編輯檔案 / 修改日期
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>找不到符合條件的完工檔案</p>
          </div>
        )}
      </div>

      {renderPagination()}
    </div>
  );
};
