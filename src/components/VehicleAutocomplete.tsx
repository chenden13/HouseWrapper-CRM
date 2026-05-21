import React, { useState, useEffect } from 'react';
import vehiclesData from '../data/vehicles.json';

interface VehicleAutocompleteProps {
  brand: string;
  model: string;
  vehicleSize: string;
  onSelect: (data: { brand: string; model: string; vehicleSize: string }) => void;
}

// 已經移至 vehicles.json，這裡可以移除或作為極少數備份
const BUILTIN_VEHICLES: any[] = [];

export const VehicleAutocomplete: React.FC<VehicleAutocompleteProps> = ({
  brand, model, vehicleSize, onSelect
}) => {
  // 直接使用內建 JSON 資料
  const fullMaster = React.useMemo(() => {
    return vehiclesData.map(v => ({ ...v, id: `${v.brand}_${v.model}`.toLowerCase() }));
  }, []);

  // 品牌清單 (去重)
  const brands = Array.from(new Set(fullMaster.map(v => v.brand))).sort();

  // 根據目前輸入的品牌，過濾出對應的車型清單
  const filteredModels = fullMaster.filter(v =>
    v.brand && brand && v.brand.toLowerCase() === brand.toLowerCase()
  );

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSelect({ brand: val, model: '', vehicleSize: '' });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 檢查是否選中了清單中的車型
    const match = filteredModels.find(v => v.model === val);
    if (match) {
      onSelect({ brand, model: val, vehicleSize: match.size });
    } else {
      onSelect({ brand, model: val, vehicleSize: '' });
    }
  };

  return (
    <>
      <div className="form-group col-span-4">
        <label className="form-label">汽車品牌</label>
        <input
          type="text"
          list="brand-list"
          className="form-control"
          placeholder="輸入英文字母可快速選擇..."
          value={brand}
          onChange={handleBrandChange}
        />
        <datalist id="brand-list">
          {brands.map(b => <option key={b} value={b} />)}
        </datalist>
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">車種 (Model)</label>
        <input
          type="text"
          list="model-list"
          className="form-control"
          placeholder="請先選擇品牌"
          value={model}
          onChange={handleModelChange}
        />
        <datalist id="model-list">
          {filteredModels.map(m => (
            <option key={m.id} value={m.model}>
              {m.size ? `規格: ${m.size}` : ''}
            </option>
          ))}
        </datalist>
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">車型大小 (尺寸)</label>
        <div
          className="form-control"
          style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#1e293b' }}
        >
          {vehicleSize || '未設定'}
        </div>
      </div>
    </>
  );
};
