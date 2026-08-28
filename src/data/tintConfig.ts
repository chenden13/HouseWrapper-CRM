import type { Customer } from '../types';

export interface WindowTintPartConfig {
  brand: string;
  model: string;
}

export interface TintPreset {
  id: string;
  name: string;
  carModel: 'Model 3' | 'Model Y';
  brand: string;
  priceNoSunroof: number;
  priceWithSunroof: number;
  parts: {
    frontWind: WindowTintPartConfig;
    frontSeat: WindowTintPartConfig;
    rearSeat: WindowTintPartConfig;
    rearWind: WindowTintPartConfig;
    sunroof: WindowTintPartConfig;
  };
}

export const TINT_BRANDS: string[] = [
  "3M",
  "桑馬克",
  "FSK",
  "舒熱佳",
  "量子膜",
  "Xpel",
  "T4 / Vega",
  "皇家",
  "其他"
];

export const TINT_MODELS_BY_BRAND: Record<string, string[]> = {
  "3M": ["極黑", "極透"],
  "桑馬克": ["Smart RR", "Smart", "XC max"],
  "FSK": ["冰鑽 KT"],
  "舒熱佳": ["XE"],
  "量子膜": ["ZX"],
  "Xpel": ["X2 Plus"],
  "T4 / Vega": ["T4", "Vega"],
  "皇家": ["Supreme"],
  "其他": ["自訂型號"]
};

