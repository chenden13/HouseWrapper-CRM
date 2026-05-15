import React, { useMemo, useState } from 'react';
import { 
  ClipboardList, Search, Clock, Check, 
  AlertCircle, Calendar, Info, Hash,
  CalendarCheck, Hammer, Droplets
} from 'lucide-react';
import type { Customer } from '../types';

interface PreparationPageProps {
  customers: Customer[];
  onUpdateCustomer: (customer: Customer) => Promise<void>;
}

export const PreparationPage: React.FC<PreparationPageProps> = ({ customers, onUpdateCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 輔助函式：標準化日期
  const normalizeDate = (d: string | undefined): string => {
    if (!d) return '';
    return d.split('.')[0].trim().replace(/\//g, '-');
  };

  // 判斷是否為 10 天內進場
  const isWithin10Days = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const date = new Date(normalizeDate(dateStr));
    if (isNaN(date.getTime())) return false;
    
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 10;
  };

  // 過濾出「待施工排程」中的客戶 (status === 'scheduled')
  const preparationData = useMemo(() => {
    return customers
      .filter(c => c.status === 'scheduled')
      .filter(c => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(lowerSearch) || 
          c.phone.toLowerCase().includes(lowerSearch) || 
          (c.plateNumber || '').toLowerCase().includes(lowerSearch) ||
          (c.model || '').toLowerCase().includes(lowerSearch) ||
          (c.id || '').toLowerCase().includes(lowerSearch)
        );
      })
      .sort((a, b) => {
        const dateA = normalizeDate(a.expectedStartDate || '');
        const dateB = normalizeDate(b.expectedStartDate || '');
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB);
      });
  }, [customers, searchTerm]);

  const handleToggle = async (customer: Customer, field: keyof Customer) => {
    const updated = { ...customer, [field]: !customer[field] };
    await onUpdateCustomer(updated);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '100%', margin: '0' }}>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={28} color="#f59e0b" /> 事前準備專區
            <span style={{ fontSize: '0.85rem', background: '#fef3c7', padding: '4px 12px', borderRadius: '20px', color: '#92400e', fontWeight: 'bold', marginLeft: '10px' }}>
              共 {preparationData.length} 件排程
            </span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>核對施工所需膜料、隔熱紙與配件到貨狀態</p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
          <input 
            type="text" 
            placeholder="搜尋姓名、車牌、編號..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '10px 12px 10px 36px', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0', 
              width: '320px',
              fontSize: '0.85rem'
            }} 
          />
        </div>
      </header>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', width: '160px', borderBottom: '1px solid #e2e8f0' }}>客戶 / 車輛</th>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', width: '110px', borderBottom: '1px solid #e2e8f0' }}>進場日期</th>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '100px', borderBottom: '1px solid #e2e8f0' }}>行事曆</th>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '100px', borderBottom: '1px solid #e2e8f0' }}>施工排程</th>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '100px', borderBottom: '1px solid #e2e8f0' }}>洗車排程</th>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '120px', borderBottom: '1px solid #e2e8f0' }}>1. 膜料準備</th>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '120px', borderBottom: '1px solid #e2e8f0' }}>2. 隔熱紙預約</th>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '120px', borderBottom: '1px solid #e2e8f0' }}>3. 電子鏡安裝</th>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '120px', borderBottom: '1px solid #e2e8f0' }}>4. 配件備料</th>
                <th style={{ padding: '15px', background: '#f8fafc', color: '#64748b', fontWeight: '800', width: '200px', borderBottom: '1px solid #e2e8f0' }}>重要施工備註</th>
              </tr>
            </thead>
            <tbody>
              {preparationData.map(customer => {
                const isDueSoon = isWithin10Days(customer.expectedStartDate);
                
                return (
                  <tr key={customer.id} style={{ 
                    background: isDueSoon ? '#fffbeb' : '#fff',
                    transition: 'all 0.2s'
                  }} className="hover-row">
                    {/* 客戶資訊 */}
                    <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Hash size={12} color="#94a3b8" /> {customer.id?.slice(-4) || '—'}
                      </div>
                      <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1rem' }}>{customer.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        {customer.plateNumber || '尚未掛牌'} | {customer.model}
                      </div>
                    </td>

                    {/* 進場日期 */}
                    <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: '700', color: isDueSoon ? '#b45309' : '#334155', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {customer.expectedStartDate?.slice(5) || '未定'}
                        </div>
                        {isDueSoon && (
                          <span style={{ fontSize: '0.65rem', background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '4px', width: 'fit-content', fontWeight: '800' }}>即將進場</span>
                        )}
                      </div>
                    </td>

                    {/* 行事曆 */}
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => handleToggle(customer, 'inCalendar')}
                        style={{
                          width: '100%', padding: '8px 4px', borderRadius: '8px', border: '1px solid',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all 0.2s',
                          background: customer.inCalendar ? '#f0f9ff' : '#fff',
                          borderColor: customer.inCalendar ? '#0ea5e9' : '#e2e8f0',
                          color: customer.inCalendar ? '#0369a1' : '#64748b'
                        }}
                      >
                        {customer.inCalendar ? <CalendarCheck size={16} /> : <Calendar size={16} />}
                        <span style={{ fontWeight: 'bold', fontSize: '0.72rem' }}>{customer.inCalendar ? '已加入' : '未加入'}</span>
                      </button>
                    </td>

                    {/* 施工排程 */}
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => handleToggle(customer, 'inConstructionSchedule')}
                        style={{
                          width: '100%', padding: '8px 4px', borderRadius: '8px', border: '1px solid',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all 0.2s',
                          background: customer.inConstructionSchedule ? '#fdf4ff' : '#fff',
                          borderColor: customer.inConstructionSchedule ? '#a855f7' : '#e2e8f0',
                          color: customer.inConstructionSchedule ? '#7e22ce' : '#64748b'
                        }}
                      >
                        {customer.inConstructionSchedule ? <Hammer size={16} /> : <Hammer size={16} style={{ opacity: 0.3 }} />}
                        <span style={{ fontWeight: 'bold', fontSize: '0.72rem' }}>{customer.inConstructionSchedule ? '已加入' : '未加入'}</span>
                      </button>
                    </td>

                    {/* 洗車排程 */}
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => handleToggle(customer, 'inWashSchedule')}
                        style={{
                          width: '100%', padding: '8px 4px', borderRadius: '8px', border: '1px solid',
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all 0.2s',
                          background: customer.inWashSchedule ? '#f0fdfa' : '#fff',
                          borderColor: customer.inWashSchedule ? '#14b8a6' : '#e2e8f0',
                          color: customer.inWashSchedule ? '#0d9488' : '#64748b'
                        }}
                      >
                        {customer.inWashSchedule ? <Droplets size={16} /> : <Droplets size={16} style={{ opacity: 0.3 }} />}
                        <span style={{ fontWeight: 'bold', fontSize: '0.72rem' }}>{customer.inWashSchedule ? '已加入' : '未加入'}</span>
                      </button>
                    </td>

                    {/* 1. 膜料叫貨 */}
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: '800', lineHeight: '1.2' }}>
                          {customer.mainService}
                          <div style={{ color: '#0369a1', fontSize: '0.7rem' }}>
                            {customer.mainServiceBrand} {customer.filmColor}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle(customer, 'materialOrdered')}
                          style={{
                            width: '90%', padding: '6px 4px', borderRadius: '8px', border: '1px solid',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s',
                            background: customer.materialOrdered ? '#ecfdf5' : '#fff',
                            borderColor: customer.materialOrdered ? '#10b981' : '#e2e8f0',
                            color: customer.materialOrdered ? '#047857' : '#64748b'
                          }}
                        >
                          {customer.materialOrdered ? <Check size={14} /> : <Clock size={14} />}
                          <span style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>{customer.materialOrdered ? '已叫貨' : '未叫貨'}</span>
                        </button>
                      </div>
                    </td>

                    {/* 2. 隔熱紙 */}
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      {customer.windowTint ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: '800', lineHeight: '1.2' }}>
                            {customer.windowTintBrand}
                            <div style={{ color: '#0ea5e9', fontSize: '0.7rem' }}>{customer.windowTint}</div>
                          </div>
                          <button
                            onClick={() => handleToggle(customer, 'tintPrepDone')}
                            style={{
                              width: '90%', padding: '6px 4px', borderRadius: '8px', border: '1px solid',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s',
                              background: customer.tintPrepDone ? '#ecfdf5' : '#fff1f2',
                              borderColor: customer.tintPrepDone ? '#10b981' : '#f43f5e',
                              color: customer.tintPrepDone ? '#047857' : '#e11d48'
                            }}
                          >
                            {customer.tintPrepDone ? <Check size={14} /> : <AlertCircle size={14} />}
                            <span style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>{customer.tintPrepDone ? '已約好' : '未預約'}</span>
                          </button>
                          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{customer.windowTintDate?.slice(5) || '未排'} {customer.windowTintScheduledTime || ''}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>不需施工</span>
                      )}
                    </td>

                    {/* 3. 電子鏡 */}
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      {customer.digitalMirror ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: '800', lineHeight: '1.2' }}>
                            {customer.digitalMirrorBrand}
                            <div style={{ color: '#8b5cf6', fontSize: '0.7rem' }}>{customer.digitalMirror}</div>
                          </div>
                          <button
                            onClick={() => handleToggle(customer, 'mirrorPrepDone')}
                            style={{
                              width: '90%', padding: '6px 4px', borderRadius: '8px', border: '1px solid',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s',
                              background: customer.mirrorPrepDone ? '#ecfdf5' : '#fff1f2',
                              borderColor: customer.mirrorPrepDone ? '#10b981' : '#f43f5e',
                              color: customer.mirrorPrepDone ? '#047857' : '#e11d48'
                            }}
                          >
                            {customer.mirrorPrepDone ? <Check size={14} /> : <AlertCircle size={14} />}
                            <span style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>{customer.mirrorPrepDone ? '已約好' : '未預約'}</span>
                          </button>
                          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{customer.digitalMirrorDate?.slice(5) || '未排'} {customer.digitalMirrorScheduledTime || ''}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>不需施工</span>
                      )}
                    </td>

                    {/* 4. 配件備料 */}
                    <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      {(customer.customAccessories || []).length > 0 || customer.electricMod ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.72rem', color: '#1e293b', fontWeight: '700', lineHeight: '1.2', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {customer.electricMod && <div style={{ color: '#ec4899' }}>{customer.electricModBrand || '電改項目'}</div>}
                            {customer.customAccessories?.map(a => <div key={a.id} style={{ color: '#d97706' }}>• {a.name}</div>)}
                          </div>
                          <button
                            onClick={() => handleToggle(customer, 'partsPrepDone')}
                            style={{
                              width: '90%', padding: '6px 4px', borderRadius: '8px', border: '1px solid',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s',
                              background: customer.partsPrepDone ? '#ecfdf5' : '#fff',
                              borderColor: customer.partsPrepDone ? '#10b981' : '#e2e8f0',
                              color: customer.partsPrepDone ? '#047857' : '#64748b'
                            }}
                          >
                            {customer.partsPrepDone ? <Check size={14} /> : <Clock size={14} />}
                            <span style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>{customer.partsPrepDone ? '已備齊' : '待備料'}</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>無其他配件</span>
                      )}
                    </td>

                    {/* 施工備註 */}
                    <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                        <div style={{ maxHeight: '70px', overflowY: 'auto', lineHeight: '1.4' }}>
                          {customer.notes ? (
                            <span style={{ whiteSpace: 'pre-wrap' }}>{customer.notes}</span>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>無特殊備註</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-row:hover { background-color: rgba(0,0,0,0.02) !important; }
      ` }} />
    </div>
  );
};
