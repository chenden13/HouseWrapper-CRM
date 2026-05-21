import React, { useState, useMemo } from 'react';
import { Search, Tag, CheckSquare, ShieldCheck, Zap, Info, ArrowRight, Palette, Sun, LayoutPanelTop, MonitorPlay, Video, Car, Droplets, Sparkles, Gem, Wind, Waves, Upload } from 'lucide-react';
import vehiclesData from '../data/vehicles.json';

interface Vehicle {
  brand: string;
  model: string;
  size: string;
}

interface PriceInquiryPageProps {
  vehicleMaster: any[];
  onBack?: () => void;
  initialMode?: 'detailing' | 'film';
}

const PRICING_MATRIX: { [key: string]: { colorChange: number; ppf: number; frontPpf: number; tint: string; mirror: string } } = {
  'XS': { colorChange: 45000, ppf: 85000, frontPpf: 35000, tint: '8000~12000', mirror: '6000' },
  'S':  { colorChange: 50000, ppf: 90000, frontPpf: 35000, tint: '9000~13000', mirror: '6000' },
  'M':  { colorChange: 55000, ppf: 95000, frontPpf: 35000, tint: '10000~15000', mirror: '6500' },
  'L':  { colorChange: 60000, ppf: 100000, frontPpf: 35000, tint: '12000~18000', mirror: '6500' },
  'XL': { colorChange: 65000, ppf: 105000, frontPpf: 40000, tint: '15000~22000', mirror: '7000' },
  '2XL':{ colorChange: 75000, ppf: 110000, frontPpf: 45000, tint: '18000~28000', mirror: '7500' },
  '3XL':{ colorChange: 85000, ppf: 125000, frontPpf: 50000, tint: '22000~35000', mirror: '8000' },
};

const DETAILING_PRICING: Record<string, { wash: number; interior: number; miniDetail: number; fullDetail: number; coating: number }> = {
  'XS': { wash: 500, interior: 1500, miniDetail: 3000, fullDetail: 6000, coating: 8000 },
  'S':  { wash: 600, interior: 1800, miniDetail: 3500, fullDetail: 7000, coating: 10000 },
  'M':  { wash: 700, interior: 2000, miniDetail: 4000, fullDetail: 8000, coating: 12000 },
  'L':  { wash: 800, interior: 2500, miniDetail: 5000, fullDetail: 10000, coating: 15000 },
  'XL': { wash: 1000, interior: 3000, miniDetail: 6000, fullDetail: 12000, coating: 18000 },
  '2XL':{ wash: 1200, interior: 3500, miniDetail: 7000, fullDetail: 14000, coating: 22000 },
  '3XL':{ wash: 1500, interior: 4000, miniDetail: 8000, fullDetail: 16000, coating: 25000 },
};

const PPF_PRICING: Record<string, Record<string, number>> = {
  '亮面犀牛皮': {
    'AX (亮面)': 90000,
    'Pixel8bot (亮面)': 100000,
    '3M 100g (亮面)': 110000,
    '3M 150g (亮面)': 125000,
    '3M 200g (亮面)': 135000,
    'Stek Lite (亮面)': 130000
  },
  '消光犀牛皮': {
    'AX (消光)': 100000,
    'Pixel8bot (消光)': 110000,
    '3M 200g (消光)': 145000,
    'Stek Matte (消光)': 140000
  }
};

const FRONT_PPF_PRICING: Record<string, number> = {
  'Pixel8bit (迎風面)': 35000,
  '3M 150g (迎風面)': 45000,
  '3M 200g (迎風面)': 55000
};

const REAR_COATING_PRICING: Record<string, number> = {
  'Servfaces (一年期)': 12000,
  'CarPro (兩年期)': 18000
};