// 依據圖一與圖二定義 Model 3 & Model Y 官方規格與報價套裝
export const TINT_PRESETS: TintPreset[] = [
  // --- Model 3 套裝 (圖一) ---
  {
    id: 'm3_3m_black',
    name: '3M 全車 極黑系列',
    carModel: 'Model 3',
    brand: '3M',
    priceNoSunroof: 26500,
    priceWithSunroof: 29500,
    parts: {
      frontWind: { brand: '3M', model: '極黑' },
      frontSeat: { brand: '3M', model: '極黑' },
      rearSeat: { brand: '3M', model: '極黑' },
      rearWind: { brand: '3M', model: '極黑' },
      sunroof: { brand: '3M', model: '極黑' },
    }
  },
  {
    id: 'm3_3m_clear',
    name: '3M 全車 極透系列',
    carModel: 'Model 3',
    brand: '3M',
    priceNoSunroof: 32500,
    priceWithSunroof: 36500,
    parts: {
      frontWind: { brand: '3M', model: '極透' },
      frontSeat: { brand: '3M', model: '極透' },
      rearSeat: { brand: '3M', model: '極透' },
      rearWind: { brand: '3M', model: '極透' },
      sunroof: { brand: '3M', model: '極透' },
    }
  },
  {
    id: 'm3_3m_p1',
    name: '3M 前擋天窗/極透 車身/極黑',
    carModel: 'Model 3',
    brand: '3M',
    priceNoSunroof: 30500,
    priceWithSunroof: 34500,
    parts: {
      frontWind: { brand: '3M', model: '極透' },
      frontSeat: { brand: '3M', model: '極黑' },
      rearSeat: { brand: '3M', model: '極黑' },
      rearWind: { brand: '3M', model: '極黑' },
      sunroof: { brand: '3M', model: '極透' },
    }
  },
  {
    id: 'm3_3m_p2',
    name: '3M 前擋/極透 車身天窗/極黑',
    carModel: 'Model 3',
    brand: '3M',
    priceNoSunroof: 30500,
    priceWithSunroof: 33500,
    parts: {
      frontWind: { brand: '3M', model: '極透' },
      frontSeat: { brand: '3M', model: '極黑' },
      rearSeat: { brand: '3M', model: '極黑' },
      rearWind: { brand: '3M', model: '極黑' },
      sunroof: { brand: '3M', model: '極黑' },
    }
  },
  {
    id: 'm3_sunmark_smart',
    name: '桑馬克 全車/Smart',
    carModel: 'Model 3',
    brand: '桑馬克',
    priceNoSunroof: 34500,
    priceWithSunroof: 42500,
    parts: {
      frontWind: { brand: '桑馬克', model: 'Smart' },
      frontSeat: { brand: '桑馬克', model: 'Smart' },
      rearSeat: { brand: '桑馬克', model: 'Smart' },
      rearWind: { brand: '桑馬克', model: 'Smart' },
      sunroof: { brand: '桑馬克', model: 'Smart' },
    }
  },
  {
    id: 'm3_sunmark_xcmax',
    name: '桑馬克 全車/XC max',
    carModel: 'Model 3',
    brand: '桑馬克',
    priceNoSunroof: 28500,
    priceWithSunroof: 36500,
    parts: {
      frontWind: { brand: '桑馬克', model: 'XC max' },
      frontSeat: { brand: '桑馬克', model: 'XC max' },
      rearSeat: { brand: '桑馬克', model: 'XC max' },
      rearWind: { brand: '桑馬克', model: 'XC max' },
      sunroof: { brand: '桑馬克', model: 'XC max' },
    }
  },
  {
    id: 'm3_sunmark_rr_xc',
    name: '桑馬克 前擋/Smart RR 車身天窗/XC max',
    carModel: 'Model 3',
    brand: '桑馬克',
    priceNoSunroof: 36000,
    priceWithSunroof: 44000,
    parts: {
      frontWind: { brand: '桑馬克', model: 'Smart RR' },
      frontSeat: { brand: '桑馬克', model: 'XC max' },
      rearSeat: { brand: '桑馬克', model: 'XC max' },
      rearWind: { brand: '桑馬克', model: 'XC max' },
      sunroof: { brand: '桑馬克', model: 'XC max' },
    }
  },
  {
    id: 'm3_sunmark_smart_xc',
    name: '桑馬克 前擋/Smart 車身天窗/XC max',
    carModel: 'Model 3',
    brand: '桑馬克',
    priceNoSunroof: 32500,
    priceWithSunroof: 40500,
    parts: {
      frontWind: { brand: '桑馬克', model: 'Smart' },
      frontSeat: { brand: '桑馬克', model: 'XC max' },
      rearSeat: { brand: '桑馬克', model: 'XC max' },
      rearWind: { brand: '桑馬克', model: 'XC max' },
      sunroof: { brand: '桑馬克', model: 'XC max' },
    }
  },
  {
    id: 'm3_fsk_kt',
    name: 'FSK 全車/冰鑽 KT系列',
    carModel: 'Model 3',
    brand: 'FSK',
    priceNoSunroof: 37500,
    priceWithSunroof: 42500,
    parts: {
      frontWind: { brand: 'FSK', model: '冰鑽 KT' },
      frontSeat: { brand: 'FSK', model: '冰鑽 KT' },
      rearSeat: { brand: 'FSK', model: '冰鑽 KT' },
      rearWind: { brand: 'FSK', model: '冰鑽 KT' },
      sunroof: { brand: 'FSK', model: '冰鑽 KT' },
    }
  },
  {
    id: 'm3_solargard_xe',
    name: '舒熱佳 全車/XE系列',
    carModel: 'Model 3',
    brand: '舒熱佳',
    priceNoSunroof: 37500,
    priceWithSunroof: 42500,
    parts: {
      frontWind: { brand: '舒熱佳', model: 'XE' },
      frontSeat: { brand: '舒熱佳', model: 'XE' },
      rearSeat: { brand: '舒熱佳', model: 'XE' },
      rearWind: { brand: '舒熱佳', model: 'XE' },
      sunroof: { brand: '舒熱佳', model: 'XE' },
    }
  },
  {
    id: 'm3_quantum_zx',
    name: '量子膜 全車/ZX系列',
    carModel: 'Model 3',
    brand: '量子膜',
    priceNoSunroof: 35500,
    priceWithSunroof: 42500,
    parts: {
      frontWind: { brand: '量子膜', model: 'ZX' },
      frontSeat: { brand: '量子膜', model: 'ZX' },
      rearSeat: { brand: '量子膜', model: 'ZX' },
      rearWind: { brand: '量子膜', model: 'ZX' },
      sunroof: { brand: '量子膜', model: 'ZX' },
    }
  },
  {
    id: 'm3_xpel_x2',
    name: 'Xpel 全車/X2 Plus系列',
    carModel: 'Model 3',
    brand: 'Xpel',
    priceNoSunroof: 30500,
    priceWithSunroof: 35500,
    parts: {
      frontWind: { brand: 'Xpel', model: 'X2 Plus' },
      frontSeat: { brand: 'Xpel', model: 'X2 Plus' },
      rearSeat: { brand: 'Xpel', model: 'X2 Plus' },
      rearWind: { brand: 'Xpel', model: 'X2 Plus' },
      sunroof: { brand: 'Xpel', model: 'X2 Plus' },
    }
  },

  // --- Model Y 套裝 (圖二) ---
  {
    id: 'my_3m_black',
    name: '3M 全車 極黑系列',
    carModel: 'Model Y',
    brand: '3M',
    priceNoSunroof: 24500,
    priceWithSunroof: 32500,
    parts: {
      frontWind: { brand: '3M', model: '極黑' },
      frontSeat: { brand: '3M', model: '極黑' },
      rearSeat: { brand: '3M', model: '極黑' },
      rearWind: { brand: '3M', model: '極黑' },
      sunroof: { brand: '3M', model: '極黑' },
    }
  },
  {
    id: 'my_3m_clear',
    name: '3M 全車 極透系列',
    carModel: 'Model Y',
    brand: '3M',
    priceNoSunroof: 30500,
    priceWithSunroof: 40500,
    parts: {
      frontWind: { brand: '3M', model: '極透' },
      frontSeat: { brand: '3M', model: '極透' },
      rearSeat: { brand: '3M', model: '極透' },
      rearWind: { brand: '3M', model: '極透' },
      sunroof: { brand: '3M', model: '極透' },
    }
  },
  {
    id: 'my_3m_p1',
    name: '3M 前擋天窗/極透 車身/極黑',
    carModel: 'Model Y',
    brand: '3M',
    priceNoSunroof: 28500,
    priceWithSunroof: 38500,
    parts: {
      frontWind: { brand: '3M', model: '極透' },
      frontSeat: { brand: '3M', model: '極黑' },
      rearSeat: { brand: '3M', model: '極黑' },
      rearWind: { brand: '3M', model: '極黑' },
      sunroof: { brand: '3M', model: '極透' },
    }
  },
  {
    id: 'my_3m_p2',
    name: '3M 前擋/極透 車身天窗/極黑',
    carModel: 'Model Y',
    brand: '3M',
    priceNoSunroof: 28500,
    priceWithSunroof: 36500,
    parts: {
      frontWind: { brand: '3M', model: '極透' },
      frontSeat: { brand: '3M', model: '極黑' },
      rearSeat: { brand: '3M', model: '極黑' },
      rearWind: { brand: '3M', model: '極黑' },
      sunroof: { brand: '3M', model: '極黑' },
    }
  },
  {
    id: 'my_sunmark_smart',
    name: '桑馬克 全車/Smart',
    carModel: 'Model Y',
    brand: '桑馬克',
    priceNoSunroof: 32500,
    priceWithSunroof: 40500,
    parts: {
      frontWind: { brand: '桑馬克', model: 'Smart' },
      frontSeat: { brand: '桑馬克', model: 'Smart' },
      rearSeat: { brand: '桑馬克', model: 'Smart' },
      rearWind: { brand: '桑馬克', model: 'Smart' },
      sunroof: { brand: '桑馬克', model: 'Smart' },
    }
  },
  {
    id: 'my_sunmark_xcmax',
    name: '桑馬克 全車/XC max',
    carModel: 'Model Y',
    brand: '桑馬克',
    priceNoSunroof: 26500,
    priceWithSunroof: 34500,
    parts: {
      frontWind: { brand: '桑馬克', model: 'XC max' },
      frontSeat: { brand: '桑馬克', model: 'XC max' },
      rearSeat: { brand: '桑馬克', model: 'XC max' },
      rearWind: { brand: '桑馬克', model: 'XC max' },
      sunroof: { brand: '桑馬克', model: 'XC max' },
    }
  },
  {
    id: 'my_sunmark_rr_xc',
    name: '桑馬克 前擋/Smart RR 車身天窗/XC max',
    carModel: 'Model Y',
    brand: '桑馬克',
    priceNoSunroof: 33500,
    priceWithSunroof: 41000,
    parts: {
      frontWind: { brand: '桑馬克', model: 'Smart RR' },
      frontSeat: { brand: '桑馬克', model: 'XC max' },
      rearSeat: { brand: '桑馬克', model: 'XC max' },
      rearWind: { brand: '桑馬克', model: 'XC max' },
      sunroof: { brand: '桑馬克', model: 'XC max' },
    }
  },
  {
    id: 'my_sunmark_smart_xc',
    name: '桑馬克 前擋/Smart 車身天窗/XC max',
    carModel: 'Model Y',
    brand: '桑馬克',
    priceNoSunroof: 28500,
    priceWithSunroof: 36500,
    parts: {
      frontWind: { brand: '桑馬克', model: 'Smart' },
      frontSeat: { brand: '桑馬克', model: 'XC max' },
      rearSeat: { brand: '桑馬克', model: 'XC max' },
      rearWind: { brand: '桑馬克', model: 'XC max' },
      sunroof: { brand: '桑馬克', model: 'XC max' },
    }
  },
  {
    id: 'my_fsk_kt',
    name: 'FSK 全車/冰鑽 KT系列',
    carModel: 'Model Y',
    brand: 'FSK',
    priceNoSunroof: 28500,
    priceWithSunroof: 40500,
    parts: {
      frontWind: { brand: 'FSK', model: '冰鑽 KT' },
      frontSeat: { brand: 'FSK', model: '冰鑽 KT' },
      rearSeat: { brand: 'FSK', model: '冰鑽 KT' },
      rearWind: { brand: 'FSK', model: '冰鑽 KT' },
      sunroof: { brand: 'FSK', model: '冰鑽 KT' },
    }
  },
  {
    id: 'my_solargard_xe',
    name: '舒熱佳 全車/XE系列',
    carModel: 'Model Y',
    brand: '舒熱佳',
    priceNoSunroof: 28500,
    priceWithSunroof: 40500,
    parts: {
      frontWind: { brand: '舒熱佳', model: 'XE' },
      frontSeat: { brand: '舒熱佳', model: 'XE' },
      rearSeat: { brand: '舒熱佳', model: 'XE' },
      rearWind: { brand: '舒熱佳', model: 'XE' },
      sunroof: { brand: '舒熱佳', model: 'XE' },
    }
  },
  {
    id: 'my_quantum_zx',
    name: '量子膜 全車/ZX系列',
    carModel: 'Model Y',
    brand: '量子膜',
    priceNoSunroof: 28500,
    priceWithSunroof: 40500,
    parts: {
      frontWind: { brand: '量子膜', model: 'ZX' },
      frontSeat: { brand: '量子膜', model: 'ZX' },
      rearSeat: { brand: '量子膜', model: 'ZX' },
      rearWind: { brand: '量子膜', model: 'ZX' },
      sunroof: { brand: '量子膜', model: 'ZX' },
    }
  },
  {
    id: 'my_xpel_x2',
    name: 'Xpel 全車/X2 Plus系列',
    carModel: 'Model Y',
    brand: 'Xpel',
    priceNoSunroof: 26500,
    priceWithSunroof: 37500,
    parts: {
      frontWind: { brand: 'Xpel', model: 'X2 Plus' },
      frontSeat: { brand: 'Xpel', model: 'X2 Plus' },
      rearSeat: { brand: 'Xpel', model: 'X2 Plus' },
      rearWind: { brand: 'Xpel', model: 'X2 Plus' },
      sunroof: { brand: 'Xpel', model: 'X2 Plus' },
    }
  }
];

