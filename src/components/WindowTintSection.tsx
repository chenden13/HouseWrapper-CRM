import React, { useState, useEffect } from 'react';
import type { Customer } from '../types';
import { 
  TINT_BRANDS, 
  TINT_MODELS_BY_BRAND, 
  TINT_PRESETS, 
  getPresetsForModel, 
  type TintPreset 
} from '../data/tintConfig';
import { Sun, CheckCircle2, Sparkles } from 'lucide-react';

interface WindowTintSectionProps {
  formData: Partial<Customer>;
  onChange: (updates: Partial<Customer>) => void;
  carModel?: string;
}

export const WindowTintSection: React.FC<WindowTintSectionProps> = ({
  formData,
  onChange,
  carModel
}) => {
  const currentModelStr = carModel || formData.model || '';
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  
  // 自動偵測車款類別
  const isM3 = currentModelStr.toLowerCase().includes('model 3') || currentModelStr.toLowerCase().includes('m3');
  const isMY = currentModelStr.toLowerCase().includes('model y') || currentModelStr.toLowerCase().includes('my');
  const availablePresets = getPresetsForModel(currentModelStr);

  // 初始化反推快速選項
  useEffect(() => {
    if (formData.windowTintBrand) {
      const matched = TINT_PRESETS.find(p => p.name === formData.windowTintBrand);
      if (matched) {
        setSelectedPresetId(matched.id);
      }
    }
  }, [formData.windowTintBrand]);

  // 當選擇快速選項套裝時
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!presetId) return;

    const preset = TINT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const hasSunroof = !!formData.hasSunroof;
    const price = hasSunroof ? preset.priceWithSunroof : preset.priceNoSunroof;

    onChange({
      windowTint: preset.brand,
      windowTintBrand: preset.name,
      windowTintPrice: price,
      // 套用5部位預設品牌與型號
      tintBrandFrontWind: preset.parts.frontWind.brand,
      tintModelFrontWind: preset.parts.frontWind.model,

      tintBrandFrontSeat: preset.parts.frontSeat.brand,
      tintModelFrontSeat: preset.parts.frontSeat.model,

      tintBrandRearSeat: preset.parts.rearSeat.brand,
      tintModelRearSeat: preset.parts.rearSeat.model,

      tintBrandRearWind: preset.parts.rearWind.brand,
      tintModelRearWind: preset.parts.rearWind.model,

      tintBrandSunroof: preset.parts.sunroof.brand,
      tintModelSunroof: preset.parts.sunroof.model,
    });
  };

  // 當勾選/取消天窗時，更新金額
  const handleSunroofToggle = (checked: boolean) => {
    const updates: Partial<Customer> = { hasSunroof: checked };

    if (selectedPresetId) {
      const preset = TINT_PRESETS.find(p => p.id === selectedPresetId);
      if (preset) {
        updates.windowTintPrice = checked ? preset.priceWithSunroof : preset.priceNoSunroof;
      }
    }
    onChange(updates);
  };

  // 部位更改
  const handlePartChange = (
    part: 'FrontWind' | 'FrontSeat' | 'RearSeat' | 'RearWind' | 'Sunroof',
    field: 'Brand' | 'Model' | 'Depth',
    value: string
  ) => {
    const fieldKey = `tint${field}${part}` as keyof Customer;
    const updates: Partial<Customer> = { [fieldKey]: value };

    // 如果改了品牌，且原本型號不在新品牌的列表中，可引導歸空或切換
    if (field === 'Brand') {
      const modelKey = `tintModel${part}` as keyof Customer;
      const validModels = TINT_MODELS_BY_BRAND[value] || [];
      const currentModel = (formData[modelKey] as string) || '';
      if (!validModels.includes(currentModel) && validModels.length > 0) {
        updates[modelKey] = validModels[0];
      }
    }

    onChange(updates);
  };

  const partsList: { id: 'FrontWind' | 'FrontSeat' | 'RearSeat' | 'RearWind' | 'Sunroof'; label: string; icon: string }[] = [
    { id: 'FrontWind', label: '前擋', icon: '🚗' },
    { id: 'FrontSeat', label: '前座', icon: '🪟' },
    { id: 'RearSeat', label: '後座', icon: '🪟' },
    { id: 'RearWind', label: '後擋', icon: '🛡️' },
    { id: 'Sunroof', label: '天窗', icon: '☀️' },
  ];

  return (
    <div style={{
      borderLeft: '4px solid #3b82f6',
      background: '#f8fafc',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '16px',
      marginTop: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* 標題與快速選項按鈕群 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={18} color="#2563eb" />
          <span style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '0.95rem' }}>隔熱紙 - 施工與選用設定</span>
          {(isM3 || isMY) && (
            <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
              專屬 {isM3 ? 'Model 3' : 'Model Y'} 快速報價矩陣
            </span>
          )}
        </div>

        <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', cursor: 'pointer', fontWeight: '700' }}>
          <input 
            type="checkbox" 
            name="hasSunroof" 
            checked={formData.hasSunroof || false} 
            onChange={(e) => handleSunroofToggle(e.target.checked)} 
          /> 
          包含天窗施工
        </label>
      </div>

      {/* 快速選項下拉選單 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px', alignItems: 'end', marginBottom: '14px' }}>
        <div className="col-span-6">
          <label className="form-label" style={{ fontWeight: '700', fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} color="#f59e0b" />
            快速配法套裝 (Model 3 / Model Y)
          </label>
          <select
            className="form-control"
            value={selectedPresetId}
            onChange={(e) => handlePresetSelect(e.target.value)}
            style={{ fontWeight: selectedPresetId ? '600' : 'normal', color: selectedPresetId ? '#1d4ed8' : '#334155' }}
          >
            <option value="">選擇官方經典套裝 (自動計算金額與規格)</option>
            <optgroup label="Model 3 隔熱紙快速套裝">
              {TINT_PRESETS.filter(p => p.carModel === 'Model 3').map(p => (
                <option key={p.id} value={p.id}>
                  [Model 3] {p.name} ({formData.hasSunroof ? `$${p.priceWithSunroof.toLocaleString()} 含天窗` : `$${p.priceNoSunroof.toLocaleString()} 不含天窗`})
                </option>
              ))}
            </optgroup>
            <optgroup label="Model Y 隔熱紙快速套裝">
              {TINT_PRESETS.filter(p => p.carModel === 'Model Y').map(p => (
                <option key={p.id} value={p.id}>
                  [Model Y] {p.name} ({formData.hasSunroof ? `$${p.priceWithSunroof.toLocaleString()} 含天窗` : `$${p.priceNoSunroof.toLocaleString()} 不含天窗`})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="col-span-6">
          <label className="form-label" style={{ fontWeight: '700', fontSize: '0.8rem', color: '#334155' }}>
            自訂名稱 / 舊紀錄備註 (完整保留舊資料)
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="例如: RR+XC 或 自訂組合說明"
            value={formData.windowTintCustomName || ''}
            onChange={(e) => onChange({ windowTintCustomName: e.target.value })}
          />
        </div>
      </div>

      {/* 施工價格與進場時段 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px', marginBottom: '16px', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div className="col-span-3">
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px', color: '#475569', fontWeight: 'bold' }}>施工金額 ($)</label>
          <input 
            type="number" 
            name="windowTintPrice" 
            className="form-control" 
            value={formData.windowTintPrice ?? ''} 
            onChange={(e) => onChange({ windowTintPrice: Number(e.target.value) || 0 })} 
            placeholder="$ 施工價格" 
            style={{ fontWeight: 'bold', color: '#166534' }}
          />
        </div>

        <div className="col-span-3">
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px', color: '#475569' }}>預計進場日期</label>
          <input 
            type="date" 
            name="windowTintDate" 
            className="form-control" 
            value={formData.windowTintDate || ''} 
            onChange={(e) => onChange({ windowTintDate: e.target.value })} 
          />
        </div>

        <div className="col-span-3">
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px', color: '#475569' }}>預計時段</label>
          <select 
            name="windowTintScheduledTime" 
            className="form-control" 
            value={formData.windowTintScheduledTime || ''} 
            onChange={(e) => onChange({ windowTintScheduledTime: e.target.value })}
          >
            <option value="">選擇時段</option>
            {["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="col-span-3">
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px', color: '#475569' }}>施工廠商</label>
          <select 
            name="windowTintVendor" 
            className="form-control" 
            value={formData.windowTintVendor || ''} 
            onChange={(e) => onChange({ windowTintVendor: e.target.value })}
          >
            <option value="">選擇廠商</option>
            <option value="麟光">麟光</option>
            <option value="昆哥">昆哥</option>
            <option value="自施工">自施工</option>
          </select>
        </div>
      </div>

      {/* 5部位獨立配置卡片 */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e40af', marginBottom: '8px' }}>
          各部位獨立品牌、型號與深度 (VLT%) 配置
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {partsList.map((p) => {
            const brandKey = `tintBrand${p.id}` as keyof Customer;
            const modelKey = `tintModel${p.id}` as keyof Customer;
            const depthKey = `tintDepth${p.id}` as keyof Customer;

            const currentBrand = (formData[brandKey] as string) || '';
            const currentModel = (formData[modelKey] as string) || '';
            const currentDepth = (formData[depthKey] as string) || '';

            const availableModels = TINT_MODELS_BY_BRAND[currentBrand] || [];

            return (
              <div 
                key={p.id} 
                style={{ 
                  background: '#ffffff', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '10px', 
                  padding: '10px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800', fontSize: '0.82rem', color: '#0f172a' }}>
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </div>

                {/* 品牌選擇 */}
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '2px', display: 'block' }}>品牌</label>
                  <select
                    className="form-control"
                    style={{ fontSize: '0.75rem', padding: '4px 6px', height: '30px' }}
                    value={currentBrand}
                    onChange={(e) => handlePartChange(p.id, 'Brand', e.target.value)}
                  >
                    <option value="">選擇品牌</option>
                    {TINT_BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* 型號選擇/自訂 */}
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '2px', display: 'block' }}>型號</label>
                  {currentBrand === '其他' || availableModels.length === 0 ? (
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.75rem', padding: '4px 6px', height: '30px' }}
                      placeholder="型號"
                      value={currentModel}
                      onChange={(e) => handlePartChange(p.id, 'Model', e.target.value)}
                    />
                  ) : (
                    <select
                      className="form-control"
                      style={{ fontSize: '0.75rem', padding: '4px 6px', height: '30px' }}
                      value={currentModel}
                      onChange={(e) => handlePartChange(p.id, 'Model', e.target.value)}
                    >
                      <option value="">選擇型號</option>
                      {availableModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                      <option value="其他">其他</option>
                    </select>
                  )}
                </div>

                {/* 深度/透光率數字 */}
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '2px', display: 'block' }}>透光度 (深度)</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ fontSize: '0.78rem', padding: '4px 6px', height: '30px', fontWeight: 'bold' }}
                    placeholder="如: 70 / 40"
                    value={currentDepth}
                    onChange={(e) => handlePartChange(p.id, 'Depth', e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
