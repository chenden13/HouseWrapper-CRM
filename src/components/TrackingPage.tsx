import React, { useMemo } from 'react';
import { 
  Users, Calendar, CheckCircle2, AlertCircle, Search, 
  ChevronRight, Phone, Car, Tag, Clock, Check, ListChecks
} from 'lucide-react';
import type { Customer } from '../types';

interface TrackingPageProps {
  customers: Customer[];
  onUpdateCustomer: (customer: Customer) => Promise<void>;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ customers, onUpdateCustomer }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  // 輔助函式：標準化日期字串
  const normalizeDate = (d: string | undefined): string => {
    if (!d) return '';
    // 處理可能的雜訊 (如 2026-2-5.6 -> 2026-2-5)
    const firstPart = d.split('.')[0].trim();
    const parts = firstPart.split(/[-/]/);
    if (parts.length < 3) return firstPart;
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // 過濾出完工客戶並排序
  const trackingData = useMemo(() => {
    return customers
      .filter(c => c.status === 'completed')
      .filter(c => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          String(c.name || '').toLowerCase().includes(lowerSearch) || 
          String(c.phone || '').toLowerCase().includes(lowerSearch) || 
          String(c.plateNumber || '').toLowerCase().includes(lowerSearch) ||
          String(c.model || '').toLowerCase().includes(lowerSearch) ||
          String(c.filmColor || '').toLowerCase().includes(lowerSearch)
        );
      })
      .sort((a, b) => {
        // 使用與完工檔案一致的日期優先順序
        const dateAStr = normalizeDate(a.deliveryDate || a.constructionStartDate || a.expectedEndDate || a.expectedStartDate || '');
        const dateBStr = normalizeDate(b.deliveryDate || b.constructionStartDate || b.expectedEndDate || b.expectedStartDate || '');
        
        if (!dateAStr && dateBStr) return 1;
        if (dateAStr && !dateBStr) return -1;
        if (!dateAStr && !dateBStr) return 0;

        return dateBStr.localeCompare(dateAStr);
      });
  }, [customers, searchTerm]);

  const handleToggleFollowUp = async (customer: Customer, field: keyof Customer) => {
    const isNowDone = !customer[field];
    let updated = { ...customer, [field]: isNowDone };

    // 如果是勾選「完成」，自動補齊之前的步驟
    if (isNowDone) {
      const steps = ['formSent', 'followUp2Weeks', 'followUp6Months', 'followUp1Year'];
      const currentIndex = steps.indexOf(field as string);
      if (currentIndex !== -1) {
        for (let i = 0; i < currentIndex; i++) {
          (updated as any)[steps[i]] = true;
        }
      }
    }

    await onUpdateCustomer(updated);
  };

  const handleUpdateNote = async (customer: Customer, note: string) => {
    if (customer.notes === note) return;
    const updated = { ...customer, notes: note };
    await onUpdateCustomer(updated);
  };

  const getStatusInfo = (customer: Customer, isDone: boolean | undefined, days: number) => {
    // 優先順序與排序一致
    const dateStrRaw = customer.deliveryDate || customer.constructionStartDate || customer.expectedEndDate || customer.expectedStartDate;
    if (!dateStrRaw) return { needsAttention: false, dateStr: '無日期', isDue: false };
    
    const normalized = normalizeDate(dateStrRaw);
    const delivery = new Date(normalized);
    
    if (isNaN(delivery.getTime())) {
      return { needsAttention: false, dateStr: '格式錯誤', isDue: false };
    }

    const targetDate = new Date(delivery.getTime() + days * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const dateStr = targetDate.toISOString().split('T')[0];
    const isDue = now >= targetDate;
    
    return {
      needsAttention: isDue && !isDone,
      dateStr,
      isDue
    };
  };

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateProgress, setUpdateProgress] = React.useState({ current: 0, total: 0 });

  const handleBatchUpdatePreviousSteps = async () => {
    const steps = ['formSent', 'followUp2Weeks', 'followUp6Months', 'followUp1Year'];
    
    const targets = customers.filter(c => {
      if (c.status !== 'completed') return false;
      for (let i = 1; i < steps.length; i++) {
        if (c[steps[i] as keyof Customer]) {
          for (let j = 0; j < i; j++) {
            if (!c[steps[j] as keyof Customer]) return true;
          }
        }
      }
      return false;
    });

    if (targets.length === 0) {
      alert('目前所有客戶的追蹤步驟皆已邏輯一致，無須補齊。');
      return;
    }

    if (!window.confirm(`偵測到 ${targets.length} 位客戶有「跳階追蹤」的情況（後續已勾但前置未勾），是否自動補齊？\n此動作可能需要一點時間。`)) return;

    setIsUpdating(true);
    setUpdateProgress({ current: 0, total: targets.length });

    try {
      let count = 0;
      for (const customer of targets) {
        let updated = { ...customer };
        for (let i = 1; i < steps.length; i++) {
          if (customer[steps[i] as keyof Customer]) {
            for (let j = 0; j < i; j++) {
              (updated as any)[steps[j]] = true;
            }
          }
        }
        await onUpdateCustomer(updated);
        count++;
        setUpdateProgress({ current: count, total: targets.length });
      }
      alert(`✅ 批量補齊完成！共更新 ${targets.length} 筆資料。`);
    } catch (err) {
      console.error('批量更新失敗:', err);
      alert('更新過程中發生錯誤，部分資料可能未同步。');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '100%', margin: '0' }}>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={28} color="var(--primary)" /> 售後追蹤專區
            <span style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', color: '#64748b', fontWeight: 'bold', marginLeft: '10px' }}>
              共 {trackingData.length} 位客戶
            </span>
          </h2>
          <button 
            onClick={handleBatchUpdatePreviousSteps}
            disabled={isUpdating}
            style={{ 
              background: isUpdating ? '#f1f5f9' : '#f8fafc', 
              border: '1px solid #e2e8f0', 
              padding: '8px 16px', 
              borderRadius: '10px', 
              fontSize: '0.8rem', 
              fontWeight: 'bold', 
              color: isUpdating ? '#94a3b8' : '#64748b',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              boxShadow: isUpdating ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {isUpdating ? (
              <>
                <div className="animate-spin" style={{ width: '12px', height: '12px', border: '2px solid #cbd5e1', borderTopColor: '#64748b', borderRadius: '50%' }} />
                更新中 ({updateProgress.current}/{updateProgress.total})
              </>
            ) : (
              <>
                <ListChecks size={16} /> 自動補齊前置步驟
              </>
            )}
          </button>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
          <input 
            type="text" 
            placeholder="快速搜尋客戶..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '10px 12px 10px 36px', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0', 
              width: '280px',
              fontSize: '0.85rem'
            }} 
          />
        </div>
      </header>

      <div className="glass-panel" style={{ overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left', fontSize: '0.85rem', tableLayout: 'fixed' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '15px 12px', color: '#64748b', fontWeight: '800', width: '130px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>客戶 / 車輛</th>
                <th style={{ padding: '15px 12px', color: '#64748b', fontWeight: '800', width: '100px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>完工日期</th>
                <th style={{ padding: '15px 12px', color: '#64748b', fontWeight: '800', width: '120px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>健檢時間</th>
                <th style={{ padding: '15px 12px', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '110px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>表單+注意事項</th>
                <th style={{ padding: '15px 12px', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '75px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>2週</th>
                <th style={{ padding: '15px 12px', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '75px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>6個月</th>
                <th style={{ padding: '15px 12px', color: '#64748b', fontWeight: '800', textAlign: 'center', width: '75px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>1年</th>
                <th style={{ padding: '15px 12px', color: '#64748b', fontWeight: '800', width: '150px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>追蹤備註</th>
              </tr>
            </thead>
            <tbody>
              {trackingData.map(customer => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.9rem' }}>{customer.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={10} /> {customer.phone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Car size={10} /> {customer.plateNumber}</div>
                      {customer.filmColor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1', fontWeight: '800' }}>
                          <Tag size={10} /> {customer.filmColor}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '700', color: '#334155', fontSize: '0.8rem' }}>
                      {normalizeDate(customer.deliveryDate || customer.constructionStartDate || customer.expectedEndDate || customer.expectedStartDate) || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <input 
                      type="date" 
                      value={customer.checkupDate || ''} 
                      onChange={(e) => {
                        onUpdateCustomer({ ...customer, checkupDate: e.target.value });
                      }}
                      style={{ 
                        fontSize: '0.8rem', 
                        padding: '4px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '6px', 
                        width: '120px', 
                        color: '#0f172a',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }} 
                    />
                  </td>

                  {[
                    { label: '表單+注意事項', days: 1, field: 'formSent' },
                    { label: '2週', days: 14, field: 'followUp2Weeks' },
                    { label: '6個月', days: 180, field: 'followUp6Months' },
                    { label: '1年', days: 365, field: 'followUp1Year' }
                  ].map(step => {
                    const status = getStatusInfo(customer, customer[step.field as keyof Customer] as boolean, step.days);
                    const isDone = customer[step.field as keyof Customer];
                    
                    return (
                      <td key={step.field} style={{ padding: '6px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleFollowUp(customer, step.field as keyof Customer)}
                          style={{
                            width: '100%',
                            padding: '6px 2px',
                            borderRadius: '8px',
                            border: '1px solid',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            transition: 'all 0.2s',
                            background: isDone ? '#ecfdf5' : (status.needsAttention ? '#fff1f2' : '#fff'),
                            borderColor: isDone ? '#10b981' : (status.needsAttention ? '#f43f5e' : '#e2e8f0'),
                            color: isDone ? '#047857' : (status.needsAttention ? '#e11d48' : '#64748b'),
                            opacity: (!isDone && !status.isDue) ? 0.6 : 1
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 'bold', fontSize: '0.72rem' }}>
                            {isDone ? <Check size={11} /> : (status.needsAttention ? <AlertCircle size={11} className="animate-pulse" /> : <Clock size={11} />)}
                            {isDone ? '完成' : (status.needsAttention ? '聯繫' : '未到')}
                          </div>
                          <div style={{ fontSize: '0.62rem', opacity: 0.8 }}>{status.dateStr.slice(5)}</div>
                        </button>
                      </td>
                    );
                  })}

                  <td style={{ padding: '8px 12px' }}>
                    <textarea 
                      defaultValue={customer.notes || ''}
                      onBlur={(e) => handleUpdateNote(customer, e.target.value)}
                      placeholder="點擊輸入備註..."
                      rows={2}
                      style={{ 
                        width: '100%', 
                        fontSize: '0.75rem', 
                        color: '#475569',
                        border: '1px solid transparent',
                        background: 'transparent',
                        padding: '4px',
                        borderRadius: '4px',
                        resize: 'none',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid #e2e8f0';
                        e.target.style.background = '#fff';
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {trackingData.length === 0 && (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          <Users size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>目前沒有符合條件的客戶</div>
          <p style={{ fontSize: '0.9rem' }}>當施工狀態標記為「完工」後，客戶會自動顯示於此。</p>
        </div>
      )}


      <style dangerouslySetInnerHTML={{ __html: `
        .hover-row:hover { background-color: #f8fafc !important; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      ` }} />
    </div>
  );
};