export function getPresetsForModel(carModelStr?: string): TintPreset[] {
  const model = (carModelStr || '').toLowerCase();
  if (model.includes('model 3') || model.includes('m3')) {
    return TINT_PRESETS.filter(p => p.carModel === 'Model 3');
  }
  if (model.includes('model y') || model.includes('my')) {
    return TINT_PRESETS.filter(p => p.carModel === 'Model Y');
  }
  return TINT_PRESETS;
}

// 舊資料相容與轉移邏輯
export function migrateLegacyTintData(customer: Partial<Customer>): Partial<Customer> {
  const updated = { ...customer };
  
  // 1. 如果已有 windowTintCustomName 則保留
  if (!updated.windowTintCustomName && (updated.windowTintBrand || updated.windowTint)) {
    // 若 windowTintBrand 不是標準型號 (例如 "RR+XC"、"前Smart後XC" 等)，將其轉移入 windowTintCustomName
    const isStandardModel = Object.values(TINT_MODELS_BY_BRAND).some(list => list.includes(updated.windowTintBrand || ''));
    if (!isStandardModel && updated.windowTintBrand) {
      updated.windowTintCustomName = updated.windowTintBrand;
    } else if (updated.windowTint && updated.windowTintBrand) {
      updated.windowTintCustomName = `${updated.windowTint} ${updated.windowTintBrand}`;
    }
  }

  // 2. 如果缺少各部位品牌，預設嘗試從 windowTint 主品牌填入
  const defaultBrand = updated.windowTint || '桑馬克';
  if (!updated.tintBrandFrontWind && updated.tintDepthFrontWind) updated.tintBrandFrontWind = defaultBrand;
  if (!updated.tintBrandFrontSeat && updated.tintDepthFrontSeat) updated.tintBrandFrontSeat = defaultBrand;
  if (!updated.tintBrandRearSeat && updated.tintDepthRearSeat) updated.tintBrandRearSeat = defaultBrand;
  if (!updated.tintBrandRearWind && updated.tintDepthRearWind) updated.tintBrandRearWind = defaultBrand;
  if (!updated.tintBrandSunroof && updated.tintDepthSunroof) updated.tintBrandSunroof = defaultBrand;

  // 3. 推斷 RR+XC 舊字串
  if (updated.windowTintBrand?.toLowerCase().includes('rr')) {
    if (!updated.tintModelFrontWind) updated.tintModelFrontWind = 'Smart RR';
    if (!updated.tintModelFrontSeat) updated.tintModelFrontSeat = 'XC max';
    if (!updated.tintModelRearSeat) updated.tintModelRearSeat = 'XC max';
    if (!updated.tintModelRearWind) updated.tintModelRearWind = 'XC max';
  }

  return updated;
}

