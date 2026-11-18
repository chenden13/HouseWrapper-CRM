import React, { useState, useEffect } from 'react';
import { ShieldCheck, Palette, FileText, Share2, Check, Download, ZoomIn, X } from 'lucide-react';

type SizeKey = 'S' | 'M' | 'L' | 'XL' | '2XL';

const SIZES: SizeKey[] = ['S', 'M', 'L', 'XL', '2XL'];

// 尺寸加價 (S為基準)
const SIZE_OFFSET: Record<SizeKey, number> = {
  'S': 0,
  'M': 5000,
  'L': 10000,
  'XL': 15000,
  '2XL': 20000,
};

const calcWrap = (base: number, size: SizeKey) => base + SIZE_OFFSET[size];

const calcFront = (base: number, size: SizeKey) => {
  if (['S', 'M', 'L'].includes(size)) return base;
  if (size === 'XL') return base + 5000;
  if (size === '2XL') return base + 10000;
  return base;
};

const calcRearCoating = (base: number, size: SizeKey) => {
  if (['S', 'M'].includes(size)) return base;
  if (size === 'L') return base + 1000;
  if (size === 'XL') return base + 2000;
  if (size === '2XL') return base + 3000;
  return base;
};

// 犀牛皮資料
const PPF_DATA = {
  glossy: [
    { brand: '大陸 AX', model: 'K系列', thickness: '7.5mil', warranty: '保固5年', base: 90000, hot: false },
    { brand: '大陸 AX', model: 'X系列', thickness: '8.5mil', warranty: '保固7年', base: 100000, hot: false },
    { brand: '美國 STEK', model: 'C clear', thickness: '7.5mil', warranty: '保固5年', base: 110000, hot: false },
    { brand: '美國 3M', model: '150G', thickness: '7.5mil', warranty: '保固5年', base: 125000, hot: false },
    { brand: '美國 3M', model: '200G', thickness: '7.9mil', warranty: '保固7年', base: 135000, hot: true },
    { brand: '美國 STEK', model: 'DYNO PURE+', thickness: '8.0mil', warranty: '保固7年', base: 140000, hot: true },
  ],
  matte: [
    { brand: '大陸 AX', model: 'M系列', thickness: '8.5mil', warranty: '保固7年', base: 100000, hot: false },
    { brand: '美國 STEK', model: 'C matte', thickness: '7.5mil', warranty: '保固5年', base: 120000, hot: false },
    { brand: '美國 3M', model: '200M', thickness: '7.9mil', warranty: '保固7年', base: 145000, hot: true },
    { brand: '美國 STEK', model: 'DYNO matte', thickness: '8.0mil', warranty: '保固7年', base: 150000, hot: false },
  ],
  front: [
    { brand: '台灣 pixel8bit', thickness: '7.5mil', warranty: '保固5年', base: 35000, hot: false },
    { brand: '美國 3M 150G', thickness: '7.5mil', warranty: '保固5年', base: 45000, hot: false },
    { brand: '美國 3M 200G', thickness: '7.9mil', warranty: '保固7年', base: 55000, hot: true },
  ],
  coating: [
    { name: 'ServFaces (一年期)', desc: '一年保養兩次', base: 12000 },
    { name: 'CarPro (兩年期)', desc: '一年保養兩次', base: 18000 },
  ]
};

// 改色資料
const COLOR_WRAP_DATA = {
  ax: [
    { type: 'AX 基本色系', series: 'E系列', base: 60000 },
    { type: 'AX 特殊色系一階', series: 'V系列', base: 63000 },
    { type: 'AX 特殊色系二階', series: 'G系列', base: 65000 },
    { type: 'AX 特殊色系三階', series: 'T系列', base: 68000 },
  ],
  m3: [
    { type: '3M 基本色系', series: 'G/M/S系列', base: 70000 },
    { type: '3M 特殊色系一階', series: 'GP/SP系列', base: 75000 },
    { type: '3M 特殊色系二階', series: 'HG系列', base: 80000 },
  ],
  frontPpfAddon: {
    title: '常跑高速 ｜ 車頭加強犀牛皮防護',
    sub1: '建議加強防護的鈑件：引擎蓋、前葉子版',
    sub2: '前保桿及後照鏡為塑膠件不建議加價防護',
    brand: '國產 pixel8bit',
    thickness: '7.5mil',
    price: 18000,
    note: '* 犀牛皮為保護原漆，貼在改色下方避免跳石打破改色後傷到底漆'
  }
};