const TINT_PRICE_TABLE: Record<string, { m3: number; m3_sunroof: number; my: number; my_sunroof: number }> = {
  "極黑": { m3: 26500, m3_sunroof: 29500, my: 24500, my_sunroof: 32500 },
  "極透": { m3: 32500, m3_sunroof: 36500, my: 30500, my_sunroof: 40500 },
  "方案1: 前(透)後(黑)": { m3: 30500, m3_sunroof: 33500, my: 28500, my_sunroof: 36500 },
  "方案2: 前、天(透) 身(黑)": { m3: 30500, m3_sunroof: 34500, my: 28500, my_sunroof: 38500 },
  "XC MAX": { m3: 28500, m3_sunroof: 36500, my: 26500, my_sunroof: 34500 },
  "Smart": { m3: 34500, m3_sunroof: 42500, my: 32500, my_sunroof: 40500 },
  "方案3: 前(Smart)身、天(XC)": { m3: 28500, m3_sunroof: 36500, my: 26500, my_sunroof: 34500 },
  "Vega": { m3: 22500, m3_sunroof: 25500, my: 20500, my_sunroof: 26500 },
  "T4": { m3: 26500, m3_sunroof: 30500, my: 24500, my_sunroof: 31500 },
  "方案4: 前(T4)身、天(Vega)": { m3: 24500, m3_sunroof: 27500, my: 22500, my_sunroof: 28500 },
  "方案5: 前、天(T4) 身(Vega)": { m3: 24500, m3_sunroof: 28500, my: 22500, my_sunroof: 29500 },
  "FSK 冰鑽 KT": { m3: 37500, m3_sunroof: 42500, my: 28500, my_sunroof: 40500 },
  "舒熱佳 XE": { m3: 37500, m3_sunroof: 42500, my: 28500, my_sunroof: 40500 },
  "量子膜 ZX": { m3: 35500, m3_sunroof: 42500, my: 28500, my_sunroof: 40500 },
  "皇家 Supreme": { m3: 27500, m3_sunroof: 32500, my: 22500, my_sunroof: 32500 },
  "Xpel-X2 Plus": { m3: 30500, m3_sunroof: 35500, my: 26500, my_sunroof: 37500 },
};

const TINT_GROUPS: Record<string, string[]> = {
  "3M 系列": ["極黑", "極透", "方案1: 前(透)後(黑)", "方案2: 前、天(透) 身(黑)"],
  "桑馬克系列": ["XC MAX", "Smart", "方案3: 前(Smart)身、天(XC)"],
  "T4 / Vega 系列": ["Vega", "T4", "方案4: 前(T4)身、天(Vega)", "方案5: 前、天(T4) 身(Vega)"],
  "FSK 系列": ["FSK 冰鑽 KT"],
  "舒熱佳 系列": ["舒熱佳 XE"],
  "量子膜 系列": ["量子膜 ZX"],
  "皇家 系列": ["皇家 Supreme"],
  "Xpel 系列": ["Xpel-X2 Plus"]
};

const REC_DASHCAM_MODELS = {
  digitalMirrors: [
    { brand: '大邁', model: 'M996', price: 12800, note: '安裝於車外' },
    { brand: '快譯通', model: 'S95B', price: 14000, note: '安裝於車外' },
    { brand: '快譯通', model: 'S95A', price: 14000, note: '安裝於車內，夜視效果更佳，煥新Ｙ推薦' },
    { brand: '快譯通', model: 'S86', price: 12000, note: '安裝於車內，煥新Ｙ推薦' },
    { brand: 'DOD', model: 'T-one plus', price: 20000, note: '結合後鏡頭一體式' }
  ],
  dashcams: [
    { brand: '快譯通', model: 'V92GH', price: 11500, note: '' }
  ]
};

const calculateFrontPpfPrice = (base: number, size: string) => {
  if (['XS', 'S', 'M', 'L'].includes(size)) return base;
  if (size === 'XL') return base + 5000;
  if (size === '2XL') return base + 10000;
  return base;
};

const calculateRearCoatingPrice = (base: number, size: string) => {
  if (['XS', 'S', 'M'].includes(size)) return base;
  if (size === 'L') return base + 1000;
  if (size === 'XL') return base + 2000;
  if (size === '2XL') return base + 3000;
  return base;
};

const COLOR_WRAP_SERIES: Record<string, Record<string, number>> = {
  'AX': {
    'E系列': 60000,
    'V系列': 63000,
    'G系列': 65000,
    'T系列': 68000,
  },
  '3M': {
    'G/M/S系列': 70000,
    'GP/SP系列': 75000,
    'HG系列': 80000,
  }
};

