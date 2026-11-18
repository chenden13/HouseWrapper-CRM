import React, { useState, useMemo } from 'react';
import { Search, Tag, CheckSquare, ShieldCheck, Zap, Info, ArrowRight, Palette, Sun, LayoutPanelTop, MonitorPlay, Video, Car, Droplets, Sparkles, Gem, Wind, Waves, ChevronDown, ChevronUp, Star, Layers } from 'lucide-react';
import vehiclesData from './data/vehicles.json';
import detailingPrices from './data/detailing_prices.json';
import axColorsData from './data/axColors2026.json';

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
  'S':  { colorChange: 50000, ppf: 90000, frontPpf: 35000, tint: '9000~13000', mirror: '6000' },
  'M':  { colorChange: 55000, ppf: 95000, frontPpf: 35000, tint: '10000~15000', mirror: '6500' },
  'L':  { colorChange: 60000, ppf: 100000, frontPpf: 35000, tint: '12000~18000', mirror: '6500' },
  'XL': { colorChange: 65000, ppf: 105000, frontPpf: 40000, tint: '15000~22000', mirror: '7000' },
  '2XL':{ colorChange: 75000, ppf: 110000, frontPpf: 45000, tint: '18000~28000', mirror: '7500' },
  '3XL':{ colorChange: 85000, ppf: 125000, frontPpf: 50000, tint: '22000~35000', mirror: '8000' },
};

const DETAILING_PRICING: Record<string, { wash: number; interior: number; miniDetail: number; fullDetail: number; coating: number }> = {
  'S':  { wash: 600, interior: 1800, miniDetail: 3500, fullDetail: 7000, coating: 10000 },
  'M':  { wash: 700, interior: 2000, miniDetail: 4000, fullDetail: 8000, coating: 12000 },
  'L':  { wash: 800, interior: 2500, miniDetail: 5000, fullDetail: 10000, coating: 15000 },
  'XL': { wash: 1000, interior: 3000, miniDetail: 6000, fullDetail: 12000, coating: 18000 },
  '2XL':{ wash: 1200, interior: 3500, miniDetail: 7000, fullDetail: 14000, coating: 22000 },
  '3XL':{ wash: 1500, interior: 4000, miniDetail: 8000, fullDetail: 16000, coating: 25000 },
};

<<<<<<< HEAD
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
    '3M 200m (消光)': 145000,
    'Stek Matte (消光)': 140000
  }
=======
interface PpfItem {
  name: string;
  thickness: string;
  warranty: string;
  basePrice: number;
}

const PPF_DATA: Record<string, PpfItem[]> = {
  '亮面犀牛皮': [
    { name: 'AX K系列', thickness: '7.5 mil', warranty: '5年保固', basePrice: 90000 },
    { name: 'AX X系列', thickness: '8.5 mil', warranty: '7年保固', basePrice: 100000 },
    { name: 'STEK C clear', thickness: '7.5 mil', warranty: '5年保固', basePrice: 110000 },
    { name: '3M 150g', thickness: '7.5 mil', warranty: '5年保固', basePrice: 125000 },
    { name: '3M 200g', thickness: '7.9 mil', warranty: '7年保固', basePrice: 135000 },
    { name: 'STEK DYNO PURE+', thickness: '8.0 mil', warranty: '7年保固', basePrice: 140000 },
  ],
  '消光犀牛皮': [
    { name: 'AX M系列', thickness: '8.5 mil', warranty: '7年保固', basePrice: 100000 },
    { name: 'STEK C matte', thickness: '7.5 mil', warranty: '5年保固', basePrice: 120000 },
    { name: '3M 200m', thickness: '7.9 mil', warranty: '7年保固', basePrice: 145000 },
    { name: 'STEK DYNO matte', thickness: '8.0 mil', warranty: '7年保固', basePrice: 150000 },
  ]
>>>>>>> b1851c8ad9880bb75a61210337d5fb8ed9db07c7
};

