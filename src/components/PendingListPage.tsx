import React, { useState } from 'react';
import { 
  Search, Calendar, ChevronRight, FileUp, Plus, Clock, Hash, 
  CalendarCheck, Trash2, Hammer, Droplets, CheckCircle2,
  PackageCheck, FileText, ArrowUpDown
} from 'lucide-react';
import type { Customer, Role } from '../types';

interface PendingListPageProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  userRole?: Role;
  onImportClick?: () => void;
  onAddNew?: () => void;
}

export const PendingListPage: React.FC<PendingListPageProps> = ({ 
  customers, onEditCustomer, onUpdateCustomer, onDeleteCustomer, userRole, onImportClick, onAddNew 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Customer>('constructionStartDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  

  const scheduledCustomers = customers.filter(c => {
    if (!['deposit', 'scheduled'].includes(c.status)) return false;

    const name = String(c.name || '').toLowerCase();
    const phone = String(c.phone || '').toLowerCase();
    const plate = String(c.plateNumber || '').toLowerCase();
    const model = String(c.model || '').toLowerCase();
    const film = String(c.filmColor || '').toLowerCase();
    const brand = String(c.brand || '').toLowerCase();
    const mainService = String(c.mainService || '').toLowerCase();
    const mainServiceBrand = String(c.mainServiceBrand || '').toLowerCase();
    const id = String(c.id || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      name.includes(term) || 
      phone.includes(term) || 
      plate.includes(term) || 
      model.includes(term) ||
      film.includes(term) ||
      brand.includes(term) ||
      mainService.includes(term) ||
      mainServiceBrand.includes(term) ||
      id.includes(term)
    );
  });

  const toggleSort = (key: keyof Customer) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedScheduled = [...scheduledCustomers].sort((a, b) => {
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

    const getSortValue = (cust: Customer) => {
      if (sortKey === 'constructionStartDate') {
        return normalizeDate(cust.constructionStartDate || cust.expectedEndDate || cust.expectedStartDate || '');
      }
      if (sortKey === 'expectedEndDate') {
        return normalizeDate(cust.expectedEndDate || cust.expectedStartDate || '');
      }
      if (sortKey === 'expectedStartDate') {
        return normalizeDate(cust.expectedStartDate || cust.constructionStartDate || '');
      }
      if (sortKey === 'id') {
        // 針對 C-001 格式進行數字提取排序
        return String(cust.id || '').replace(/[^0-9]/g, '').padStart(10, '0');
      }
      return String(cust[sortKey as keyof Customer] || '');
    };

    let valA = getSortValue(a);
    let valB = getSortValue(b);

    if (!valA && valB) return 1;
    if (valA && !valB) return -1;
    if (!valA && !valB) return 0;

    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const totalBudgetSum = sortedScheduled.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '2000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar color="var(--accent)" size={24} /> 待施工排程總表
          </h2>
          <div style={{ background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
            <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 'bold' }}>待收款總額:</span>
            <span style={{ fontSize: '1.1rem', color: '#15803d', fontWeight: '900' }}>${totalBudgetSum.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '12px', background: 'var(--accent)' }} onClick={onAddNew}>
            <Plus size={18} /> 新增排程
          </button>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
            <input
              type="text"
              placeholder="搜尋名稱、車牌、編號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 15px 10px 40px', borderRadius: '12px', width: '250px', fontSize: '0.9rem', border: '1px solid #e2e8f0' }}
            />
          </div>
        </div>
      </header>

      <div className="glass-panel" style={{ borderRadius: '20px', overflowX: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ minWidth: '1750px' }}>
          {/* Table Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '60px 180px 1.2fr 130px 280px 130px 110px 115px 115px 105px 105px 85px',
            padding: '22px 25px',
            background: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
            fontWeight: '900',
            color: '#475569',
            fontSize: '0.88rem',
            textAlign: 'center'
          }}>
            <div onClick={() => toggleSort('id')} style={{ textAlign: 'left', cursor: 'pointer' }}>編號</div>
            <div style={{ textAlign: 'left' }}>客戶與車輛</div>
            <div style={{ textAlign: 'left' }}>施工項目</div>
            <div onClick={() => toggleSort('expectedStartDate')} style={{ cursor: 'pointer' }}>預計留車時間</div>
            <div onClick={() => toggleSort('constructionStartDate')} style={{ cursor: 'pointer' }}>預計施工時間(起~迄)</div>
            <div onClick={() => toggleSort('expectedEndDate')} style={{ cursor: 'pointer' }}>預計交車時間</div>
            <div>行事曆</div>
            <div>施工行程</div>
            <div>洗車安排</div>
            <div>報價單</div>
            <div>已叫料</div>
            <div>操作</div>
          </div>

          {/* Table Body */}
          <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {sortedScheduled.length > 0 ? sortedScheduled.map((customer, idx) => {
              return (
                <div 
                  key={customer.id} 
                  className="list-row"
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '60px 180px 1.2fr 130px 280px 130px 110px 115px 115px 105px 105px 85px',
                    alignItems: 'center',
                    padding: '22px 25px',
                    borderBottom: '1px solid #f1f5f9',
                    background: idx % 2 === 0 ? '#fff' : '#fcfcfc',
                    fontSize: '0.92rem',
                    transition: 'background 0.2s'
                  }}
                >
                  {/* 1. 編號 */}
                  <div style={{ fontWeight: '600', color: '#64748b', fontSize: '0.8rem' }}>
                    {String(customer.id).includes('無編號') || (String(customer.id).startsWith('c_') && String(customer.id).length > 10) ? '—' : (customer.id?.slice(-4) || '—')}
                  </div>

                  {/* 2. 客戶與車牌 */}
                  <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '15px' }}>
                    <div style={{ fontWeight: '900', color: '#1e293b' }}>{customer.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{customer.plateNumber} | {customer.model}</div>
                  </div>

                  {/* 3. 施工項目 */}
                  <div style={{ paddingRight: '20px' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>
                      {customer.mainService}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>{customer.filmColor}</div>
                  </div>

                  {/* 4. 預計留車時間 */}
                  <div style={{ textAlign: 'center' }}>
                    <input type="date" value={customer.expectedStartDate || ''} onChange={(e) => onUpdateCustomer({ ...customer, expectedStartDate: e.target.value })} style={{ fontSize: '0.85rem', padding: '5px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '120px', fontWeight: '700', color: '#0369a1' }} />
                  </div>

                  {/* 5. 預計施工時間 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '3px' }}>開始</span>
                      <input 
                        type="date" 
                        value={customer.constructionStartDate || ''} 
                        onChange={(e) => onUpdateCustomer({ ...customer, constructionStartDate: e.target.value })} 
                        style={{ fontSize: '0.85rem', padding: '5px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '115px', fontWeight: '700', color: '#166534' }} 
                      />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '15px' }}>至</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '3px' }}>結束</span>
                      <input 
                        type="date" 
                        value={customer.constructionEndDate || ''} 
                        onChange={(e) => onUpdateCustomer({ ...customer, constructionEndDate: e.target.value })} 
                        style={{ fontSize: '0.85rem', padding: '5px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '115px', fontWeight: '700', color: '#166534' }} 
                      />
                    </div>
                  </div>

                  {/* 6. 預計交車時間 */}
                  <div style={{ textAlign: 'center' }}>
                    <input type="date" value={customer.expectedEndDate || ''} onChange={(e) => onUpdateCustomer({ ...customer, expectedEndDate: e.target.value })} style={{ fontSize: '0.85rem', padding: '5px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '120px', fontWeight: '700', color: '#be185d' }} />
                  </div>

                  {/* 7. 行事曆 */}
                  <div style={{ padding: '0 6px' }}>
                    <div 
                      onClick={() => onUpdateCustomer({ ...customer, inCalendar: !customer.inCalendar })}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        padding: '10px 4px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '900',
                        background: customer.inCalendar ? '#ecfdf5' : '#fff',
                        border: `1px solid ${customer.inCalendar ? '#10b981' : '#e2e8f0'}`,
                        color: customer.inCalendar ? '#065f46' : '#64748b',
                        boxShadow: customer.inCalendar ? '0 2px 5px rgba(16, 185, 129, 0.1)' : 'none'
                      }}
                    >
                      <CalendarCheck size={15} style={{ marginRight: '5px' }} /> 行事曆
                    </div>
                  </div>

                  {/* 8. 施工行程 */}
                  <div style={{ padding: '0 6px' }}>
                    <div 
                      onClick={() => onUpdateCustomer({ ...customer, inConstructionSchedule: !customer.inConstructionSchedule })}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        padding: '10px 4px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '900',
                        background: customer.inConstructionSchedule ? '#fdf4ff' : '#fff',
                        border: `1px solid ${customer.inConstructionSchedule ? '#a855f7' : '#e2e8f0'}`,
                        color: customer.inConstructionSchedule ? '#7e22ce' : '#64748b',
                        boxShadow: customer.inConstructionSchedule ? '0 2px 5px rgba(168, 85, 247, 0.1)' : 'none'
                      }}
                    >
                      <Hammer size={15} style={{ marginRight: '5px' }} /> 施工行程
                    </div>
                  </div>

                  {/* 9. 洗車安排 */}
                  <div style={{ padding: '0 6px' }}>
                    <div 
                      onClick={() => onUpdateCustomer({ ...customer, inWashSchedule: !customer.inWashSchedule })}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        padding: '10px 4px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '900',
                        background: customer.inWashSchedule ? '#f0fdfa' : '#fff',
                        border: `1px solid ${customer.inWashSchedule ? '#14b8a6' : '#e2e8f0'}`,
                        color: customer.inWashSchedule ? '#0d9488' : '#64748b',
                        boxShadow: customer.inWashSchedule ? '0 2px 5px rgba(20, 184, 166, 0.1)' : 'none'
                      }}
                    >
                      <Droplets size={15} style={{ marginRight: '5px' }} /> 洗車安排
                    </div>
                  </div>

                  {/* 10. 報價單 */}
                  <div style={{ padding: '0 6px' }}>
                    <div 
                      onClick={() => onUpdateCustomer({ ...customer, quoteCreated: !customer.quoteCreated })}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        padding: '10px 0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '900',
                        background: customer.quoteCreated ? '#eff6ff' : '#fff',
                        border: `1px solid ${customer.quoteCreated ? '#3b82f6' : '#e2e8f0'}`,
                        color: customer.quoteCreated ? '#1e40af' : '#64748b'
                      }}
                    >
                      <FileText size={15} style={{ marginRight: '5px' }} /> 報價單
                    </div>
                  </div>

                  {/* 11. 已叫料 */}
                  <div style={{ padding: '0 6px' }}>
                    <div 
                      onClick={() => onUpdateCustomer({ ...customer, materialOrdered: !customer.materialOrdered })}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        padding: '10px 0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '900',
                        background: customer.materialOrdered ? '#fff7ed' : '#fff',
                        border: `1px solid ${customer.materialOrdered ? '#f59e0b' : '#e2e8f0'}`,
                        color: customer.materialOrdered ? '#9a3412' : '#64748b'
                      }}
                    >
                      <PackageCheck size={15} style={{ marginRight: '5px' }} /> 已叫料
                    </div>
                  </div>

                  {/* 12. 操作 */}
                  <div style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => onEditCustomer(customer)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={20} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteCustomer(customer.id); }} style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                目前的範圍內沒有待施工的案件資料。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