export const PriceSheetPage: React.FC = () => {
  const getInitialSize = (): SizeKey => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = (params.get('size') || '').toUpperCase();
      if (SIZES.includes(s as SizeKey)) return s as SizeKey;
      const hashMatch = window.location.hash.match(/size=([A-Z0-9]+)/i);
      if (hashMatch && SIZES.includes(hashMatch[1].toUpperCase() as SizeKey)) {
        return hashMatch[1].toUpperCase() as SizeKey;
      }
    }
    return 'S';
  };

  const [sheetType, setSheetType] = useState<'ppf' | 'wrap'>('ppf');
  const [selectedSize, setSelectedSize] = useState<SizeKey>(getInitialSize);
  const [viewMode, setViewMode] = useState<'poster' | 'allTable'>('poster');
  const [copied, setCopied] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  const isExportMode = typeof window !== 'undefined' && (
    window.location.search.includes('export=1') ||
    window.location.hash.includes('export')
  );

  // 監聽瀏覽器上一頁/下一頁
  useEffect(() => {
    const handlePopState = () => {
      setSelectedSize(getInitialSize());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectSize = (size: SizeKey) => {
    setSelectedSize(size);
    setViewMode('poster');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'priceSheet');
      url.searchParams.set('size', size);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?view=priceSheet&size=${selectedSize}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const ppfFilename = `犀牛皮價目表_${selectedSize}尺寸.jpg`;
  const wrapFilename = `改色價目表_${selectedSize}尺寸.jpg`;
  const exportFilename = `${sheetType === 'ppf' ? '犀牛皮價目表' : '改色價目表'}_${selectedSize}尺寸.jpg`;

  return (
    <div style={{ maxWidth: '1480px', margin: '0 auto', padding: '10px 20px 60px 20px' }}>
      {/* 操作導航列 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '15px', 
        marginBottom: '25px',
        padding: '16px 20px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0'
      }}>
        {/* 左側標題與目前尺寸標籤 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>好室多膜 官方價目表</span>
              <span style={{ fontSize: '0.85rem', padding: '2px 10px', background: '#fb923c', color: '#fff', borderRadius: '8px', fontWeight: 'bold' }}>
                {selectedSize} 尺寸
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              犀牛皮與改色雙海報並排呈現 ｜ 具備專屬獨立網址可直接分享
            </div>
          </div>

          {/* Export 模式專用切換器（維持 Puppeteer 自動匯出腳本相容性） */}
          {isExportMode && (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
              <button
                data-testid="tab-ppf"
                onClick={() => setSheetType('ppf')}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: '800', fontSize: '0.85rem',
                  background: sheetType === 'ppf' ? '#0f766e' : '#f1f5f9',
                  color: sheetType === 'ppf' ? '#fff' : '#64748b'
                }}
              >
                犀牛皮價目表
              </button>
              <button
                data-testid="tab-wrap"
                onClick={() => setSheetType('wrap')}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: '800', fontSize: '0.85rem',
                  background: sheetType === 'wrap' ? '#ea580c' : '#f1f5f9',
                  color: sheetType === 'wrap' ? '#fff' : '#64748b'
                }}
              >
                改色價目表
              </button>
            </div>
          )}
        </div>

        {/* 尺寸選擇器 & 複製獨立網址按鈕 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', marginRight: '2px' }}>尺寸:</span>
          {SIZES.map(s => (
            <button
              key={s}
              data-testid={`size-${s}`}
              onClick={() => handleSelectSize(s)}
              style={{
                padding: '7px 15px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '900',
                fontSize: '0.92rem',
                background: selectedSize === s && viewMode === 'poster' ? '#1e293b' : '#f8fafc',
                color: selectedSize === s && viewMode === 'poster' ? '#fff' : '#475569',
                boxShadow: selectedSize === s && viewMode === 'poster' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: selectedSize === s && viewMode === 'poster' ? '#1e293b' : '#e2e8f0',
                transition: 'all 0.15s'
              }}
            >
              {s}尺寸
            </button>
          ))}

          {/* 複製本尺寸專屬連結 */}
          <button
            onClick={handleCopyLink}
            title={`複製 ${selectedSize} 尺寸獨立網址`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #fed7aa',
              background: copied ? '#ecfdf5' : '#fff7ed',
              color: copied ? '#059669' : '#c2410c',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.88rem',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            {copied ? <Check size={16} color="#059669" /> : <Share2 size={16} />}
            <span>{copied ? `已複製 ${selectedSize} 尺寸連結！` : `複製 ${selectedSize} 專屬連結`}</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'allTable' ? 'poster' : 'allTable')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.88rem',
              background: viewMode === 'allTable' ? '#3b82f6' : '#fff',
              color: viewMode === 'allTable' ? '#fff' : '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FileText size={15} /> 全尺寸對照表
          </button>
        </div>
      </div>

      {/* 視圖 1: 海報模式 */}
      {viewMode === 'poster' && (
        <>
          {/* 官方圖檔模式：改色與犀牛皮一起顯示 (左右兩張並排，手機自動上下排列) */}
          {!isExportMode && (
            <div className="posters-dual-grid">
              {/* 左邊海報：犀牛皮價目表 */}
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '18px',
                boxShadow: '0 12px 30px -6px rgba(15, 118, 110, 0.12), 0 0 0 1px rgba(15, 118, 110, 0.12)',
                border: '1px solid #ccfbf1',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.08rem', fontWeight: '900', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        犀牛皮官方價目表
                        <span style={{ fontSize: '0.78rem', padding: '2px 8px', background: '#ccfbf1', color: '#0f766e', borderRadius: '6px', fontWeight: '800' }}>
                          {selectedSize} 尺寸
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>AX系列 / STEK / 3M 原廠保固</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setLightboxImage({ src: `./price_sheets_jpg/${ppfFilename}?v=3`, title: `犀牛皮官方價目表 (${selectedSize}尺寸)` })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                        background: '#f8fafc', color: '#334155', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer'
                      }}
                    >
                      <ZoomIn size={14} /> 放大
                    </button>
                    <a
                      href={`./price_sheets_jpg/${ppfFilename}`}
                      download={ppfFilename}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 12px', borderRadius: '8px', border: 'none',
                        background: '#0f766e', color: '#fff', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none'
                      }}
                    >
                      <Download size={14} /> 下載JPG
                    </a>
                  </div>
                </div>

                <div
                  onClick={() => setLightboxImage({ src: `./price_sheets_jpg/${ppfFilename}?v=3`, title: `犀牛皮官方價目表 (${selectedSize}尺寸)` })}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(184, 150, 96, 0.4)',
                    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.06)',
                    cursor: 'zoom-in',
                    background: '#fff'
                  }}
                  title="點擊查看超高清大圖"
                >
                  <img 
                    src={`./price_sheets_jpg/${ppfFilename}?v=3`} 
                    alt={`犀牛皮價目表 - ${selectedSize}尺寸`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>

              {/* 右邊海報：改色價目表 */}
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '18px',
                boxShadow: '0 12px 30px -6px rgba(234, 88, 12, 0.12), 0 0 0 1px rgba(234, 88, 12, 0.12)',
                border: '1px solid #ffedd5',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Palette size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.08rem', fontWeight: '900', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        全車改色官方價目表
                        <span style={{ fontSize: '0.78rem', padding: '2px 8px', background: '#ffedd5', color: '#c2410c', borderRadius: '6px', fontWeight: '800' }}>
                          {selectedSize} 尺寸
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>AX 2000系列 / 3M 2080 色系</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setLightboxImage({ src: `./price_sheets_jpg/${wrapFilename}?v=3`, title: `改色官方價目表 (${selectedSize}尺寸)` })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                        background: '#f8fafc', color: '#334155', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer'
                      }}
                    >
                      <ZoomIn size={14} /> 放大
                    </button>
                    <a
                      href={`./price_sheets_jpg/${wrapFilename}`}
                      download={wrapFilename}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 12px', borderRadius: '8px', border: 'none',
                        background: '#ea580c', color: '#fff', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none'
                      }}
                    >
                      <Download size={14} /> 下載JPG
                    </a>
                  </div>
                </div>

                <div
                  onClick={() => setLightboxImage({ src: `./price_sheets_jpg/${wrapFilename}?v=3`, title: `改色官方價目表 (${selectedSize}尺寸)` })}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(184, 150, 96, 0.4)',
                    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.06)',
                    cursor: 'zoom-in',
                    background: '#fff'
                  }}
                  title="點擊查看超高清大圖"
                >
                  <img 
                    src={`./price_sheets_jpg/${wrapFilename}?v=3`} 
                    alt={`改色價目表 - ${selectedSize}尺寸`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 即時 HTML 排版畫布 (用於 Puppeteer 自動匯出高解析度 JPG) */}
          {isExportMode && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div 
                id="price-poster-canvas"
            style={{
              width: '100%',
              maxWidth: '720px',
              background: `
                radial-gradient(ellipse 80% 30% at 50% 8%, rgba(255, 255, 255, 0.98) 0%, rgba(245, 249, 252, 0.8) 45%, transparent 75%),
                radial-gradient(circle at 12% 20%, rgba(200, 218, 232, 0.35) 0%, transparent 45%),
                radial-gradient(circle at 88% 75%, rgba(195, 215, 230, 0.3) 0%, transparent 45%),
                radial-gradient(circle at 85% 15%, rgba(210, 225, 238, 0.4) 0%, transparent 40%),
                radial-gradient(circle at 15% 82%, rgba(200, 220, 235, 0.35) 0%, transparent 45%),
                linear-gradient(142deg, #e4ecf2 0%, #edf3f7 22%, #f5f8fb 48%, #eaf0f5 76%, #dce6ed 100%)
              `,
              borderRadius: '8px',
              boxShadow: '0 25px 60px -15px rgba(30, 58, 85, 0.16), 0 0 0 1px rgba(180, 155, 105, 0.35)',
              position: 'relative',
              padding: '45px 35px 30px 35px',
              fontFamily: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
              border: '1px solid rgba(184, 150, 96, 0.45)',
              overflow: 'hidden'
            }}
          >
            {/* 奢華幾何燙金線條裝飾 (精準還原原圖高質感設計) */}
            <svg 
              viewBox="0 0 720 1024" 
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                pointerEvents: 'none',
                zIndex: 0
              }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="goldLine1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b38f4d" stopOpacity="0.4" />
                  <stop offset="35%" stopColor="#dfc288" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#e5cca0" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#b38f4d" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="goldLine2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e5cca0" stopOpacity="0.9" />
                  <stop offset="45%" stopColor="#c5a059" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#9a7536" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* 左上角交叉晶芒幾何線 */}
              <line x1="0" y1="280" x2="380" y2="40" stroke="url(#goldLine1)" strokeWidth="1.3" />
              <line x1="75" y1="0" x2="0" y2="560" stroke="url(#goldLine2)" strokeWidth="1.3" />
              <line x1="0" y1="120" x2="220" y2="0" stroke="url(#goldLine1)" strokeWidth="1.0" opacity="0.8" />

              {/* 右上角交叉晶芒幾何線 */}
              <line x1="380" y1="40" x2="720" y2="240" stroke="url(#goldLine2)" strokeWidth="1.3" />
              <line x1="620" y1="0" x2="720" y2="480" stroke="url(#goldLine1)" strokeWidth="1.3" />
              <line x1="500" y1="0" x2="720" y2="140" stroke="url(#goldLine2)" strokeWidth="1.0" opacity="0.8" />

              {/* 左下角交叉晶芒幾何線 */}
              <line x1="0" y1="640" x2="360" y2="990" stroke="url(#goldLine1)" strokeWidth="1.3" />
              <line x1="0" y1="800" x2="260" y2="1024" stroke="url(#goldLine2)" strokeWidth="1.1" opacity="0.85" />
              <line x1="0" y1="910" x2="140" y2="1024" stroke="url(#goldLine1)" strokeWidth="0.9" opacity="0.7" />

              {/* 右下角交叉晶芒幾何線 */}
              <line x1="360" y1="990" x2="720" y2="740" stroke="url(#goldLine2)" strokeWidth="1.3" />
              <line x1="470" y1="1024" x2="720" y2="850" stroke="url(#goldLine1)" strokeWidth="1.1" opacity="0.85" />
              <line x1="590" y1="1024" x2="720" y2="930" stroke="url(#goldLine2)" strokeWidth="0.9" opacity="0.7" />

              {/* 頂部頂點晶芒 */}
              <circle cx="380" cy="40" r="2.5" fill="#f3e3be" opacity="0.9" />
              <circle cx="360" cy="990" r="2.5" fill="#f3e3be" opacity="0.9" />
            </svg>

            {/* 中央品牌大浮水印 (原圖防偽印記質感) */}
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '340px',
              height: '340px',
              pointerEvents: 'none',
              opacity: 0.048,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 0
            }}>
              <img 
                src="./logo.jpg" 
                alt="Brand Watermark" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  filter: 'grayscale(100%) contrast(180%)',
                  borderRadius: '24px'
                }} 
              />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* ===================== 犀牛皮價目表 ===================== */}
              {sheetType === 'ppf' && (
                <div>
                  {/* 主標題 */}
                  <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h1 style={{ 
                      fontSize: '2.8rem', 
                      letterSpacing: '12px', 
                      fontWeight: '900', 
                      color: '#0f172a', 
                      margin: '0 0 8px 0',
                      fontFamily: '"Noto Serif TC", "Songti TC", "STSong", "SimSun", "Baskerville", serif',
                      textShadow: '0 2px 10px rgba(255, 255, 255, 0.95), 0 4px 18px rgba(180, 155, 115, 0.22)'
                    }}>
                      犀牛皮價目表
                    </h1>
                    <div style={{ 
                      fontSize: '0.96rem', 
                      color: '#334155', 
                      fontWeight: '700', 
                      letterSpacing: '2px' 
                    }}>
                      報價皆不含鋼琴烤漆、鍍鉻件、燈具、塑料件、內裝
                    </div>
                  </div>

                  {/* 1. 全車亮面犀牛皮方案 */}
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ 
                      textAlign: 'center', 
                      borderTop: '1px solid #64748b', 
                      borderBottom: '1px solid #64748b',
                      padding: '8px 0',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', letterSpacing: '2px' }}>
                        全車亮面犀牛皮方案
                      </span>
                      <span style={{ margin: '0 10px', color: '#64748b' }}>｜</span>
                      <span style={{ fontSize: '1.02rem', color: '#334155', fontWeight: '500' }}>
                        包含與車身漆面同色的鈑件
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {PPF_DATA.glossy.map((item, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1.35fr 0.85fr',
                            alignItems: 'center',
                            padding: '7px 10px',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '1.02rem'
                          }}
                        >
                          <div style={{ color: '#1e293b', fontWeight: '700' }}>
                            {item.brand} {item.model} {item.hot && <span style={{ color: '#ef4444' }}>🔥</span>}
                          </div>
                          <div style={{ textAlign: 'center', color: '#475569', fontWeight: '600', fontSize: '0.94rem' }}>
                            <span style={{ borderLeft: '1px solid #94a3b8', borderRight: '1px solid #94a3b8', padding: '0 12px', display: 'inline-block' }}>
                              <span>{item.warranty}</span>
                              <span style={{ margin: '0 10px', color: '#94a3b8' }}>｜</span>
                              <span>厚度 {item.thickness}</span>
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', fontWeight: '900', color: '#0f172a', fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                            ${calcWrap(item.base, selectedSize).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. 全車消光犀牛皮方案 */}
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ 
                      textAlign: 'center', 
                      borderTop: '1px solid #64748b', 
                      borderBottom: '1px solid #64748b',
                      padding: '8px 0',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', letterSpacing: '2px' }}>
                        全車消光犀牛皮方案
                      </span>
                      <span style={{ margin: '0 10px', color: '#64748b' }}>｜</span>
                      <span style={{ fontSize: '1.02rem', color: '#334155', fontWeight: '500' }}>
                        包含與車身漆面同色的鈑件
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {PPF_DATA.matte.map((item, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1.35fr 0.85fr',
                            alignItems: 'center',
                            padding: '7px 10px',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '1.02rem'
                          }}
                        >
                          <div style={{ color: '#1e293b', fontWeight: '700' }}>
                            {item.brand} {item.model} {item.hot && <span style={{ color: '#ef4444' }}>🔥</span>}
                          </div>
                          <div style={{ textAlign: 'center', color: '#475569', fontWeight: '600', fontSize: '0.94rem' }}>
                            <span style={{ borderLeft: '1px solid #94a3b8', borderRight: '1px solid #94a3b8', padding: '0 12px', display: 'inline-block' }}>
                              <span>{item.warranty}</span>
                              <span style={{ margin: '0 10px', color: '#94a3b8' }}>｜</span>
                              <span>厚度 {item.thickness}</span>
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', fontWeight: '900', color: '#0f172a', fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                            ${calcWrap(item.base, selectedSize).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. 迎風面犀牛皮方案 */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      textAlign: 'center', 
                      borderTop: '1px solid #64748b', 
                      borderBottom: '1px solid #64748b',
                      padding: '8px 0',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', letterSpacing: '2px' }}>
                        迎風面犀牛皮方案
                      </span>
                      <span style={{ margin: '0 10px', color: '#64748b' }}>｜</span>
                      <span style={{ fontSize: '1.02rem', color: '#334155', fontWeight: '500' }}>
                        含引擎蓋、前葉子版、保桿、後照鏡
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {PPF_DATA.front.map((item, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1.35fr 0.85fr',
                            alignItems: 'center',
                            padding: '7px 10px',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '1.02rem'
                          }}
                        >
                          <div style={{ color: '#1e293b', fontWeight: '700' }}>
                            {item.brand} {item.hot && <span style={{ color: '#ef4444' }}>🔥</span>}
                          </div>
                          <div style={{ textAlign: 'center', color: '#475569', fontWeight: '600', fontSize: '0.94rem' }}>
                            <span style={{ borderLeft: '1px solid #94a3b8', borderRight: '1px solid #94a3b8', padding: '0 12px', display: 'inline-block' }}>
                              <span>{item.warranty}</span>
                              <span style={{ margin: '0 10px', color: '#94a3b8' }}>｜</span>
                              <span>厚度 {item.thickness}</span>
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', fontWeight: '900', color: '#0f172a', fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                            ${calcFront(item.base, selectedSize).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. 迎風面限定 ｜ 後半部加購鍍膜 (金色橫幅) */}
                  <div style={{ 
                    background: '#e2d5c3', 
                    borderRadius: '4px', 
                    overflow: 'hidden',
                    border: '1px solid #d4c4af',
                    marginBottom: '20px'
                  }}>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '8px 0', 
                      background: '#d4c4af', 
                      color: '#3d3122', 
                      fontWeight: '800', 
                      fontSize: '1.1rem',
                      letterSpacing: '1px'
                    }}>
                      迎風面限定 ｜ 後半部加購鍍膜
                    </div>
                    <div style={{ padding: '8px 12px', background: '#ece3d6' }}>
                      {PPF_DATA.coating.map((item, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1.35fr 0.85fr',
                            alignItems: 'center',
                            padding: '6px 0',
                            fontSize: '1.02rem'
                          }}
                        >
                          <div style={{ color: '#292524', fontWeight: '700' }}>{item.name}</div>
                          <div style={{ textAlign: 'center', color: '#57534e', fontWeight: '600', fontSize: '0.96rem' }}>{item.desc}</div>
                          <div style={{ textAlign: 'right', fontWeight: '900', color: '#1c1917', fontSize: '1.2rem' }}>
                            ${calcRearCoating(item.base, selectedSize).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===================== 改色價目表 ===================== */}
              {sheetType === 'wrap' && (
                <div>
                  {/* 主標題 */}
                  <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h1 style={{ 
                      fontSize: '2.8rem', 
                      letterSpacing: '12px', 
                      fontWeight: '900', 
                      color: '#0f172a', 
                      margin: '0 0 8px 0',
                      fontFamily: '"Noto Serif TC", "Songti TC", "STSong", "SimSun", "Baskerville", serif',
                      textShadow: '0 2px 10px rgba(255, 255, 255, 0.95), 0 4px 18px rgba(180, 155, 115, 0.22)'
                    }}>
                      改色價目表
                    </h1>
                    <div style={{ 
                      fontSize: '0.96rem', 
                      color: '#334155', 
                      fontWeight: '700', 
                      letterSpacing: '2px' 
                    }}>
                      報價皆不含鋼琴烤漆、鍍鉻件、燈具、塑料件、內裝
                    </div>
                  </div>

                  {/* 1. AX 改色方案 */}
                  <div style={{ marginBottom: '25px' }}>
                    <div style={{ 
                      textAlign: 'center', 
                      borderTop: '1px solid #64748b', 
                      borderBottom: '1px solid #64748b',
                      padding: '8px 0',
                      marginBottom: '10px'
                    }}>
                      <span style={{ color: '#ef4444', marginRight: '6px' }}>🔥</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', letterSpacing: '2px' }}>
                        AX改色方案
                      </span>
                      <span style={{ margin: '0 10px', color: '#64748b' }}>｜</span>
                      <span style={{ fontSize: '1.02rem', color: '#334155', fontWeight: '500' }}>
                        包含與車身漆面同色的鈑件
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {COLOR_WRAP_DATA.ax.map((item, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.3fr 1.1fr 1fr',
                            alignItems: 'center',
                            padding: '7px 10px',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '1.02rem'
                          }}
                        >
                          <div style={{ color: '#1e293b', fontWeight: '700' }}>{item.type}</div>
                          <div style={{ textAlign: 'center', color: '#475569', fontWeight: '600', fontSize: '1.0rem' }}>
                            <span style={{ borderLeft: '1px solid #94a3b8', borderRight: '1px solid #94a3b8', padding: '0 16px' }}>
                              {item.series}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', fontWeight: '900', color: '#0f172a', fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                            ${calcWrap(item.base, selectedSize).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. 3M 2080 方案 */}
                  <div style={{ marginBottom: '25px' }}>
                    <div style={{ 
                      textAlign: 'center', 
                      borderTop: '1px solid #64748b', 
                      borderBottom: '1px solid #64748b',
                      padding: '8px 0',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', letterSpacing: '2px' }}>
                        3M 2080 方案
                      </span>
                      <span style={{ margin: '0 10px', color: '#64748b' }}>｜</span>
                      <span style={{ fontSize: '1.02rem', color: '#334155', fontWeight: '500' }}>
                        包含與車身漆面同色的鈑件
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {COLOR_WRAP_DATA.m3.map((item, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.3fr 1.1fr 1fr',
                            alignItems: 'center',
                            padding: '7px 10px',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '1.02rem'
                          }}
                        >
                          <div style={{ color: '#1e293b', fontWeight: '700' }}>{item.type}</div>
                          <div style={{ textAlign: 'center', color: '#475569', fontWeight: '600', fontSize: '1.0rem' }}>
                            <span style={{ borderLeft: '1px solid #94a3b8', borderRight: '1px solid #94a3b8', padding: '0 16px' }}>
                              {item.series}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', fontWeight: '900', color: '#0f172a', fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                            ${calcWrap(item.base, selectedSize).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. 常跑高速 ｜ 車頭加強犀牛皮防護 (金黃色橫幅區塊 + 說明) */}
                  <div style={{ 
                    background: '#e2d5c3', 
                    borderRadius: '4px', 
                    overflow: 'hidden',
                    border: '1px solid #d4c4af',
                    marginBottom: '20px'
                  }}>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '8px 0', 
                      background: '#d4c4af', 
                      color: '#3d3122', 
                      fontWeight: '800', 
                      fontSize: '1.12rem',
                      letterSpacing: '1px'
                    }}>
                      常跑高速 ｜ 車頭加強犀牛皮防護
                    </div>
                    <div style={{ padding: '16px 20px', background: '#ece3d6', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.02rem', color: '#292524', fontWeight: '700', marginBottom: '4px' }}>
                        建議加強防護的鈑件：引擎蓋、前葉子版
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#57534e', marginBottom: '8px' }}>
                        前保桿及後照鏡為塑膠件不建議加價防護
                      </div>
                      <div style={{ fontSize: '1.25rem', color: '#9a3412', fontWeight: '900', marginBottom: '6px' }}>
                        國產 pixel8bit (厚度 {COLOR_WRAP_DATA.frontAddon.thickness}) ${COLOR_WRAP_DATA.frontAddon.price.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#78716c', fontStyle: 'italic' }}>
                        * 犀牛皮為保護原漆，貼在改色下方避免跳石打破改色後傷到底漆
                      </div>
                    </div>
                  </div>

                  {/* 車頭加強防護部位示意圖 (直接呈現車型展示圖，無多餘白邊) */}
                  <div style={{ 
                    textAlign: 'center',
                    marginTop: '8px',
                    marginBottom: '5px'
                  }}>
                    <img 
                      src="./car_front_diagram.png" 
                      alt="常跑高速車頭加強防護部位示意圖 (引擎蓋、前葉子版)" 
                      style={{ 
                        width: '100%', 
                        maxWidth: '520px', 
                        height: 'auto', 
                        display: 'block', 
                        margin: '0 auto'
                      }} 
                    />
                  </div>
                </div>
              )}

              {/* 右下角尺寸標示 (仿海報水印) */}
              <div style={{ 
                textAlign: 'right', 
                marginTop: '25px', 
                fontSize: '1.38rem', 
                fontWeight: '900', 
                color: '#334155',
                letterSpacing: '2px'
              }}>
                {selectedSize}尺寸
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )}

      {/* 視圖 2: 全尺寸對照表 (S, M, L, XL, 2XL 一覽) */}
      {viewMode === 'allTable' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                {sheetType === 'ppf' ? '🛡️ 新版犀牛皮全尺寸報價一覽表' : '🎨 改色膜全尺寸報價一覽表'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                所有尺寸一次對照（S為基準價，M +$5,000 / L +$10,000 / XL +$15,000 / 2XL +$20,000）
              </p>
            </div>
          </div>

          {sheetType === 'ppf' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155' }}>方案 / 品項</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', color: '#334155' }}>保固</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', color: '#334155' }}>規格厚度</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#0f766e', background: '#f0fdf4' }}>S 尺寸(基準)</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#0369a1' }}>M 尺寸</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#0369a1' }}>L 尺寸</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#0369a1' }}>XL 尺寸</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#0369a1' }}>2XL 尺寸</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 全車亮面 */}
                  <tr style={{ background: '#ecfdf5', fontWeight: '800', color: '#065f46' }}>
                    <td colSpan={8} style={{ padding: '8px 12px' }}>全車亮面犀牛皮方案</td>
                  </tr>
                  {PPF_DATA.glossy.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1e293b' }}>
                        {item.brand} {item.model} {item.hot && '🔥'}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>{item.warranty}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>厚度 {item.thickness}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#047857', background: '#f0fdf4' }}>
                        ${calcWrap(item.base, 'S').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'M').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'L').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'XL').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, '2XL').toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {/* 全車消光 */}
                  <tr style={{ background: '#f0f9ff', fontWeight: '800', color: '#075985' }}>
                    <td colSpan={8} style={{ padding: '8px 12px' }}>全車消光犀牛皮方案</td>
                  </tr>
                  {PPF_DATA.matte.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1e293b' }}>
                        {item.brand} {item.model} {item.hot && '🔥'}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>{item.warranty}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>厚度 {item.thickness}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#0284c7', background: '#f0fdf4' }}>
                        ${calcWrap(item.base, 'S').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'M').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'L').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'XL').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, '2XL').toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {/* 迎風面方案 */}
                  <tr style={{ background: '#fff7ed', fontWeight: '800', color: '#9a3412' }}>
                    <td colSpan={8} style={{ padding: '8px 12px' }}>迎風面犀牛皮方案 (前保桿/引擎蓋/葉子板/後視鏡)</td>
                  </tr>
                  {PPF_DATA.front.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1e293b' }}>
                        {item.brand} {item.hot && '🔥'}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>{item.warranty}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>厚度 {item.thickness}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#ea580c', background: '#f0fdf4' }}>
                        ${calcFront(item.base, 'S').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcFront(item.base, 'M').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcFront(item.base, 'L').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcFront(item.base, 'XL').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcFront(item.base, '2XL').toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {/* 迎風面限定加購鍍膜 */}
                  <tr style={{ background: '#fef3c7', fontWeight: '800', color: '#78350f' }}>
                    <td colSpan={8} style={{ padding: '8px 12px' }}>迎風面限定 ｜ 後半部加購鍍膜</td>
                  </tr>
                  {PPF_DATA.coating.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1e293b' }}>{item.name}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#64748b' }} colSpan={2}>{item.desc}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#b45309', background: '#f0fdf4' }}>
                        +${calcRearCoating(item.base, 'S').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        +${calcRearCoating(item.base, 'M').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        +${calcRearCoating(item.base, 'L').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        +${calcRearCoating(item.base, 'XL').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        +${calcRearCoating(item.base, '2XL').toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* 改色全尺寸對照表 */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155' }}>方案 / 色系</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', color: '#334155' }}>系列代號</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#ea580c', background: '#fff7ed' }}>S 尺寸</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#0369a1' }}>M 尺寸</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#0369a1' }}>L 尺寸</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#0369a1' }}>XL 尺寸</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', color: '#0369a1' }}>2XL 尺寸</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#fff1f2', fontWeight: '800', color: '#9f1239' }}>
                    <td colSpan={7} style={{ padding: '8px 12px' }}>🔥 AX 改色方案</td>
                  </tr>
                  {COLOR_WRAP_DATA.ax.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1e293b' }}>{item.type}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#475569' }}>{item.series}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#e11d48', background: '#fff7ed' }}>
                        ${calcWrap(item.base, 'S').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'M').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'L').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'XL').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, '2XL').toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  <tr style={{ background: '#fef2f2', fontWeight: '800', color: '#991b1b' }}>
                    <td colSpan={7} style={{ padding: '8px 12px' }}>3M 2080 方案</td>
                  </tr>
                  {COLOR_WRAP_DATA.m3.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1e293b' }}>{item.type}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#475569' }}>{item.series}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#dc2626', background: '#fff7ed' }}>
                        ${calcWrap(item.base, 'S').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'M').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'L').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, 'XL').toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                        ${calcWrap(item.base, '2XL').toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  <tr style={{ background: '#fef3c7', fontWeight: '800', color: '#78350f' }}>
                    <td colSpan={7} style={{ padding: '8px 12px' }}>常跑高速 ｜ 車頭加強犀牛皮防護 (引擎蓋+前葉子版)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1e293b' }}>國產 pixel8bit (7.5mil) 加強防護</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#475569' }}>Hood+Fender</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#b45309', background: '#fff7ed' }}>
                      +$18,000
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>+$18,000</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>+$18,000</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>+$18,000</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>+$18,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 燈箱超高清放大預覽 */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '960px',
              width: '100%',
              maxHeight: '92vh',
              background: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '12px 20px',
              background: '#1e293b',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#f8fafc' }}>{lightboxImage.title}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={lightboxImage.src}
                  download
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 14px', borderRadius: '8px', background: '#3b82f6', color: '#fff',
                    fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'none'
                  }}
                >
                  <Download size={15} /> 下載高畫質原圖
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer',
                    padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', padding: '15px', textAlign: 'center', background: '#0b1329' }}>
              <img src={lightboxImage.src} alt={lightboxImage.title} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} />
            </div>
          </div>
        </div>
      )}

      {/* 雙海報響應式排版 CSS */}
      <style>{`
        .posters-dual-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .posters-dual-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
        @media print {
          nav, footer, button {
            display: none !important;
          }
          body, #price-poster {
            background: #fff !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

