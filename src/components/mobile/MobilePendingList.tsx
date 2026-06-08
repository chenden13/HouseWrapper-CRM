import React, { useState } from 'react';
import { Search, Clock, ChevronRight, Hash, Calendar, Phone, Trash2, Plus } from 'lucide-react';
import type { Customer } from '../../types';

interface MobilePendingListProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddNew: () => void;
  onBack: () => void;
}

export const MobilePendingList: React.FC<MobilePendingListProps> = ({ customers, onEditCustomer, onDeleteCustomer, onAddNew, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const pendingCustomers = customers.filter(c => {
    if (!['deposit', 'scheduled'].includes(c.status)) return false;

    const name = String(c.name || '').toLowerCase();
    const plate = String(c.plateNumber || '').toLowerCase();
    const phone = String(c.phone || '').toLowerCase();
    const brand = String(c.brand || '').toLowerCase();
    const model = String(c.model || '').toLowerCase();
    const mainService = String(c.mainService || '').toLowerCase();
    const mainServiceBrand = String(c.mainServiceBrand || '').toLowerCase();
    const film = String(c.filmColor || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      name.includes(term) || 
      plate.includes(term) || 
      phone.includes(term) ||
      brand.includes(term) ||
      model.includes(term) ||
      mainService.includes(term) ||
      mainServiceBrand.includes(term) ||
      film.includes(term)
    );
  }).sort((a, b) => {
    const valA = a.constructionStartDate || a.expectedEndDate || a.expectedStartDate || '';
    const valB = b.constructionStartDate || b.expectedEndDate || b.expectedStartDate || '';
    if (!valA && valB) return 1;
    if (valA && !valB) return -1;
    return valA.localeCompare(valB);
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '16px' }}>
      <header style={{ marginBottom: '20px' }}>
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
        >
          ← 返回首頁
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={24} color="#f59e0b" /> 待施工排程
          </h2>
          <button 
            onClick={onAddNew}
            style={{ 
              background: 'var(--primary)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '8px 12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.2)'
            }}
          >
            <Plus size={18} /> 新增
          </button>
        </div>
      </header>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
        <input
          type="text"
          placeholder="搜尋車主、車牌或電話..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', background: '#fff' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {(() => {
          const getTodayStr = () => {
            const d = new Date();
            const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            const twTime = new Date(utc + (3600000 * 8));
            const y = twTime.getFullYear();
            const m = String(twTime.getMonth() + 1).padStart(2, '0');
            const day = String(twTime.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          };
          const todayStr = getTodayStr();

          return pendingCustomers.length > 0 ? pendingCustomers.map(customer => {
            const isCarInShop = customer.expectedStartDate && customer.expectedStartDate <= todayStr;
            
            const alerts: string[] = [];
            if (customer.expectedStartDate === todayStr) {
              alerts.push('今日進場留車');
            }
            if (customer.expectedEndDate === todayStr) {
              alerts.push('今日預計交車');
            }
            if (customer.windowTintDate === todayStr) {
              alerts.push(`今日隔熱紙施工 (${customer.windowTint || ''})`);
            }
            if (customer.digitalMirrorDate === todayStr) {
              alerts.push(`今日電子後視鏡安裝 (${customer.digitalMirror || ''})`);
            }
            if (customer.electricModDate === todayStr) {
              alerts.push(`今日電動改裝 (${customer.electricMod || ''})`);
            }
            if (customer.expectedEndDate && customer.expectedEndDate < todayStr) {
              alerts.push('已超出交車時間，請補齊資料轉進完工檔案');
            }

            return (
              <div 
                key={customer.id} 
                onClick={() => onEditCustomer(customer)}
                style={{ 
                  background: isCarInShop ? '#f0fdf4' : '#fff', 
                  borderRadius: '16px', 
                  padding: '16px', 
                  border: isCarInShop ? '1px solid #10b981' : '1px solid #e2e8f0', 
                  borderLeft: isCarInShop ? '5px solid #10b981' : '1px solid #e2e8f0',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteCustomer(customer.id); }}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                >
                  <Trash2 size={16} />
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingRight: '40px' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span>{customer.name}</span>
                      {isCarInShop && (
                        <span style={{ fontSize: '0.65rem', background: '#10b981', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                          🚗 現場已留車
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Phone size={12} /> {customer.phone}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{customer.plateNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{customer.model}</div>
                  </div>
                </div>

                {/* Date alerts */}
                {alerts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                    {alerts.map((al, alIdx) => (
                      <div key={alIdx} style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⚠️ {al}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', borderTop: '1px dashed #f1f5f9', paddingTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>施工時間</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#166534' }}>
                      {customer.constructionStartDate || '未定'}
                      {customer.constructionEndDate ? ` ~ ${customer.constructionEndDate.slice(5)}` : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>膜料顏色</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {customer.mainServiceBrand ? `${customer.mainServiceBrand} ` : ''}{customer.filmColor || '未填'}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>預計進場</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#0369a1' }}>{customer.expectedStartDate || '未定'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>預計交車</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#be185d' }}>
                      {customer.expectedEndDate || '未定'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                     {customer.quoteCreated && <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>報價單</span>}
                     {customer.materialOrdered && <span style={{ fontSize: '0.65rem', background: '#fff7ed', color: '#9a3412', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>已叫料</span>}
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" />
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              無相符的排程資料
            </div>
          );
        })()}
      </div>
    </div>
  );
};
