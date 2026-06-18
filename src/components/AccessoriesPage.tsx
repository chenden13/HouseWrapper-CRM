import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Calendar, Settings, Check, Trash2, Edit2
} from 'lucide-react';
import type { Customer, Accessory } from '../types';

interface AccessoriesPageProps {
  customers: Customer[];
  onUpdateCustomer: (customer: Customer) => Promise<void>;
}

// 隔熱紙選單常數 (與 PendingEditForm 保持一致)
const TINT_GROUPS: Record<string, string[]> = {
  "3M": ["極黑", "極透", "方案1: 前(透)後(黑)", "方案2: 前、天(透) 身(黑)"],
  "桑馬克": ["XC MAX", "Smart", "方案3: 前(Smart)身、天(XC)"],
  "T4 / Vega": ["Vega", "T4", "方案4: 前(T4)身、天(Vega)", "方案5: 前、天(T4) 身(Vega)"],
  "FSK": ["FSK 冰鑽 KT"],
  "舒熱佳": ["舒熱佳 XE"],
  "量子膜": ["量子膜 ZX"],
  "皇家": ["皇家 Supreme"],
  "Xpel": ["Xpel-X2 Plus"]
};

const MIRROR_REC_LIST: Record<string, number> = {
  '大邁 M996': 12800,
  '快譯通 S95B': 14000,
  '快譯通 S95A': 14000,
  '快譯通 S86': 12000,
  'DOD T-one plus': 20000
};

