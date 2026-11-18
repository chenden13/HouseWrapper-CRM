import React, { useState } from 'react';
import { PriceInquiryPage } from './PriceInquiryPage';
import { AxColorPage } from './AxColorPage';
import { PriceSheetPage } from './PriceSheetPage';
import { ShieldCheck, Palette, LayoutDashboard, FileSpreadsheet } from 'lucide-react';

function App() {
  const getViewFromUrl = (): 'main' | 'priceSheet' | 'axColor' => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'priceSheet' || params.has('size') || window.location.hash.includes('priceSheet')) {
        return 'priceSheet';
      }
      if (params.get('view') === 'axColor' || window.location.hash.includes('axColor')) {
        return 'axColor';
      }
    }
    return 'main';
  };

  const [view, setView] = useState<'main' | 'priceSheet' | 'axColor'>(getViewFromUrl);

  // 監聽瀏覽器上一頁/下一頁
  React.useEffect(() => {
    const handlePopState = () => {
      setView(getViewFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleViewChange = (newView: 'main' | 'priceSheet' | 'axColor') => {
    setView(newView);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newView === 'main') {
        url.searchParams.delete('view');
        url.searchParams.delete('size');
      } else if (newView === 'priceSheet') {
        url.searchParams.set('view', 'priceSheet');
        if (!url.searchParams.has('size')) {
          url.searchParams.set('size', 'S');
        }
      } else if (newView === 'axColor') {
        url.searchParams.set('view', 'axColor');
        url.searchParams.delete('size');
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 頂部導航列 / 品牌標識 */}
      <nav style={{ 
        padding: '15px 30px', 
        background: '#fff', 
        borderBottom: '2px solid #fb923c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 6px -1px rgba(251, 146, 60, 0.1)',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <img src="./logo.jpg" alt="好室多膜 LOGO" style={{ width: '60px', height: 'auto', borderRadius: '8px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: '#fb923c' }}>好室多膜</h1>
            <div style={{ fontSize: '0.9rem', color: '#fb923c', fontWeight: 'bold', letterSpacing: '2px' }}>HOUSE WRAPPER</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginLeft: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleViewChange('main')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.2s',
                background: view === 'main' ? '#fb923c' : '#f1f5f9',
                color: view === 'main' ? '#fff' : '#64748b'
              }}
            >
              <LayoutDashboard size={18} /> 車型查詢試算
            </button>
            <button
              onClick={() => handleViewChange('axColor')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.2s',
                background: view === 'axColor' ? '#fb923c' : '#f1f5f9',
                color: view === 'axColor' ? '#fff' : '#64748b'
              }}
            >
              <Palette size={18} /> AX 2026 EV 顏色查價
            </button>
            <button
              onClick={() => handleViewChange('priceSheet')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '0.95rem', transition: 'all 0.2s',
                background: view === 'priceSheet' ? '#fb923c' : '#f1f5f9',
                color: view === 'priceSheet' ? '#fff' : '#64748b'
              }}
            >
              <FileSpreadsheet size={18} /> 官方價目表 (犀牛皮 / 改色)
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316', fontSize: '1rem', fontWeight: '800', background: '#fff7ed', padding: '8px 16px', borderRadius: '20px', border: '1px solid #ffedd5' }}>
          <ShieldCheck size={20} /> 好室多膜專屬查價系統
        </div>
      </nav>

      {/* 內容區塊 */}
      <main style={{ flex: 1, padding: '20px 0' }}>
        {view === 'priceSheet' ? (
          <PriceSheetPage />
        ) : view === 'main' ? (
          <PriceInquiryPage vehicleMaster={[]} />
        ) : (
          <AxColorPage />
        )}
      </main>

      {/* 底部資訊 */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>
          © 2026 好室多膜 House Wrapper. All rights reserved.
        </p>
        <div style={{ color: '#94a3b8', fontSize: '0.8rem', maxWidth: '600px', margin: '0 auto' }}>
          * 本系統提供之價格僅供參考，實際施工費用將根據車況、耗材選擇及現場評估為準。歡迎聯繫各分店進行精確報價。
        </div>
      </footer>
    </div>
  );
}

export default App;