// 組合為乾淨的隔熱紙摘要說明 (供視圖、派工單與列表顯示)
export function formatTintSummary(customer: Partial<Customer>): { mainText: string; subText: string; details: { part: string; brand: string; model: string; depth: string }[] } {
  const migrated = migrateLegacyTintData(customer);
  
  const details = [
    { part: '前擋', brand: migrated.tintBrandFrontWind || '', model: migrated.tintModelFrontWind || '', depth: migrated.tintDepthFrontWind || '' },
    { part: '前座', brand: migrated.tintBrandFrontSeat || '', model: migrated.tintBrandFrontSeat ? (migrated.tintModelFrontSeat || '') : '', depth: migrated.tintDepthFrontSeat || '' },
    { part: '後座', brand: migrated.tintBrandRearSeat || '', model: migrated.tintBrandRearSeat ? (migrated.tintModelRearSeat || '') : '', depth: migrated.tintDepthRearSeat || '' },
    { part: '後擋', brand: migrated.tintBrandRearWind || '', model: migrated.tintBrandRearWind ? (migrated.tintModelRearWind || '') : '', depth: migrated.tintDepthRearWind || '' },
    { part: '天窗', brand: migrated.tintBrandSunroof || '', model: migrated.tintBrandSunroof ? (migrated.tintModelSunroof || '') : '', depth: migrated.tintDepthSunroof || '' }
  ];

  let mainText = migrated.windowTintCustomName || migrated.windowTintBrand || migrated.windowTint || '';
  if (!mainText) {
    const brands = Array.from(new Set(details.map(d => d.brand).filter(Boolean)));
    mainText = brands.join(' / ') || '隔熱紙';
  }

  let subText = migrated.windowTint || '';
  if (migrated.windowTintCustomName && migrated.windowTintBrand) {
    subText = migrated.windowTintBrand;
  }

  return { mainText, subText, details };
}
