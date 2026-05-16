import React from 'react';
import { PriceInquiryPage } from './PriceInquiryPage';
import { ShieldCheck } from 'lucide-react';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 頂部導航欄 / 品牌標誌 */}
      <nav style={{ 
        padding: '15px 30px', 
        background: '#fff', 
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '900',
            fontSize: '1.2rem'
          }}>
            H
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#1e293b' }}>好室多膜</h1>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px' }}>HOUSE WRAPPER</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.85rem', fontWeight: '600', background: '#f0fdf4', padding: '6px 12px', borderRadius: '20px' }}>
          <ShieldCheck size={16} /> 官方施工查價系統
        </div>
      </nav>

      {/* 內容區塊 */}
      <main style={{ flex: 1, padding: '20px 0' }}>
        <PriceInquiryPage vehicleMaster={[]} initialMode="film" />
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