export const AccessoriesPage: React.FC<AccessoriesPageProps> = ({ 
  customers, onUpdateCustomer 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  
  // 快速編輯模態框狀態
  const [selectedCustForEdit, setSelectedCustForEdit] = useState<Customer | null>(null);
  const [editTintCategory, setEditTintCategory] = useState('');
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});

  // 1. 過濾出有配件、隔熱紙、鍍膜、PPF、或贈品需求且未完工的客戶
  const accessoriesData = useMemo(() => {
    return customers
      .filter(c => c.status !== 'completed')
      .filter(c => {
        const hasTint = !!(c.windowTint || c.windowTintBrand || c.windowTintPrice);
        const hasMirror = !!(c.digitalMirror || c.digitalMirrorBrand || c.digitalMirrorPrice);
        const hasMod = !!(c.electricMod || c.electricModBrand || c.electricModPrice);
        const hasAcc = !!(c.customAccessories && c.customAccessories.length > 0);
        const hasRearCoating = !!(c.rearCoating || c.rearCoatingPrice);
        const hasHoodPpf = !!(c.hasHoodPpf || c.hoodPpfPrice);
        const hasGift = !!(c.giftItems && c.giftItems.length > 0);
        return hasTint || hasMirror || hasMod || hasAcc || hasRearCoating || hasHoodPpf || hasGift;
      })
      .sort((a, b) => {
        const dateA = a.expectedStartDate || '';
        const dateB = b.expectedStartDate || '';
        if (!dateA && dateB) return 1;
        if (dateA && !dateB) return -1;
        if (!dateA && !dateB) return 0;
        return dateA.localeCompare(dateB);
      })
      .filter(c => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          String(c.name || '').toLowerCase().includes(lowerSearch) || 
          String(c.phone || '').toLowerCase().includes(lowerSearch) || 
          String(c.plateNumber || '').toLowerCase().includes(lowerSearch) ||
          String(c.model || '').toLowerCase().includes(lowerSearch) ||
          String(c.id || '').toLowerCase().includes(lowerSearch)
        );
      });
  }, [customers, searchTerm]);

  // 2. 搜尋待施工的車主（可用於新增/更新需求）
  const pendingCustomers = useMemo(() => {
    if (!customerSearchTerm) return [];
    return customers
      .filter(c => ['new', 'deposit', 'scheduled', 'construction'].includes(c.status))
      .filter(c => {
        const lowerSearch = customerSearchTerm.toLowerCase();
        return (
          String(c.name || '').toLowerCase().includes(lowerSearch) || 
          String(c.phone || '').toLowerCase().includes(lowerSearch) || 
          String(c.plateNumber || '').toLowerCase().includes(lowerSearch) ||
          String(c.model || '').toLowerCase().includes(lowerSearch) ||
          String(c.id || '').toLowerCase().includes(lowerSearch)
        );
      });
  }, [customers, customerSearchTerm]);

  // 3. 處理點擊搜尋到的客戶
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustForEdit(customer);
    setEditFormData({ ...customer });
    
    // 初始化隔熱紙類別
    const currentSpec = customer.windowTintBrand || '';
    const found = Object.entries(TINT_GROUPS).find(([, specs]) => specs.includes(currentSpec));
    if (found) {
      setEditTintCategory(found[0]);
    } else if (currentSpec || customer.windowTint) {
      setEditTintCategory('其他 (手動自訂)');
    } else {
      setEditTintCategory('');
    }
    
    setIsAddModalOpen(false); // 關閉搜尋模態框
  };

  // 4. 處理快速編輯表單輸入變更
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      const val = type === 'number' ? Number(value) : value;
      setEditFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  // 5. 處理客製配件新增與刪除
  const addAccessory = () => {
    const newAcc: Accessory = { id: `acc_${Date.now()}`, name: '', price: 0 };
    setEditFormData(prev => ({ 
      ...prev, 
      customAccessories: [...(prev.customAccessories || []), newAcc] 
    }));
  };

  const removeAccessory = (id: string) => {
    setEditFormData(prev => ({ 
      ...prev, 
      customAccessories: prev.customAccessories?.filter(a => a.id !== id) 
    }));
  };

  const updateAccessory = (id: string, field: 'name' | 'price', value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      customAccessories: prev.customAccessories?.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  // 6. 提交編輯表單
  const handleSaveEdit = async () => {
    if (!selectedCustForEdit) return;
    
    const finalWindowTint = editTintCategory === '其他 (手動自訂)'
      ? editFormData.windowTint
      : editTintCategory;

    const updated = {
      ...selectedCustForEdit,
      ...editFormData,
      windowTint: finalWindowTint
    } as Customer;

    await onUpdateCustomer(updated);
    setSelectedCustForEdit(null);
  };

  // 7. 直接在列表快速切換狀態
  const handleTogglePrep = async (customer: Customer, field: 'tintPrepDone' | 'mirrorPrepDone' | 'partsPrepDone') => {
    const updated = { ...customer, [field]: !customer[field] };
    await onUpdateCustomer(updated);
  };

  return (
    <div style={{ padding: '20px 20px 40px 20px', maxWidth: '2000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings color="var(--primary)" size={24} /> 配件與隔熱紙安排區
            <span style={{ fontSize: '0.85rem', background: '#ffe4e6', padding: '4px 12px', borderRadius: '20px', color: '#be123c', fontWeight: 'bold', marginLeft: '10px' }}>
              共 {accessoriesData.length} 筆安排需求
            </span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>集中管理待施工客戶的隔熱紙預約、電子後視鏡與加購配件進度</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '10px 24px', borderRadius: '12px', background: 'var(--primary)' }} 
            onClick={() => {
              setCustomerSearchTerm('');
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={18} /> 新增/更新配件安排
          </button>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
            <input
              type="text"
              placeholder="搜尋車主、車牌、編號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 15px 10px 40px', borderRadius: '12px', width: '250px', fontSize: '0.9rem', border: '1px solid #e2e8f0' }}
            />
          </div>
        </div>
      </header>

      {/* ── 列表表格 ── */}
      <div className="glass-panel" style={{ borderRadius: '20px', overflowX: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ minWidth: '1450px' }}>
          {/* 表頭 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 130px 2.2fr 1.8fr 2fr 100px',
            padding: '20px 25px',
            background: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
            fontWeight: '900',
            color: '#475569',
            fontSize: '0.88rem',
            textAlign: 'center'
          }}>
            <div style={{ textAlign: 'left' }}>車主與車輛</div>
            <div>預計留車日期</div>
            <div style={{ textAlign: 'left' }}>隔熱紙安排 (☀️)</div>
            <div style={{ textAlign: 'left' }}>電子後視鏡 (📹)</div>
            <div style={{ textAlign: 'left' }}>加購/客製配件 (⚙️)</div>
            <div>操作</div>
          </div>

          {/* 表身 */}
          <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {accessoriesData.length > 0 ? accessoriesData.map((customer, idx) => {
              const hasTint = !!(customer.windowTint || customer.windowTintBrand || customer.windowTintPrice);
              const hasMirror = !!(customer.digitalMirror || customer.digitalMirrorBrand || customer.digitalMirrorPrice);
              const hasMod = !!(customer.electricMod || customer.electricModBrand || customer.electricModPrice);
              const hasAcc = !!(customer.customAccessories && customer.customAccessories.length > 0);

              return (
                <div 
                  key={customer.id} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1.2fr 130px 2.2fr 1.8fr 2fr 100px',
                    alignItems: 'center',
                    padding: '20px 25px',
                    borderBottom: '1px solid #f1f5f9',
                    background: idx % 2 === 0 ? '#fff' : '#fcfcfc',
                    fontSize: '0.92rem'
                  }}
                >
                  {/* 1. 車主車輛 */}
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <div style={{ fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{customer.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>#{customer.id?.slice(-4)}</span>
                      {customer.status === 'construction' && (
                        <span style={{ fontSize: '0.65rem', background: '#3b82f6', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>施工中</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {customer.plateNumber || '未掛牌'} | {customer.brand || ''} {customer.model || ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{customer.phone}</div>
                  </div>

                  {/* 2. 留車日期 */}
                  <div style={{ textAlign: 'center', fontWeight: '700', color: '#0369a1' }}>
                    {customer.expectedStartDate || '未設定'}
                  </div>

                  {/* 3. 隔熱紙 */}
                  <div style={{ textAlign: 'left', paddingRight: '15px' }}>
                    {hasTint ? (
                      <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '8px', padding: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: '#0369a1' }}>
                            {customer.windowTintBrand || '自訂型號'} ({customer.windowTint || '自訂品牌'})
                          </div>
                          {customer.windowTintPrice !== undefined && (
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                              報價: <span style={{ color: '#0369a1' }}>${customer.windowTintPrice.toLocaleString()}</span>
                            </div>
                          )}
                          {(customer.windowTintDate || customer.windowTintScheduledTime) && (
                            <div style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px', width: 'fit-content' }}>
                              <Calendar size={13} />
                              <span>時間: {customer.windowTintDate || '未定日期'} {customer.windowTintScheduledTime || '未定時段'}</span>
                              {customer.windowTintVendor && <span style={{ marginLeft: '4px', background: '#0284c7', color: '#fff', padding: '1px 4px', borderRadius: '4px', fontSize: '0.65rem' }}>{customer.windowTintVendor}</span>}
                            </div>
                          )}
                          {(customer.tintDepthFrontWind || customer.tintDepthFrontSeat || customer.tintDepthRearSeat || customer.tintDepthRearWind || customer.tintDepthSunroof) && (
                            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px', background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px' }}>
                              <span style={{ fontWeight: 'bold', color: '#64748b' }}>深度:</span>
                              {customer.tintDepthFrontWind && <span style={{ background: '#fff', padding: '1px 4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>前擋 {customer.tintDepthFrontWind}%</span>}
                              {customer.tintDepthFrontSeat && <span style={{ background: '#fff', padding: '1px 4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>前座 {customer.tintDepthFrontSeat}%</span>}
                              {customer.tintDepthRearSeat && <span style={{ background: '#fff', padding: '1px 4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>後座 {customer.tintDepthRearSeat}%</span>}
                              {customer.tintDepthRearWind && <span style={{ background: '#fff', padding: '1px 4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>後擋 {customer.tintDepthRearWind}%</span>}
                              {customer.tintDepthSunroof && <span style={{ background: '#fff', padding: '1px 4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>天窗 {customer.tintDepthSunroof}%</span>}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleTogglePrep(customer, 'tintPrepDone')}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid', fontWeight: 'bold', cursor: 'pointer',
                            background: customer.tintPrepDone ? '#ecfdf5' : '#fff',
                            borderColor: customer.tintPrepDone ? '#10b981' : '#cbd5e1',
                            color: customer.tintPrepDone ? '#15803d' : '#64748b',
                            display: 'flex', alignItems: 'center', gap: '2px'
                          }}
                        >
                          {customer.tintPrepDone ? <Check size={12} /> : null}
                          {customer.tintPrepDone ? '已約好' : '約隔熱紙'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                    )}
                  </div>

                  {/* 4. 電子鏡 */}
                  <div style={{ textAlign: 'left', paddingRight: '15px' }}>
                    {hasMirror ? (
                      <div style={{ background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '8px', padding: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: '#5b21b6' }}>
                            {customer.digitalMirror} 
                          </div>
                          {customer.digitalMirrorBrand && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>規格: {customer.digitalMirrorBrand}</div>
                          )}
                          {customer.digitalMirrorPrice !== undefined && (
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                              報價: <span style={{ color: '#5b21b6' }}>${customer.digitalMirrorPrice.toLocaleString()}</span>
                            </div>
                          )}
                          {(customer.digitalMirrorDate || customer.digitalMirrorScheduledTime) && (
                            <div style={{ fontSize: '0.78rem', color: '#5b21b6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', background: '#f3e8ff', padding: '3px 8px', borderRadius: '6px', width: 'fit-content' }}>
                              <Calendar size={13} />
                              <span>時間: {customer.digitalMirrorDate || '未定日期'} {customer.digitalMirrorScheduledTime || '未定時段'}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleTogglePrep(customer, 'mirrorPrepDone')}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid', fontWeight: 'bold', cursor: 'pointer',
                            background: customer.mirrorPrepDone ? '#ecfdf5' : '#fff',
                            borderColor: customer.mirrorPrepDone ? '#10b981' : '#cbd5e1',
                            color: customer.mirrorPrepDone ? '#15803d' : '#64748b',
                            display: 'flex', alignItems: 'center', gap: '2px'
                          }}
                        >
                          {customer.mirrorPrepDone ? <Check size={12} /> : null}
                          {customer.mirrorPrepDone ? '已約好' : '約電子鏡'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                    )}
                  </div>

                  {/* 5. 客製配件 & 電改 & 鍍膜/PPF/贈品 */}
                  <div style={{ textAlign: 'left', paddingRight: '15px' }}>
                    {(hasAcc || hasMod || customer.rearCoating || customer.hasHoodPpf || (customer.giftItems && customer.giftItems.length > 0)) ? (
                      <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {hasMod && (
                            <div style={{ paddingBottom: '4px', borderBottom: (hasAcc || customer.rearCoating || customer.hasHoodPpf || (customer.giftItems && customer.giftItems.length > 0)) ? '1px dashed #fca5a5' : 'none' }}>
                              <span style={{ fontSize: '0.72rem', background: '#ec4899', color: '#fff', padding: '1px 4px', borderRadius: '4px', marginRight: '4px', fontWeight: 'bold' }}>電改</span>
                              <strong style={{ color: '#9f1239' }}>{customer.electricMod}</strong> 
                              {customer.electricModPrice !== undefined && ` ($${customer.electricModPrice.toLocaleString()})`}
                              {(customer.electricModDate || customer.electricModScheduledTime) && (
                                <div style={{ fontSize: '0.72rem', color: '#be123c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', background: '#ffe4e6', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                                  <Calendar size={12} />
                                  <span>時間: {customer.electricModDate || '未定'} {customer.electricModScheduledTime || ''}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {customer.rearCoating && (
                            <div style={{ paddingBottom: '4px', borderBottom: (hasAcc || customer.hasHoodPpf || (customer.giftItems && customer.giftItems.length > 0)) ? '1px dashed #fca5a5' : 'none' }}>
                              <span style={{ fontSize: '0.72rem', background: '#059669', color: '#fff', padding: '1px 4px', borderRadius: '4px', marginRight: '4px', fontWeight: 'bold' }}>鍍膜</span>
                              <strong style={{ color: '#065f46' }}>{customer.rearCoating}</strong>
                              {customer.rearCoatingPrice !== undefined && ` ($${customer.rearCoatingPrice.toLocaleString()})`}
                            </div>
                          )}

                          {customer.hasHoodPpf && (
                            <div style={{ paddingBottom: '4px', borderBottom: (hasAcc || (customer.giftItems && customer.giftItems.length > 0)) ? '1px dashed #fca5a5' : 'none' }}>
                              <span style={{ fontSize: '0.72rem', background: '#d97706', color: '#fff', padding: '1px 4px', borderRadius: '4px', marginRight: '4px', fontWeight: 'bold' }}>PPF</span>
                              <strong style={{ color: '#92400e' }}>引擎蓋 PPF</strong>
                              {customer.hoodPpfPrice !== undefined && ` ($${customer.hoodPpfPrice.toLocaleString()})`}
                            </div>
                          )}

                          {customer.giftItems && customer.giftItems.length > 0 && (
                            <div style={{ paddingBottom: '4px', borderBottom: hasAcc ? '1px dashed #fca5a5' : 'none' }}>
                              <span style={{ fontSize: '0.72rem', background: '#4f46e5', color: '#fff', padding: '1px 4px', borderRadius: '4px', marginRight: '4px', fontWeight: 'bold' }}>贈品</span>
                              <span style={{ color: '#3730a3', fontSize: '0.82rem', fontWeight: '600' }}>
                                {customer.giftItems.join('、')}
                              </span>
                            </div>
                          )}

                          {hasAcc && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {customer.customAccessories?.map((acc) => (
                                <div key={acc.id} style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>• {acc.name || '未命名配件'}</span>
                                  <span style={{ fontWeight: '600' }}>${acc.price || 0}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleTogglePrep(customer, 'partsPrepDone')}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid', fontWeight: 'bold', cursor: 'pointer',
                            background: customer.partsPrepDone ? '#ecfdf5' : '#fff',
                            borderColor: customer.partsPrepDone ? '#10b981' : '#cbd5e1',
                            color: customer.partsPrepDone ? '#15803d' : '#64748b',
                            display: 'flex', alignItems: 'center', gap: '2px'
                          }}
                        >
                          {customer.partsPrepDone ? <Check size={12} /> : null}
                          {customer.partsPrepDone ? '已備齊' : '備料'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                    )}
                  </div>

                  {/* 6. 操作 */}
                  <div style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => handleSelectCustomer(customer)} 
                      style={{ 
                        background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', 
                        padding: '8px 12px', cursor: 'pointer', color: '#475569', 
                        display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 'bold'
                      }}
                    >
                      <Edit2 size={14} /> 編輯
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                目前無相應配件或隔熱紙排程需求。
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 搜尋選擇客戶 Modal ── */}
      {isAddModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', 
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '900', color: '#1f2937' }}>搜尋待施工車主</h3>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
              <input 
                type="text" 
                placeholder="輸入姓名、車牌、電話以搜尋..." 
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                autoFocus
              />
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingCustomers.length > 0 ? pendingCustomers.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => handleSelectCustomer(c)}
                  style={{ 
                    padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer',
                    background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.15s'
                  }}
                  className="hover-bg-rose"
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{c.name} ({c.plateNumber || '無車牌'})</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>型號: {c.model || '未設定'} | 電話: {c.phone}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#ffe4e6', color: '#be123c', fontWeight: 'bold' }}>
                    {c.status === 'new' ? '諮詢' : c.status === 'deposit' ? '收訂' : c.status === 'scheduled' ? '排程' : '施工中'}
                  </span>
                </div>
              )) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '0.85rem' }}>
                  {customerSearchTerm ? '查無符合條件的待施工車主' : '請輸入關鍵字搜尋...'}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setIsAddModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '10px' }}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 隔熱紙與配件快速更新 Form Modal ── */}
      {selectedCustForEdit && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', 
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <div style={{ 
            background: '#fff', padding: '24px', borderRadius: '20px', 
            width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' 
          }}>
            <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#1e293b' }}>
                  編輯隔熱紙與配件需求
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  車主: <strong>{selectedCustForEdit.name}</strong> | 車牌: <strong>{selectedCustForEdit.plateNumber || '未掛牌'}</strong> | 車型: <strong>{selectedCustForEdit.model}</strong>
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>編號: #{selectedCustForEdit.id}</span>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. 隔熱紙需求區區 */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ☀️ 隔熱紙需求
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px', alignItems: 'end', marginBottom: '12px' }}>
                  <div className="col-span-4">
                    <label className="form-label">品牌類別</label>
                    <select 
                      className="form-control" 
                      value={editTintCategory} 
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setEditTintCategory(newCategory);
                        if (newCategory === '其他 (手動自訂)') {
                          setEditFormData(prev => ({ 
                            ...prev, 
                            windowTint: prev.windowTint || '', 
                            windowTintBrand: prev.windowTintBrand || '' 
                          }));
                        } else {
                          setEditFormData(prev => ({ ...prev, windowTintBrand: '' }));
                        }
                      }}
                    >
                      <option value="">請選擇品牌</option>
                      {Object.keys(TINT_GROUPS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="其他 (手動自訂)">其他 (手動自訂)</option>
                    </select>
                  </div>

                  {editTintCategory === '其他 (手動自訂)' ? (
                    <>
                      <div className="col-span-4">
                        <label className="form-label">自訂品牌名稱</label>
                        <input 
                          type="text" 
                          name="windowTint" 
                          className="form-control" 
                          placeholder="例如: V-Kool" 
                          value={editFormData.windowTint || ''} 
                          onChange={handleFormChange} 
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="form-label">自訂規格/型號</label>
                        <input 
                          type="text" 
                          name="windowTintBrand" 
                          className="form-control" 
                          placeholder="例如: V55" 
                          value={editFormData.windowTintBrand || ''} 
                          onChange={handleFormChange} 
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-5">
                      <label className="form-label">具體規格/型號</label>
                      <select name="windowTintBrand" className="form-control" value={editFormData.windowTintBrand || ''} onChange={handleFormChange}>
                        <option value="">選擇規格</option>
                        {(TINT_GROUPS[editTintCategory] || []).map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  )}

                  {editTintCategory !== '其他 (手動自訂)' && (
                    <div className="col-span-3" style={{ paddingBottom: '10px' }}>
                      <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', cursor: 'pointer', fontWeight: '600' }}>
                        <input type="checkbox" name="hasSunroof" checked={editFormData.hasSunroof || false} onChange={handleFormChange} /> 
                        包含天窗
                      </label>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px', marginBottom: '12px' }}>
                  <div className="col-span-3">
                    <label className="form-label">施工報價 ($)</label>
                    <input type="number" name="windowTintPrice" className="form-control" placeholder="金額" value={editFormData.windowTintPrice || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-span-3">
                    <label className="form-label">預約日期</label>
                    <input type="date" name="windowTintDate" className="form-control" value={editFormData.windowTintDate || ''} onChange={handleFormChange} />
                  </div>
                  <div className="col-span-3">
                    <label className="form-label">預約時段</label>
                    <select name="windowTintScheduledTime" className="form-control" value={editFormData.windowTintScheduledTime || ''} onChange={handleFormChange}>
                      <option value="">選擇時段</option>
                      {["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="form-label">施工廠商</label>
                    <select name="windowTintVendor" className="form-control" value={editFormData.windowTintVendor || ''} onChange={handleFormChange}>
                      <option value="">選擇廠商</option>
                      <option value="麟光">麟光</option>
                      <option value="昆哥">昆哥</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  {[['前擋', 'tintDepthFrontWind'], ['前座', 'tintDepthFrontSeat'], ['後座', 'tintDepthRearSeat'], ['後擋', 'tintDepthRearWind'], ['天窗', 'tintDepthSunroof']].map(([label, f]) => (
                    <div key={f} style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '2px' }}>{label}</label>
                      <input type="number" name={f} className="form-control" placeholder="深度" value={(editFormData[f as keyof Customer] as string | number | undefined) || ''} onChange={handleFormChange} />
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. 電子鏡 / 行車記錄器 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#5b21b6', fontSize: '0.95rem' }}>
                    📹 電子後視鏡
                  </h4>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label">機型名稱</label>
                    <select name="digitalMirror" className="form-control" value={editFormData.digitalMirror || ''} onChange={handleFormChange}>
                      <option value="">不安排/請選擇</option>
                      {Object.keys(MIRROR_REC_LIST).map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="其他">其他 (自訂輸入)</option>
                    </select>
                  </div>
                  {editFormData.digitalMirror === '其他' && (
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <input type="text" name="digitalMirrorBrand" className="form-control" placeholder="請輸入品牌規格" value={editFormData.digitalMirrorBrand || ''} onChange={handleFormChange} />
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group">
                      <label className="form-label">報價 ($)</label>
                      <input type="number" name="digitalMirrorPrice" className="form-control" value={editFormData.digitalMirrorPrice || ''} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">日期</label>
                      <input type="date" name="digitalMirrorDate" className="form-control" value={editFormData.digitalMirrorDate || ''} onChange={handleFormChange} />
                    </div>
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#be123c', fontSize: '0.95rem' }}>
                    ⚙️ 行車記錄器/電動改裝
                  </h4>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label">電改項目</label>
                    <input type="text" name="electricMod" className="form-control" placeholder="如: 電動前車箱、吸門..." value={editFormData.electricMod || ''} onChange={handleFormChange} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group">
                      <label className="form-label">報價 ($)</label>
                      <input type="number" name="electricModPrice" className="form-control" value={editFormData.electricModPrice || ''} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">日期</label>
                      <input type="date" name="electricModDate" className="form-control" value={editFormData.electricModDate || ''} onChange={handleFormChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 客製化加購配件 (特別是墊子、後視鏡等) */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                    📦 客製化加購配件明細 (如墊子、面鏡等)
                  </h4>
                  <button type="button" className="btn btn-outline" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={addAccessory}>
                    + 新增配件
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editFormData.customAccessories && editFormData.customAccessories.length > 0 ? (
                    editFormData.customAccessories.map((acc) => (
                      <div key={acc.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          placeholder="配件名稱 (例如: 腳踏墊, 避光墊, 後視鏡防雨貼)" 
                          className="form-control" 
                          style={{ flex: 3 }} 
                          value={acc.name} 
                          onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} 
                        />
                        <input 
                          type="number" 
                          placeholder="金額" 
                          className="form-control" 
                          style={{ flex: 1 }} 
                          value={acc.price || ''} 
                          onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} 
                        />
                        <button 
                          type="button" 
                          onClick={() => removeAccessory(acc.id)} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '10px 0' }}>
                      目前尚無其他加購配件，點選右上角按鈕以新增。
                    </div>
                  )}
                </div>
              </div>

            </div>

            <footer style={{ borderTop: '1px solid #e2e8f0', marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedCustForEdit(null)}>取消</button>
              <button className="btn btn-primary" style={{ background: 'var(--primary)' }} onClick={handleSaveEdit}>確認儲存</button>
            </footer>

          </div>
        </div>
      )}

    </div>
  );
};