const FRONT_PPF_PRICING: { name: string; thickness: string; warranty: string; basePrice: number }[] = [
  { name: 'Pixel8bit (迎風面)', thickness: '7.5 mil', warranty: '5年保固', basePrice: 35000 },
  { name: '3M 150g (迎風面)', thickness: '7.5 mil', warranty: '5年保固', basePrice: 45000 },
  { name: '3M 200g (迎風面)', thickness: '7.9 mil', warranty: '7年保固', basePrice: 55000 }
];

const REAR_COATING_PRICING: Record<string, number> = {
  'Servfaces (一年期)': 12000,
  'CarPro (兩年期)': 18000
};

const calculateFrontPpfPrice = (base: number, size: string) => {
  const s = getValidSize(size);
  if (['S', 'M', 'L'].includes(s)) return base;
  if (s === 'XL') return base + 5000;
  if (s === '2XL') return base + 10000;
  return base;
};

const calculateRearCoatingPrice = (base: number, size: string) => {
  const s = getValidSize(size);
  if (['S', 'M'].includes(s)) return base;
  if (s === 'L') return base + 1000;
  if (s === 'XL') return base + 2000;
  if (s === '2XL') return base + 3000;
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
  'S': 0,
  'M': 5000,
  'L': 10000,
  'XL': 15000,
  '2XL': 20000,
};

export const getValidSize = (size?: string): 'S' | 'M' | 'L' | 'XL' | '2XL' => {
  const s = (size || '').toUpperCase().trim();
  if (s === 'S' || s === 'M' || s === 'L' || s === 'XL' || s === '2XL') return s;
  if (s === '3XL') return '2XL';
  if (s === 'XS') return 'S';
  return 'M';
};

const calculateWrapPrice = (basePrice: number, size: string) => {
  return basePrice + (SIZE_OFFSET[getValidSize(size)] || 0);
};