const SIZE_OFFSET: Record<string, number> = {
  'XS': -5000,
  'S': 0,
  'M': 5000,
  'L': 10000,
  'XL': 15000,
  '2XL': 20000,
};

const calculateWrapPrice = (basePrice: number, size: string) => {
  return basePrice + (SIZE_OFFSET[size] || 0);
};

export const PriceInquiryPage: React.FC<PriceInquiryPageProps> = ({ onBack, initialMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeCategory, setActiveCategory] = useState<'detailing' | 'film'>(initialMode || 'detailing');

  // 直接使用內建資料
  const fullMaster = useMemo(() => {
    return vehiclesData as any[];
  }, []);

  const filteredVehicles = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();
    if (!term) return [];
    
    return fullMaster.filter(v => 
      v.brand.toLowerCase().includes(term) || 
      v.model.toLowerCase().includes(term)
    ).slice(0, 15);
  }, [searchTerm, fullMaster]);

  const handleSelect = (v: any) => {
    setSelectedVehicle(v);
    setSearchTerm(`${v.brand} ${v.model}`);
  };

  const currentSize = selectedVehicle 
    ? (activeCategory === 'detailing' ? (selectedVehicle as any).detailingSize : selectedVehicle.size)
    : 'M';

  const pricing = selectedVehicle ? PRICING_MATRIX[currentSize] || PRICING_MATRIX['M'] : null;

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {onBack && (
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
        >
          ← 返回首頁
        </button>
      )}
      <header style={{ marginBottom: '30px', textAlign: 'center', paddingTop: onBack ? '10px' : '20px', position: 'relative' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          {activeCategory === 'detailing' ? (
            <><Sparkles size={32} color="#0ea5e9" /> 汽車美容報價查詢</>
          ) : (
            <><Palette size={32} color="#4f46e5" /> 貼膜施工報價查詢</>
          )}
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>輸入車型即可自動對應尺寸並查看各項服務建議售價</p>
        <div style={{ fontSize: '0.6rem', color: '#cbd5e1', marginTop: '4px' }}>
          DB: {fullMaster.length} | Filter: {filteredVehicles.length}
        </div>
      </header>

      {/* 搜尋區 */}
      <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto 20px auto', zIndex: 100 }}>
        <div className="glass-panel" style={{ padding: '6px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ paddingLeft: '15px', color: '#94a3b8' }}>
            <Search size={22} />
          </div>
          <input
            type="search"
            placeholder="請輸入品牌或車型 (例如: Tesla, RAV4...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px 10px', fontSize: '1.1rem', outline: 'none', color: '#1e293b', fontWeight: '500' }}
          />
          {selectedVehicle && (
            <button 
              onClick={() => { setSelectedVehicle(null); setSearchTerm(''); }}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem' }}
            >
              清除
            </button>
          )}
        </div>

        {/* 搜尋結果選單 */}
        {searchTerm && !selectedVehicle && (
          <div style={{ 
            marginTop: '12px',
            background: '#fff', 
            borderRadius: '16px', 
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
            border: '1px solid #e2e8f0', 
            overflow: 'hidden',
            zIndex: 100,
            position: 'absolute',
            width: '100%',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {filteredVehicles.length > 0 ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  找到 {filteredVehicles.length} 個相符車型
                </div>
                {filteredVehicles.map((v, i) => (
                  <div 
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(v);
                    }}
                    style={{ 
                      padding: '16px 20px', 
                      cursor: 'pointer', 
                      borderBottom: i === filteredVehicles.length - 1 ? 'none' : '1px solid #f1f5f9', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: '#fff'
                    }}
                    className="search-item-hover"
                  >
                    <div>
                      <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.05rem' }}>{v.brand}</span>
                      <span style={{ marginLeft: '10px', color: '#64748b' }}>{v.model}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {v.size || '未知'}
                      </span>
                      <ArrowRight size={16} color="#cbd5e1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Car size={32} style={{ opacity: 0.2, marginBottom: '10px' }} />
                <div style={{ fontWeight: 'bold' }}>找不到相符的車型</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>請嘗試輸入品牌或型號 (例如: Toyota)</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 分類切換器 - 如果有 initialMode 就隱藏，避免混淆 */}
      {!initialMode && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          background: '#f1f5f9', 
          padding: '6px', 
          borderRadius: '16px', 
          maxWidth: '400px', 
          margin: '0 auto 40px auto',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <button 
            onClick={() => setActiveCategory('detailing')}
            style={{ 
              flex: 1,
              padding: '12px', 
              borderRadius: '12px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: activeCategory === 'detailing' ? '#fff' : 'transparent',
              color: activeCategory === 'detailing' ? '#0ea5e9' : '#64748b',
              boxShadow: activeCategory === 'detailing' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={18} /> 汽車美容
          </button>
          <button 
            onClick={() => setActiveCategory('film')}
            style={{ 
              flex: 1,
              padding: '12px', 
              borderRadius: '12px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: activeCategory === 'film' ? '#fff' : 'transparent',
              color: activeCategory === 'film' ? '#4f46e5' : '#64748b',
              boxShadow: activeCategory === 'film' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Palette size={18} /> 貼膜服務
          </button>
        </div>
      )}

      {selectedVehicle ? (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* 選中的車輛資訊 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px', 
            marginBottom: '30px', 
            background: activeCategory === 'detailing' 
              ? 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' 
              : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', 
            padding: '30px', 
            borderRadius: '24px', 
            color: '#fff', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={36} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.8rem', margin: 0, fontWeight: '900' }}>{selectedVehicle.brand} {selectedVehicle.model}</h3>
              <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '1rem' }}>
                對應{activeCategory === 'detailing' ? '美容' : '貼膜'}尺寸: <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{currentSize}</span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{currentSize}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>VEHICLE SIZE</div>
            </div>
          </div>

          {activeCategory === 'detailing' ? (
            /* 汽車美容報價內容 */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
              {/* 精緻洗車 */}
              <div className="glass-panel" style={{ padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#0ea5e9' }}>
                  <Waves size={24} />
                  <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>精緻洗車服務</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>單次施工 ({currentSize})</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>
                    <span style={{ fontSize: '1rem', marginRight: '4px' }}>$</span>
                    {DETAILING_PRICING[currentSize]?.wash.toLocaleString()}
                  </div>
                </div>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', color: '#475569', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 中性泡沫手洗</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 鋁圈深層清潔</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 玻璃除油膜 (前擋)</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 基礎內裝除塵</li>
                </ul>
              </div>

              {/* 內裝深層 */}
              <div className="glass-panel" style={{ padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#6366f1' }}>
                  <Wind size={24} />
                  <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>內裝深層護理</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>職人手作</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>
                    <span style={{ fontSize: '1rem', marginRight: '4px' }}>$</span>
                    {DETAILING_PRICING[currentSize]?.interior.toLocaleString()}
                  </div>
                </div>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', color: '#475569', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 皮革滋養護理</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 高溫蒸氣殺菌</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 踏墊深層洗滌</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 內裝塑件上蠟</li>
                </ul>
              </div>

              {/* 小美容 */}
              <div className="glass-panel" style={{ padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#f59e0b' }}>
                  <Sparkles size={24} />
                  <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>車體小美容 / 拋光</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>漆面還原</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>
                    <span style={{ fontSize: '1rem', marginRight: '4px' }}>$</span>
                    {DETAILING_PRICING[currentSize]?.miniDetail.toLocaleString()}
                  </div>
                </div>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', color: '#475569', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 單劑拋光增亮</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 柏油鐵粉去除</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 手作封體護理</li>
                </ul>
              </div>

              {/* 大美容 */}
              <div className="glass-panel" style={{ padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#ef4444' }}>
                  <ShieldCheck size={24} />
                  <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>極致大美容</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>全車修復</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>
                    <span style={{ fontSize: '1rem', marginRight: '4px' }}>$</span>
                    {DETAILING_PRICING[currentSize]?.fullDetail.toLocaleString()}
                  </div>
                </div>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', color: '#475569', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 多劑式漆面修正</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 玻璃全車拋光</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={16} color="#10b981" /> 引擎室清潔護理</li>
                </ul>
              </div>

              {/* 石英鍍膜 */}
              <div className="glass-panel" style={{ padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', background: 'linear-gradient(to bottom right, #fff, #f0f9ff)', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#8b5cf6' }}>
                  <Gem size={24} />
                  <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>頂級石英鍍膜方案 (一年期/兩年期)</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                      使用歐美頂級鍍膜藥劑，提供極致潑水與漆面硬度提升，有效防止酸雨、跳石與紫外線傷害。
                    </p>
                    <div style={{ background: '#f5f3ff', padding: '15px', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                      <div style={{ fontWeight: 'bold', color: '#5b21b6', marginBottom: '8px' }}>包含項目：</div>
                      <div style={{ fontSize: '0.85rem', color: '#7c3aed', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <span>• 全車漆面鍍膜</span>
                        <span>• 玻璃撥水鍍膜</span>
                        <span>• 鋁圈耐高溫鍍膜</span>
                        <span>• 塑件還原鍍膜</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>建議售價起</div>
                    <div style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', lineHeight: 1 }}>
                      <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>$</span>
                      {DETAILING_PRICING[currentSize]?.coating.toLocaleString()}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 'bold' }}>
                      * 視漆面狀況與鍍膜等級調整
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 貼膜服務報價內容 */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
            {/* 改色膜 */}
            <div className="glass-panel" style={{ padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#4f46e5' }}>
                <Palette size={24} />
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>全車改色膜 - 品牌系列報價</h4>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* AX Series */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                    <div style={{ background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>AX</div>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>AX 品牌系列</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(COLOR_WRAP_SERIES['AX']).map(([series, base]) => (
                      <div key={series} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#f8fafc', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>{series}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '3px' }}>$</span>
                          {calculateWrapPrice(base, selectedVehicle.size).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3M Series */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                    <div style={{ background: '#e11d48', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>3M</div>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>3M 品牌系列</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(COLOR_WRAP_SERIES['3M']).map(([series, base]) => (
                      <div key={series} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#fff1f2', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#991b1b', fontWeight: '600' }}>{series}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#e11d48' }}>
                          <span style={{ fontSize: '0.8rem', color: '#f43f5e', marginRight: '3px', opacity: 0.6 }}>$</span>
                          {calculateWrapPrice(base, selectedVehicle.size).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '25px', padding: '15px 20px', background: '#f5f3ff', borderRadius: '15px', border: '1px solid #ddd6fe' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#7c3aed', color: '#fff', padding: '6px', borderRadius: '10px' }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#5b21b6', fontSize: '0.95rem' }}>全車改色加購 - 迎風面犀牛皮</div>
                      <div style={{ fontSize: '0.75rem', color: '#7c3aed' }}>品牌: Pixel8bit (Hood+Fender)</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#5b21b6' }}>
                    <span style={{ fontSize: '0.8rem', marginRight: '3px' }}>+ $</span>18,000
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}></div>
            </div>

            {/* 犀牛皮 (PPF) */}
            <div className="glass-panel" style={{ padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#10b981' }}>
                <ShieldCheck size={24} />
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>犀牛皮 (PPF) 專業保護膜報價</h4>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Full PPF */}
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '4px', height: '16px', background: '#10b981', borderRadius: '2px' }}></div>
                    全車保護方案 (Glossy / Matte)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(PPF_PRICING).map(([category, items]) => (
                      <div key={category} style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '5px', paddingLeft: '5px' }}>{category}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {Object.entries(items).map(([name, base]) => (
                            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '600' }}>{name}</span>
                              <span style={{ fontSize: '1rem', fontWeight: '800', color: '#064e3b' }}>
                                ${calculateWrapPrice(base, selectedVehicle.size).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Front PPF */}
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '4px', height: '16px', background: '#0ea5e9', borderRadius: '2px' }}></div>
                    重點防護 - 迎風面方案
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(FRONT_PPF_PRICING).map(([name, base]) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
                        <span style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: '600' }}>{name}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0c4a6e' }}>
                          ${calculateFrontPpfPrice(base, selectedVehicle.size).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Zap size={14} /> 迎風面加購 - 後半車鍍膜
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(REAR_COATING_PRICING).map(([name, base]) => (
                        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>{name}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0369a1' }}>
                            +${calculateRearCoatingPrice(base, selectedVehicle.size).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', padding: '10px 15px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', lineHeight: '1.6' }}>
                      <strong>迎風面包含：</strong>前保桿、引擎蓋、左右葉子板、後視鏡。
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 其他服務 (小項) */}
          <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
             {/* 隔熱紙方案 */}
             <div className="glass-panel" style={{ padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                <h4 style={{ marginBottom: '20px', color: '#1e3a8a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sun size={20} /> 隔熱紙專業方案
                </h4>
                
                {selectedVehicle.model?.toLowerCase().includes('model 3') || selectedVehicle.model?.toLowerCase().includes('model y') ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {Object.entries(TINT_GROUPS).map(([group, items]) => (
                      <div key={group} style={{ background: '#f8fafc', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '0.9rem', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>{group}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {items.map(item => {
                            const prices = TINT_PRICE_TABLE[item];
                            const isM3 = selectedVehicle.model?.toLowerCase().includes('model 3');
                            const price = isM3 ? prices.m3 : prices.my;
                            const sunroofPrice = isM3 ? prices.m3_sunroof : prices.my_sunroof;
                            
                            return (
                              <div key={item} style={{ fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontWeight: '600' }}>
                                  <span>{item}</span>
                                  <span style={{ color: '#1e3a8a' }}>${price.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                  <span>(含天窗方案)</span>
                                  <span>${sunroofPrice.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '15px', border: '1px dashed #3b82f6', textAlign: 'center' }}>
                     <p style={{ color: '#1e40af', fontWeight: 'bold', margin: 0 }}>
                       最低 $ {pricing?.tint} 起
                     </p>
                     <p style={{ color: '#60a5fa', fontSize: '0.85rem', margin: '5px 0 0 0' }}>
                       (依車型不同須詢問隔熱紙廠商實際報價)
                     </p>
                  </div>
                )}
             </div>

             {(selectedVehicle.model?.toLowerCase().includes('model 3') || selectedVehicle.model?.toLowerCase().includes('model y')) && (
               <div className="glass-panel" style={{ padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                  <h4 style={{ marginBottom: '15px', color: '#1e293b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MonitorPlay size={20} /> Tesla 安全升級首選 - 行車記錄器 ＆ 電子後視鏡
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>我們配合的專業廠商提供多種品牌與型號，皆可協助施工安裝，歡迎根據需求搭配選擇。</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MonitorPlay size={16} /> 電子後視鏡熱門推薦
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {REC_DASHCAM_MODELS.digitalMirrors.map(m => (
                          <div key={m.model} style={{ background: '#f8fafc', padding: '12px 15px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '700', color: '#1e293b' }}>{m.brand} {m.model}</span>
                              <span style={{ fontWeight: '800', color: '#2563eb' }}>${m.price.toLocaleString()}</span>
                            </div>
                            {m.note && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{m.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Video size={16} /> 行車記錄器熱門推薦
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {REC_DASHCAM_MODELS.dashcams.map(m => (
                          <div key={m.model} style={{ background: '#f8fafc', padding: '12px 15px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '700', color: '#1e293b' }}>{m.brand} {m.model}</span>
                              <span style={{ fontWeight: '800', color: '#2563eb' }}>${m.price.toLocaleString()}</span>
                            </div>
                            {m.note && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{m.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
             )}

             {/* 其他配件 */}
             <div className="glass-panel" style={{ padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ marginBottom: '15px', color: '#1e293b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LayoutPanelTop size={18} /> 其他配套服務
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 15px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>電子後視鏡 (含工)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#475569' }}>$ {pricing?.mirror}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 15px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>鍍鉻件黑化包覆</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#475569' }}>$ 8,000 ~ 15,000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    ) : (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
          <div style={{ background: '#fff', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
             <Car size={48} color="#cbd5e1" />
          </div>
          <h3 style={{ color: '#64748b', fontSize: '1.5rem', marginBottom: '10px' }}>請輸入車型開始查詢</h3>
          <p style={{ color: '#94a3b8' }}>系統將根據母檔中的 S, M, L, XL 等規格自動呈現報價</p>
        </div>
      )}

      <style>{`
        .search-item-hover:hover {
          background: #f8fafc;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
