import React, { useState } from 'react';
import { Search, Hammer, Settings, Camera, Image as ImageIcon, Trash2, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import type { Customer } from '../types';

interface ActiveConstructionPageProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const ActiveConstructionPage: React.FC<ActiveConstructionPageProps> = ({ customers, onEditCustomer, onDeleteCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const constructionCustomers = customers.filter(c => {
    if (c.status !== 'construction') return false;

    const name = String(c.name || '').toLowerCase();
    const plate = String(c.plateNumber || '').toLowerCase();
    const phone = String(c.phone || '').toLowerCase();
    const model = String(c.model || '').toLowerCase();
    const brand = String(c.brand || '').toLowerCase();
    const mainService = String(c.mainService || '').toLowerCase();
    const mainServiceBrand = String(c.mainServiceBrand || '').toLowerCase();
    const film = String(c.filmColor || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      name.includes(term) || 
      plate.includes(term) || 
      phone.includes(term) ||
      model.includes(term) ||
      brand.includes(term) ||
      mainService.includes(term) ||
      mainServiceBrand.includes(term) ||
      film.includes(term)
    );
  });

  // 計算今天與明天的日期字串 (YYYY-MM-DD)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  // 1. 今日施工車輛 (所有狀態中，今天在施工期間內的)
  const todayConstruction = customers.filter(c => {
    if (c.status === 'completed' || c.status === 'new') return false;
    const start = c.constructionStartDate || '9999-99-99';
    const end = c.constructionEndDate || start;
    return todayStr >= start && todayStr <= end;
  });

  // 2. 今/明日外包與配件
  const upcomingTint = customers.filter(c => c.windowTintDate === todayStr || c.windowTintDate === tomorrowStr);
  const upcomingMirror = customers.filter(c => c.digitalMirrorDate === todayStr || c.digitalMirrorDate === tomorrowStr);
  const upcomingMod = customers.filter(c => c.electricModDate === todayStr || c.electricModDate === tomorrowStr);

  // 3. 今/明日交車
  const upcomingDelivery = customers.filter(c => (c.expectedEndDate === todayStr || c.expectedEndDate === tomorrowStr) && c.status !== 'completed');

  // 4. 提醒清單計算
  const missingPlates = constructionCustomers.filter(c => !c.plateNumber || c.plateNumber === '尚未掛牌');
  
  const missingTimeSettings = constructionCustomers.filter(c => {
    const hasTint = c.windowTint || c.tintDepthFrontWind || c.tintDepthFrontSeat || c.tintDepthRearSeat || c.tintDepthRearWind || c.tintDepthSunroof;
    const hasTintButNoTime = hasTint && (!c.windowTintDate || !c.windowTintScheduledTime);
    const hasMirrorButNoTime = c.digitalMirror && (!c.digitalMirrorDate || !c.digitalMirrorScheduledTime);
    const hasModButNoTime = c.electricMod && (!c.electricModDate || !c.electricModScheduledTime);
    const hasAccButNoTime = (c.customAccessories || []).some(a => !c.accessoryScheduling?.[a.id]);
    return hasTintButNoTime || hasMirrorButNoTime || hasModButNoTime || hasAccButNoTime;
  });

  // 排序：按預計交車日期排序
  const sorted = [...constructionCustomers].sort((a, b) => {
    const dateA = a.expectedEndDate || '9999-99-99';
    const dateB = b.expectedEndDate || '9999-99-99';
    return dateA.localeCompare(dateB);
  });

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1500px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Hammer size={24} color="var(--accent)" /> 店內施工監控總表
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>即時管理目前正在現場施工中的車輛預期進度</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋車主、車牌..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-panel"
              style={{ padding: '10px 15px 10px 40px', borderRadius: '12px', width: '280px', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
        </div>
      </header>

      {/* 異常提醒區塊 */}
      {(missingPlates.length > 0 || missingTimeSettings.length > 0) && (
        <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {missingPlates.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b' }}>
              <AlertTriangle size={20} color="#ef4444" />
              <span style={{ fontWeight: 'bold' }}>缺少車牌提醒：</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {missingPlates.map(c => <span key={c.id} style={{ background: '#fee2e2', padding: '2px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{c.name} ({c.brand} {c.model})</span>)}
              </div>
            </div>
          )}
          {missingTimeSettings.length > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b45309' }}>
              <AlertTriangle size={20} color="#f59e0b" />
              <span style={{ fontWeight: 'bold' }}>缺少配件/外包安裝時間：</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {missingTimeSettings.map(c => <span key={c.id} style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{c.plateNumber || c.name}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 當日待處理事項看板 */}
      <div style={{ marginBottom: '25px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        
        {/* 今日施工車輛 */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #3b82f6', background: '#fff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e293b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '24px', background: '#3b82f6', borderRadius: '4px' }}></span>
            今日施工車輛 ({todayConstruction.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
            {todayConstruction.length > 0 ? todayConstruction.map(c => {
              const washItem = c.constructionChecklist?.find(item => item.name.includes('前置清潔') || item.name.includes('預洗'));
              const isWashed = washItem?.checked;
              
              return (
                <div key={c.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0369a1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{c.plateNumber} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>{c.name}</span></span>
                    {!isWashed && <span style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>未清洗</span>}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#334155', marginTop: '4px' }}>{c.mainService} ({c.mainServiceBrand})</div>
                </div>
              );
            }) : <div style={{ color: '#94a3b8', padding: '10px 0' }}>今日無排定施工</div>}
          </div>
        </div>

        {/* 今/明日外包與配件 */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #f59e0b', background: '#fff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e293b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '24px', background: '#f59e0b', borderRadius: '4px' }}></span>
            今/明日外包與配件排程
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
            {upcomingTint.length === 0 && upcomingMirror.length === 0 && upcomingMod.length === 0 && (
              <div style={{ color: '#94a3b8', padding: '10px 0' }}>今明兩日無外包配件排程</div>
            )}
            
            {upcomingTint.map(c => {
              const isToday = c.windowTintDate === todayStr;
              return (
              <div key={`tint-${c.id}`} style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#b45309', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    {isToday ? <span style={{ fontSize: '0.75rem', background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>今日</span> : <span style={{ fontSize: '0.75rem', background: '#d97706', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>明日</span>}
                    {c.plateNumber} (隔熱紙)
                  </span>
                  <span style={{ color: '#d97706' }}>{c.windowTintScheduledTime || '未定時'}</span>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#92400e', marginTop: '4px' }}>
                  {c.windowTintVendor && `廠商: ${c.windowTintVendor} | `}{c.windowTintBrand} {c.windowTint}
                </div>
              </div>
            )})}

            {upcomingMirror.map(c => {
              const isToday = c.digitalMirrorDate === todayStr;
              return (
              <div key={`mirror-${c.id}`} style={{ background: '#f3e8ff', padding: '12px', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#6b21a8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    {isToday ? <span style={{ fontSize: '0.75rem', background: '#a855f7', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>今日</span> : <span style={{ fontSize: '0.75rem', background: '#9333ea', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>明日</span>}
                    {c.plateNumber} (電子後視鏡)
                  </span>
                  <span style={{ color: '#9333ea' }}>{c.digitalMirrorScheduledTime || '未定時'}</span>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#7e22ce', marginTop: '4px' }}>{c.digitalMirrorBrand} {c.digitalMirror}</div>
              </div>
            )})}

            {upcomingMod.map(c => {
              const isToday = c.electricModDate === todayStr;
              return (
              <div key={`mod-${c.id}`} style={{ background: '#fee2e2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    {isToday ? <span style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>今日</span> : <span style={{ fontSize: '0.75rem', background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>明日</span>}
                    {c.plateNumber} (電動/行車)
                  </span>
                  <span style={{ color: '#dc2626' }}>{c.electricModScheduledTime || '未定時'}</span>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#b91c1c', marginTop: '4px' }}>{c.electricModBrand} {c.electricMod}</div>
              </div>
            )})}
          </div>
        </div>

        {/* 今/明日交車預備 */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #10b981', background: '#fff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e293b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '24px', background: '#10b981', borderRadius: '4px' }}></span>
            今/明日交車預備 ({upcomingDelivery.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
            {upcomingDelivery.length > 0 ? upcomingDelivery.map(c => {
              const isToday = c.expectedEndDate === todayStr;
              // 找出還沒打勾的檢查項目
              const uncompletedChecks = (c.constructionChecklist || []).filter(chk => !chk.checked);
              return (
                <div key={c.id} style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#064e3b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      {isToday ? <span style={{ fontSize: '0.75rem', background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>今日</span> : <span style={{ fontSize: '0.75rem', background: '#059669', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>明日</span>}
                      {c.plateNumber} <span style={{ fontSize: '0.95rem', color: '#166534', fontWeight: '600', marginLeft: '6px' }}>{c.name}</span>
                    </span>
                    <span style={{ color: '#16a34a' }}>{c.expectedDeliveryTime ? `${c.expectedDeliveryTime}交車` : '待確認'}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#047857', marginTop: '4px', fontWeight: 'bold' }}>
                    施工：{c.mainService} {c.mainServiceBrand ? `(${c.mainServiceBrand})` : ''} {c.filmColor}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#166534', marginTop: '8px', fontWeight: 'bold' }}>
                    需確認項目：
                  </div>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.9rem', color: '#065f46' }}>
                    {uncompletedChecks.length > 0 ? (
                      uncompletedChecks.map(chk => <li key={chk.id}>{chk.name}</li>)
                    ) : (
                      <li>✅ 所有檢核項目皆已完成，準備交車！</li>
                    )}
                  </ul>
                </div>
              );
            }) : <div style={{ color: '#94a3b8', padding: '10px 0' }}>明日無預定交車</div>}
          </div>
        </div>

      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', minWidth: '1200px', border: '1px solid var(--border-light)' }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '140px 140px 1.5fr 1.5fr 360px 100px',
          padding: '18px 25px',
          background: 'var(--primary)',
          fontWeight: 'bold',
          color: '#fff',
          fontSize: '0.85rem',
          letterSpacing: '0.5px'
        }}>
          <div>車牌 / 車主</div>
          <div>品牌 / 車型</div>
          <div>膜料施工內容</div>
          <div>加裝配件與贈品</div>
          <div>施工進度時程</div>
          <div style={{ textAlign: 'center' }}>操作</div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {sorted.length > 0 ? sorted.map((customer) => {
            return (
              <div 
                key={customer.id} 
                className="list-row"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '140px 140px 1.5fr 1.5fr 360px 100px',
                  alignItems: 'center',
                  padding: '20px 25px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.9rem',
                  background: '#fff'
                }}
              >
                {/* 1. 車牌 / 車主 */}
                <div>
                  <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '1.1rem' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 'bold' }}>{customer.name}</div>
                </div>

                {/* 2. 品牌 / 車型 */}
                <div>
                  <div style={{ fontWeight: '700', color: '#0369a1' }}>{customer.brand || '—'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{customer.model || '—'}</div>
                </div>

                {/* 3. 施工項目與膜料 */}
                <div style={{ paddingRight: '15px' }}>
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--primary)' }}>
                      {customer.mainServiceBrand} - {customer.filmColor}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{customer.mainService}</div>
                  </div>
                </div>

                {/* 4. 加裝配件 (隔熱紙/電子鏡/加裝/贈品) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '15px' }}>
                  {(customer.windowTint || customer.tintDepthFrontWind || customer.tintDepthFrontSeat || customer.tintDepthRearSeat || customer.tintDepthRearWind || customer.tintDepthSunroof) && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>隔熱紙</span>
                        <span style={{ fontWeight: '600' }}>
                          {customer.windowTintBrand || '未選品牌'} {customer.windowTint || ''}
                          {(!customer.windowTintBrand && !customer.windowTint) && '已加購隔熱紙'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {customer.windowTintDate?.slice(5) || '未定日期'} {customer.windowTintScheduledTime || '未定時間'}
                        {customer.windowTintVendor && <span style={{ marginLeft: '4px', padding: '1px 4px', background: '#e2e8f0', borderRadius: '4px', fontSize: '0.65rem' }}>{customer.windowTintVendor}</span>}
                      </div>
                    </div>
                  )}
                  {customer.digitalMirror && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ padding: '2px 6px', background: '#f3e8ff', color: '#6b21a8', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>電子鏡</span>
                        <span style={{ fontWeight: '600' }}>{customer.digitalMirrorBrand} {customer.digitalMirror}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {customer.digitalMirrorDate?.slice(5) || '未定日期'} {customer.digitalMirrorScheduledTime || '未定時間'}
                      </div>
                    </div>
                  )}
                  {customer.electricMod && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ padding: '2px 6px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>電動件</span>
                        <span style={{ fontWeight: '600' }}>{customer.electricModBrand} {customer.electricMod}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {customer.electricModDate?.slice(5) || '未定日期'} {customer.electricModScheduledTime || '未定時間'}
                      </div>
                    </div>
                  )}
                  {(customer.customAccessories || []).length > 0 && customer.customAccessories?.map(a => (
                    <div key={a.id} style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ padding: '2px 6px', background: '#fef9c3', color: '#854d0e', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>加裝</span>
                        <span style={{ fontWeight: '600' }}>{a.name}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {customer.accessoryScheduling?.[a.id] ? customer.accessoryScheduling[a.id] : '未定時間'}
                      </div>
                    </div>
                  ))}
                  {customer.rearCoating && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ padding: '2px 6px', background: '#f1f5f9', color: '#334155', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>後內裝塗層</span>
                        <span style={{ fontWeight: '600' }}>{customer.rearCoating}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        隨主服務施工
                      </div>
                    </div>
                  )}
                  {customer.hasHoodPpf && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ padding: '2px 6px', background: '#f1f5f9', color: '#334155', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>引擎蓋犀牛皮</span>
                        <span style={{ fontWeight: '600' }}>已加購</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        隨主服務施工
                      </div>
                    </div>
                  )}
                  {(customer.giftItems || []).length > 0 && customer.giftItems?.map((g, idx) => (
                    <div key={idx} style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ padding: '2px 6px', background: '#fce7f3', color: '#be185d', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>贈品</span>
                        <span style={{ fontWeight: '600' }}>{g}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        隨交車附贈
                      </div>
                    </div>
                  ))}
                  {(!(customer.windowTint || customer.tintDepthFrontWind || customer.tintDepthFrontSeat || customer.tintDepthRearSeat || customer.tintDepthRearWind || customer.tintDepthSunroof) && !customer.digitalMirror && !customer.electricMod && !customer.rearCoating && !customer.hasHoodPpf && (customer.customAccessories || []).length === 0 && (customer.giftItems || []).length === 0) && (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>無額外加裝項目</div>
                  )}
                </div>

                {/* 5. 施工時程狀態 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <div style={{ background: '#f0f9ff', padding: '6px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '0.65rem', color: '#0369a1', fontWeight: 'bold' }}>1.留車進場</div>
                    <div style={{ fontSize: '0.8rem', color: '#0c4a6e', fontWeight: '800' }}>{customer.expectedStartDate?.slice(5)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#0369a1' }}>{customer.constructionTime}</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '6px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 'bold' }}>2.施工期間</div>
                    <div style={{ fontSize: '0.8rem', color: '#064e3b', fontWeight: '800' }}>
                      {customer.constructionStartDate?.slice(5) || '—'}
                      {customer.constructionEndDate ? ` ~ ${customer.constructionEndDate.slice(5)}` : ''}
                    </div>
                  </div>
                  <div style={{ background: '#fdf2f8', padding: '6px', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                    <div style={{ fontSize: '0.65rem', color: '#be185d', fontWeight: 'bold' }}>3.預計交車</div>
                    <div style={{ fontSize: '0.8rem', color: '#831843', fontWeight: '800' }}>
                      {customer.expectedEndDate?.slice(5) || '—'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#be185d' }}>{customer.expectedDeliveryTime}</div>
                  </div>
                </div>

                {/* 6. 操作 */}
                <div style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteCustomer(customer.id); }}
                    style={{ background: '#fef2f2', border: '1px solid #fee2e2', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="刪除"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => onEditCustomer(customer)}
                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="設定"
                  >
                    <Settings size={18} />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
              目前現場沒有正在施工中的車輛。
            </div>
          )}
        </div>
      </div>

      <style>{`
        .list-row:hover {
          background: #f8fafc !important;
        }
        .edit-hover-red:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
};