export const PriceInquiryPage: React.FC<PriceInquiryPageProps> = ({ vehicleMaster, onBack, initialMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeCategory, setActiveCategory] = useState<'detailing' | 'film'>(initialMode || 'film');
  const [expandedDetailing, setExpandedDetailing] = useState<string[]>([]);
  const [colorSearch, setColorSearch] = useState('');
  const [selectedColorSize, setSelectedColorSize] = useState<string>('M');

  // A~Z 字母查詢選車狀態
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // 直接使用內建的 vehiclesData
  const fullMaster = useMemo(() => {
    return vehiclesData as any[];
  }, []);

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const getBrandInitial = (brand: string): string => {
    if (!brand) return '';
    const first = brand.trim()[0].toUpperCase();
    if (first === 'Š') return 'S';
    return first;
  };

  // 依開頭字母分組所有廠牌 (統一轉為大寫並去重，避免 TOYOTA 與 Toyota 重複)
  const brandsByLetter = useMemo(() => {
    const map: Record<string, string[]> = {};
    ALPHABET.forEach(l => { map[l] = []; });
    const brandSet = new Set<string>();
    fullMaster.forEach(v => {
      const b = v.brand.trim().toUpperCase();
      if (b) brandSet.add(b);
    });
    Array.from(brandSet).sort().forEach(b => {
      const init = getBrandInitial(b);
      if (map[init]) {
        map[init].push(b);
      }
    });
    return map;
  }, [fullMaster]);

  // 當選中廠牌時，獲取該廠牌的所有車型 (排序)
  const modelsBySelectedBrand = useMemo(() => {
    if (!selectedBrand) return [];
    const target = selectedBrand.trim().toUpperCase();
    return fullMaster
      .filter(v => v.brand.trim().toUpperCase() === target)
      .sort((a, b) => a.model.localeCompare(b.model));
  }, [selectedBrand, fullMaster]);

  const filteredVehicles = useMemo(() => {
    const raw = (searchTerm || '').trim().toLowerCase();
    if (!raw) return [];
    // normalize: remove hyphens, spaces, underscores for fuzzy matching
    const normalize = (s: string) => s.toLowerCase().replace(/[-\s_]/g, '');
    const term = normalize(raw);
    
    return fullMaster.filter(v => {
      const brand = v.brand.toLowerCase();
      const model = v.model.toLowerCase();
      const combined = `${brand} ${model}`.toLowerCase();
      // standard includes check
      if (brand.includes(raw) || model.includes(raw) || combined.includes(raw)) return true;
      // normalized fuzzy check (handles CR-V → CRV, MODEL Y → MODELY)
      const nBrand = normalize(v.brand);
      const nModel = normalize(v.model);
      const nCombined = `${nBrand}${nModel}`;
      return nBrand.includes(term) || nModel.includes(term) || nCombined.includes(term);
    }).slice(0, 30);
  }, [searchTerm, fullMaster]);

  const handleSelect = (v: any) => {
    setSelectedVehicle(v);
    setSearchTerm(`${v.brand} ${v.model}`);
  };

  const handleClear = () => {
    setSelectedVehicle(null);
    setSearchTerm('');
    setSelectedBrand(null);
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
      <header style={{ marginBottom: '25px', textAlign: 'center', paddingTop: onBack ? '10px' : '20px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          {activeCategory === 'film' ? (
            <><Palette size={32} color="#fb923c" /> 貼膜施工報價查詢</>
          ) : (
            <><Sparkles size={32} color="#fb923c" /> 汽車美容報價查詢</>
          )}
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>輸入車型或按字母 A~Z 點選廠牌，即可自動對應尺寸並查看各項服務售價</p>
        <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '4px' }}>
          資料庫共 {fullMaster.length} 款車型
        </div>
      </header>

      {/* 分類切換器 - 貼膜服務放左邊 (預設)，汽車美容放右邊 */}
      {!initialMode && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          background: '#f1f5f9', 
          padding: '8px', 
          borderRadius: '20px', 
          maxWidth: '560px', 
          margin: '0 auto 30px auto',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {/* 貼膜服務 (放左邊，預設) */}
          <button 
            onClick={() => setActiveCategory('film')}
            style={{ 
              flex: 1,
              padding: '16px 24px', 
              borderRadius: '14px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: '900',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: activeCategory === 'film' ? '#fff' : 'transparent',
              color: activeCategory === 'film' ? '#fb923c' : '#94a3b8',
              boxShadow: activeCategory === 'film' ? '0 4px 12px rgba(251,146,60,0.25)' : 'none',
              transition: 'all 0.25s'
            }}
          >
            <Palette size={22} /> 貼膜服務
          </button>

          {/* 汽車美容 (放右邊) */}
          <button 
            onClick={() => setActiveCategory('detailing')}
            style={{ 
              flex: 1,
              padding: '16px 24px', 
              borderRadius: '14px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: '900',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: activeCategory === 'detailing' ? '#fff' : 'transparent',
              color: activeCategory === 'detailing' ? '#fb923c' : '#94a3b8',
              boxShadow: activeCategory === 'detailing' ? '0 4px 12px rgba(251,146,60,0.25)' : 'none',
              transition: 'all 0.25s'
            }}
          >
            <Sparkles size={22} /> 汽車美容
          </button>
        </div>
      )}

      {/* 搜尋區 */}
      <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto 20px auto', zIndex: 100 }}>
        <div className="glass-panel" style={{ padding: '6px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <div style={{ paddingLeft: '15px', color: '#94a3b8' }}>
            <Search size={22} />
          </div>
          <input
            type="search"
            placeholder="請輸入品牌或車型關鍵字 (例如: Tesla, RAV4...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (selectedVehicle) setSelectedVehicle(null);
            }}
            autoComplete="off"
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px 10px', fontSize: '1.1rem', outline: 'none', color: '#1e293b', fontWeight: '500' }}
          />
          {(selectedVehicle || searchTerm) && (
            <button 
              onClick={handleClear}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}
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
                      <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        貼膜: {getValidSize(v.size)}
                      </span>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        洗車: {getValidSize(v.detailingSize)}
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

      {/* 字母 A~Z 快速選車模組 */}
      <div style={{ 
        maxWidth: '860px', 
        margin: '0 auto 35px auto', 
        background: '#fff', 
        padding: '20px 24px', 
        borderRadius: '20px', 
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '4px', height: '16px', background: '#fb923c', borderRadius: '2px', display: 'inline-block' }}></span>
            按字母 A ~ Z 點選廠牌與車型：
          </div>
          {(selectedLetter || selectedBrand) && (
            <button
              onClick={() => { setSelectedLetter(null); setSelectedBrand(null); }}
              style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              重置字母篩選 ✕
            </button>
          )}
        </div>

        {/* 有廠牌的字母小方框 (無車款的字母直接隱藏) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(34px, 1fr))', gap: '8px' }}>
          {ALPHABET.filter(letter => (brandsByLetter[letter] || []).length > 0).map(letter => {
            const count = (brandsByLetter[letter] || []).length;
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => {
                  if (selectedLetter === letter) {
                    setSelectedLetter(null);
                    setSelectedBrand(null);
                  } else {
                    setSelectedLetter(letter);
                    setSelectedBrand(null);
                  }
                }}
                style={{
                  height: '40px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #ea580c' : '1px solid #cbd5e1',
                  background: isSelected ? '#ea580c' : '#fff',
                  color: isSelected ? '#fff' : '#1e293b',
                  fontWeight: isSelected ? '900' : '800',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 10px rgba(234,88,12,0.35)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`【${letter}】開頭 (${count} 個廠牌)`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* 第一層展開：該字母開頭的所有廠牌 */}
        {selectedLetter && (
          <div style={{ 
            marginTop: '18px', 
            padding: '16px', 
            background: '#f8fafc', 
            borderRadius: '14px', 
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.25s ease-out' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#c2410c' }}>
                字母【{selectedLetter}】開頭的廠牌 (點擊廠牌查看車型)：
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                共 {brandsByLetter[selectedLetter]?.length || 0} 個廠牌
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {brandsByLetter[selectedLetter]?.map(brand => {
                const isBrandActive = selectedBrand === brand;
                const modelCount = fullMaster.filter(v => v.brand.trim().toUpperCase() === brand).length;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(isBrandActive ? null : brand)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: isBrandActive ? '2px solid #0f766e' : '1px solid #cbd5e1',
                      background: isBrandActive ? '#0f766e' : '#fff',
                      color: isBrandActive ? '#fff' : '#1e293b',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: isBrandActive ? '0 3px 10px rgba(15,118,110,0.25)' : '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{brand}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      background: isBrandActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: isBrandActive ? '#fff' : '#64748b',
                      fontWeight: '700'
                    }}>
                      {modelCount}款
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 第二層展開：該廠牌下的所有車型 */}
        {selectedBrand && (
          <div style={{ 
            marginTop: '16px', 
            padding: '18px', 
            background: '#fff', 
            borderRadius: '14px', 
            border: '2px solid #0f766e',
            boxShadow: '0 8px 24px rgba(15,118,110,0.1)',
            animation: 'fadeIn 0.25s ease-out' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0f766e' }}>
                【{selectedBrand}】全系列車型 ({modelsBySelectedBrand.length} 款) ➔ 點擊直接查看報價
              </div>
              <button
                onClick={() => setSelectedBrand(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                收合 ✕
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '10px', 
              maxHeight: '380px', 
              overflowY: 'auto',
              paddingRight: '6px'
            }}>
              {modelsBySelectedBrand.map((v, idx) => {
                const isCurrent = selectedVehicle?.brand === v.brand && selectedVehicle?.model === v.model;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(v)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isCurrent ? '2px solid #fb923c' : '1px solid #e2e8f0',
                      background: isCurrent ? '#fff7ed' : '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s'
                    }}
                    className="search-item-hover"
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: isCurrent ? '900' : '700', color: isCurrent ? '#c2410c' : '#1e293b' }}>
                      {v.model}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        fontWeight: '800'
                      }}>
                        貼膜: {getValidSize(v.size)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedVehicle ? (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* 選中的車輛資訊 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px', 
            marginBottom: '30px', 
            background: activeCategory === 'detailing' 
              ? 'linear-gradient(135deg, #fb923c 0%, #c2410c 100%)' 
              : 'linear-gradient(135deg, #fb923c 0%, #c2410c 100%)', 
            padding: '25px 30px', 
            borderRadius: '24px', 
            color: '#fff', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={36} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.8rem', margin: 0, fontWeight: '900' }}>{selectedVehicle.brand} {selectedVehicle.model}</h3>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  貼膜尺寸: {getValidSize(selectedVehicle.size)}
                </span>
                <span style={{ background: 'rgba(255, 255, 255, 0.35)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
                  洗車/美容尺寸: {getValidSize((selectedVehicle as any).detailingSize)}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: '1' }}>{currentSize}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>目前對應尺寸 ({activeCategory === 'detailing' ? '洗車美容' : '貼膜'})</div>
            </div>
          </div>

          {activeCategory === 'detailing' ? (
            /* 汽車美容報價內容 */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', gridColumn: 'span 2' }}>
                {[
                  { title: "保養洗車、基本護理", icon: Droplets, theme: { main: '#fb923c', bg: '#f0f9ff', border: '#e0f2fe' }, items: detailingPrices.filter(i => ["經典洗", "光澤整備", "深層特勤", "鏡透打底Lv.1", "鏡透打底Lv.2", "視界去污"].includes(i.itemName)) },
                  { title: "拋光鍍膜", icon: Sparkles, theme: { main: '#8b5cf6', bg: '#fff7ed', border: '#ffedd5' }, items: detailingPrices.filter(i => ["S1單層護盾", "S1雙層護盾", "S2單層護盾", "S2雙層護盾", "視界強化", "鋁圈守護"].includes(i.itemName)) },
                  { title: "貼膜車專屬方案", icon: ShieldCheck, theme: { main: '#10b981', bg: '#ecfdf5', border: '#d1fae5' }, items: detailingPrices.filter(i => ["膜淨行動", "膜車專護方案"].includes(i.itemName)) }
                ].map((group, gIdx) => {
                  const GroupIcon = group.icon;
                  return (
                  <div key={gIdx}>
                    <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '20px', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <GroupIcon size={24} color={group.theme.main} /> {group.title}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                      {group.items.map((item, idx) => {
                        const isExpanded = expandedDetailing.includes(group.title);
                        
                        // Calculate size multiplier offset based on 'S'
                  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
                  const sIndex = 1; // 'S' is index 1
                  const currentIndex = sizes.indexOf(currentSize as string);
                  const diff = currentIndex >= 0 ? currentIndex - sIndex : 0;
                  
                  // Calculate base price with offset
                  const computedBase = item.basePriceN + (diff * item.stepPrice);
                  
                  // Calculate member prices
                  const priceN = computedBase;
                  const priceS = Math.round(computedBase * item.discountS);
                  const priceSR = Math.round(computedBase * item.discountSR);
                  const priceUR = Math.round(computedBase * item.discountUR);

                  return (
                    <div key={idx} className="glass-panel" style={{ padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                      <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                        onClick={() => setExpandedDetailing(prev => prev.includes(group.title) ? prev.filter(i => i !== group.title) : [...prev, group.title])}
                      >
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: group.theme.main, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <GroupIcon size={20} /> {item.itemName}
                          </h4>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px', fontWeight: 'bold' }}>
                            {item.subtitle}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <div style={{ background: '#f8fafc', padding: '4px 10px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                            $ {priceN.toLocaleString()}
                          </div>
                          <div style={{ color: '#94a3b8', marginTop: '6px' }}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0', animation: 'fadeIn 0.3s ease-out' }}>
                          <div style={{ background: group.theme.bg, padding: '15px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${group.theme.border}` }}>
                            <div style={{ fontSize: '0.9rem', color: group.theme.main, fontWeight: 'bold', marginBottom: '10px' }}>會員專屬報價 (已包含尺寸加價)</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                              <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>一般 (N)</div>
                                <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '900' }}>${priceN.toLocaleString()}</div>
                              </div>
                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 'bold' }}>銀卡 (S)</div>
                                <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '900' }}>${priceS.toLocaleString()}</div>
                              </div>
                              <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 'bold' }}>金卡 (SR)</div>
                                <div style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: '900' }}>${priceSR.toLocaleString()}</div>
                              </div>
                              <div style={{ background: '#fdf4ff', padding: '8px', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                                <div style={{ fontSize: '0.7rem', color: '#c026d3', fontWeight: 'bold' }}>黑卡 (UR)</div>
                                <div style={{ fontSize: '0.9rem', color: '#a21caf', fontWeight: '900' }}>${priceUR.toLocaleString()}</div>
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {item.details ? item.details : <span style={{ opacity: 0.5 }}>無詳細說明</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                    </div>
                  </div>
                );
              })}
              </div>

              {/* 溫馨提示區 */}
              <div className="glass-panel col-span-2" style={{ padding: '15px 20px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', gridColumn: 'span 2' }}>
                <Info size={18} color="#fb923c" />
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                  💡 <strong>洗車美容報價說明：</strong>此頁面僅供對應車型之「美容/洗車尺寸級距」查詢。實際施工金額與工時評估，請洽門市技術人員或參閱店內實體價目表。
                </span>
              </div>

            </div>
          ) : (
            /* 貼膜服務報價內容 */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
            {/* 改色膜 */}
            <div className="glass-panel" style={{ padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#fb923c' }}>
                <Palette size={24} />
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>全車改色膜 - 品牌系列報價</h4>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* AX Series */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                    <div style={{ background: '#fb923c', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>AX</div>
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

              <div style={{ marginTop: '25px', padding: '18px 20px', background: '#fff7ed', borderRadius: '15px', border: '1px solid #fed7aa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#f97316', color: '#fff', padding: '8px', borderRadius: '10px' }}>
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#c2410c', fontSize: '1rem' }}>常跑高速 ｜ 車頭加強犀牛皮防護</div>
                      <div style={{ fontSize: '0.8rem', color: '#7c2d12', marginTop: '2px' }}>
                        防護鈑件：引擎蓋、前葉子版 (前保桿及後照鏡為塑膠件不建議加價防護)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 'bold', marginTop: '3px' }}>
                        國產 Pixel8bit (厚度 7.5 mil)
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#c2410c' }}>
                    <span style={{ fontSize: '0.85rem', marginRight: '3px' }}>+ $</span>18,000
                  </div>
                </div>

                {/* 部位示意圖 */}
                <div style={{ marginTop: '14px', textAlign: 'center' }}>
                  <img 
                    src="./car_front_diagram.png" 
                    alt="車頭加強防護部位示意圖 (引擎蓋、前葉子版)" 
                    style={{ maxWidth: '100%', maxHeight: '220px', height: 'auto', display: 'inline-block' }} 
                  />
                  <div style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '6px', fontStyle: 'italic' }}>
                    * 犀牛皮為保護原漆，貼在改色下方避免跳石打破改色後傷到底漆
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
              
              {/* 全車保護方案 - 亮面與消光並排 */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  <div style={{ width: '4px', height: '18px', background: '#10b981', borderRadius: '2px' }}></div>
                  全車保護方案 (Glossy / Matte)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                  {Object.entries(PPF_DATA).map(([category, items]) => (
                    <div 
                      key={category} 
                      style={{ 
                        background: category.includes('亮面') ? '#f0fdf4' : '#f0f9ff', 
                        padding: '20px', 
                        borderRadius: '16px', 
                        border: category.includes('亮面') ? '1px solid #bbf7d0' : '1px solid #bae6fd' 
                      }}
                    >
                      {/* 類別大標題 */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '16px', 
                        paddingBottom: '12px', 
                        borderBottom: category.includes('亮面') ? '2px solid #bbf7d0' : '2px solid #bae6fd' 
                      }}>
                        <div style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '900', 
                          color: category.includes('亮面') ? '#047857' : '#0369a1', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px' 
                        }}>
                          <Sparkles size={22} color={category.includes('亮面') ? '#10b981' : '#0284c7'} />
                          {category}
                        </div>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: '800', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          background: category.includes('亮面') ? '#dcfce7' : '#e0f2fe', 
                          color: category.includes('亮面') ? '#166534' : '#0369a1' 
                        }}>
                          {category.includes('亮面') ? 'Glossy' : 'Matte'}
                        </span>
                      </div>

                      {/* 產品項目列表 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {items.map((item) => (
                          <div 
                            key={item.name} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '12px 14px', 
                              background: '#fff', 
                              borderRadius: '12px', 
                              border: '1px solid #e2e8f0',
                              gap: '12px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <span style={{ fontSize: '0.98rem', color: '#1e293b', fontWeight: '800' }}>
                                {item.name}
                              </span>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ 
                                  fontSize: '0.72rem', 
                                  padding: '2px 7px', 
                                  borderRadius: '6px', 
                                  background: '#e0f2fe', 
                                  color: '#0369a1', 
                                  fontWeight: '700' 
                                }}>
                                  厚度: {item.thickness}
                                </span>
                                <span style={{ 
                                  fontSize: '0.72rem', 
                                  padding: '2px 7px', 
                                  borderRadius: '6px', 
                                  background: '#fef3c7', 
                                  color: '#b45309', 
                                  fontWeight: '700' 
                                }}>
                                  保固: {item.warranty}
                                </span>
                              </div>
                            </div>
                            <span style={{ 
                              fontSize: '1.15rem', 
                              fontWeight: '900', 
                              color: category.includes('亮面') ? '#047857' : '#0369a1', 
                              whiteSpace: 'nowrap' 
                            }}>
                              ${calculateWrapPrice(item.basePrice, selectedVehicle.size).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 分隔線 */}
              <div style={{ margin: '30px 0', borderTop: '1px solid #e2e8f0' }}></div>

              {/* 迎風面與加購方案 - 顯示在下面 */}
              <div>
                <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  <div style={{ width: '4px', height: '18px', background: '#fb923c', borderRadius: '2px' }}></div>
                  重點防護 - 迎風面方案與鍍膜加購
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                  {/* 迎風面方案 */}
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 'bold', color: '#c2410c', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={18} color="#ea580c" />
                      迎風面犀牛皮方案
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {FRONT_PPF_PRICING.map((item) => (
                        <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                          <div>
                            <div style={{ fontSize: '0.95rem', color: '#c2410c', fontWeight: '800' }}>{item.name}</div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                              <span style={{ fontSize: '0.72rem', padding: '2px 7px', background: '#fef3c7', color: '#b45309', borderRadius: '4px', fontWeight: '700' }}>
                                保固: {item.warranty}
                              </span>
                              <span style={{ fontSize: '0.72rem', padding: '2px 7px', background: '#ffedd5', color: '#9a3412', borderRadius: '4px', fontWeight: '700' }}>
                                厚度: {item.thickness}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#9a3412' }}>
                            ${calculateFrontPpfPrice(item.basePrice, selectedVehicle.size).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: '1.6' }}>
                        💡 <strong>迎風面包含：</strong>前保桿、引擎蓋、左右葉子板、後視鏡。
                      </div>
                    </div>
                  </div>

                  {/* 迎風面加購後半車鍍膜 */}
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={18} color="#f97316" />
                      迎風面加購 - 後半車鍍膜
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {Object.entries(REAR_COATING_PRICING).map(([name, base]) => (
                        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                          <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: '700' }}>{name}</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#f97316' }}>
                            +${calculateRearCoatingPrice(base, selectedVehicle.size).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
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
