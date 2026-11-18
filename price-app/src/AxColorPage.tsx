import React, { useState } from 'react';
import { Search, Palette, Layers } from 'lucide-react';
import axColorsData from './data/axColors2026.json';

export const AxColorPage: React.FC = () => {
  const [colorSearch, setColorSearch] = useState('');
  const [selectedColorSize, setSelectedColorSize] = useState<string>('M');

  const axColors = axColorsData as Array<{
    seq: number; series: string; seriesLabel: string;
    code: string; englishName: string; colorName: string;
    basePrice: number; extraPrice: number;
  }>;

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const BASE_COLOR_PRICES: Record<string, number> = {
    'XS': 60000, 'S': 60000, 'M': 65000, 'L': 70000, 'XL': 75000, '2XL': 80000
  };

  const filteredColors = colorSearch.trim().length >= 1
    ? axColors.filter(c => {
        const q = colorSearch.toLowerCase();
        return c.colorName.toLowerCase().includes(q) ||
          c.englishName.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.series.toLowerCase().includes(q);
      }).slice(0, 30)
    : [];

  const seriesBadgeColor: Record<string, { bg: string; text: string }> = {
    'E系列': { bg: '#eff6ff', text: '#2563eb' },
    'G-漸變系列': { bg: '#f0fdf4', text: '#16a34a' },
    'T-特調系列': { bg: '#fdf4ff', text: '#9333ea' },
    'V系列': { bg: '#fff7ed', text: '#ea580c' },
  };

  const extraLabel = (extra: number) => {
    if (extra === 0) return { label: '標準', color: '#64748b', bg: '#f1f5f9' };
    if (extra === 3000) return { label: '+3000', color: '#0369a1', bg: '#e0f2fe' };
    if (extra === 5000) return { label: '+5000', color: '#15803d', bg: '#dcfce7' };
    if (extra === 8000) return { label: '+8000', color: '#7c2d12', bg: '#fef3c7' };
    return { label: `+${extra}`, color: '#64748b', bg: '#f1f5f9' };
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <Layers size={32} color="#fb923c" /> AX 2026 EV 顏色查價
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>輸入膜料顏色名稱、編號或英文，即可查看各尺寸施工價格</p>
      </div>

      {/* 搜尋框 */}
      <div style={{ maxWidth: '560px', margin: '0 auto 24px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '12px 18px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <Search size={20} color="#94a3b8" />
          <input
            type="text"
            placeholder="搜尋顏色名稱、編號或英文（例如：薔薇粉、E-E-109）"
            value={colorSearch}
            onChange={e => setColorSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem', color: '#1e293b', background: 'transparent' }}
          />
          {colorSearch && (
            <button onClick={() => setColorSearch('')} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', color: '#64748b', fontSize: '0.8rem' }}>清除</button>
          )}
        </div>
      </div>

      {/* 尺寸選擇 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b', alignSelf: 'center', marginRight: '4px' }}>選擇車型尺寸：</span>
        {SIZES.map(s => (
          <button
            key={s}
            onClick={() => setSelectedColorSize(s)}
            style={{
              padding: '6px 16px', borderRadius: '20px',
              border: `2px solid ${selectedColorSize === s ? '#fb923c' : '#e2e8f0'}`,
              background: selectedColorSize === s ? '#fb923c' : '#fff',
              color: selectedColorSize === s ? '#fff' : '#475569',
              fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >{s}</button>
        ))}
      </div>

      {/* 搜尋結果 */}
      {colorSearch.trim().length >= 1 && (
        <div>
          {filteredColors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', animation: 'fadeIn 0.3s ease-out' }}>
              <Palette size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <div style={{ fontWeight: 'bold' }}>找不到相符顏色</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>試試輸入顏色中文名、英文或編號</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', animation: 'fadeIn 0.3s ease-out' }}>
              {filteredColors.map((c, i) => {
                const baseForSize = BASE_COLOR_PRICES[selectedColorSize] || 65000;
                const finalPrice = baseForSize + c.extraPrice;
                const extra = extraLabel(c.extraPrice);
                const badge = seriesBadgeColor[c.series] || { bg: '#f8fafc', text: '#64748b' };
                return (
                  <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#1e293b', marginBottom: '2px' }}>{c.colorName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.englishName}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ background: badge.bg, color: badge.text, padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>{c.seriesLabel || c.series}</span>
                        {c.extraPrice > 0 && (
                          <span style={{ background: extra.bg, color: extra.color, padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>{extra.label}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '10px', padding: '10px 14px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        <div>編號：<strong style={{ color: '#1e293b' }}>{c.code}</strong></div>
                        <div style={{ marginTop: '2px' }}>尺寸 <strong>{selectedColorSize}</strong> 報價</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fb923c', lineHeight: 1 }}>${finalPrice.toLocaleString()}</div>
                        {c.extraPrice > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>底價 ${baseForSize.toLocaleString()} + 附加 ${c.extraPrice.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    {/* 各尺寸速查 */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {SIZES.map(sz => {
                        const p = (BASE_COLOR_PRICES[sz] || 65000) + c.extraPrice;
                        const isSelected = sz === selectedColorSize;
                        return (
                          <div key={sz} onClick={() => setSelectedColorSize(sz)} style={{ flex: '1', minWidth: '48px', textAlign: 'center', padding: '5px 2px', borderRadius: '8px', background: isSelected ? '#fff7ed' : '#f8fafc', border: `1px solid ${isSelected ? '#fb923c' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>{sz}</div>
                            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: isSelected ? '#fb923c' : '#475569' }}>${(p/1000).toFixed(0)}K</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 預設提示 */}
      {colorSearch.trim().length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
          <Palette size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <div style={{ fontWeight: 'bold', color: '#94a3b8', fontSize: '1rem' }}>共收錄 {axColors.length} 個 AX 2026 EV 系列顏色</div>
          <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '6px' }}>E系列、G漸變、T特調、V液態金屬 — 輸入關鍵字即可查詢</div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
