import React, { useState, useEffect } from 'react';
import './App.css';
// Build hash refresh: 2026-05-08 19:03
import { api } from './lib/api';


import type { Customer, FilmInventory, User, InventoryLog, PurchaseRecord, FinanceRecord } from './types';

import { Modal } from './components/Modal';
import { PendingEditForm } from './components/PendingEditForm';
import { InquiryPage } from './components/InquiryPage';
import { ConstructionForm } from './components/ConstructionForm';
import { CompletedForm } from './components/CompletedForm';
import { IntakeForm } from './components/IntakeForm';
import { ArchivePage } from './components/ArchivePage';
import { ConstructionMonitorPage } from './components/ConstructionMonitorPage';
import { ExcelImport } from './components/ExcelImport';
import { PendingExcelImport } from './components/PendingExcelImport';
import { ArchiveEditForm } from './components/ArchiveEditForm';
import { PendingListPage } from './components/PendingListPage';
import { InventoryPage } from './components/InventoryPage';
import { LoginPage } from './components/LoginPage';
import { ActiveConstructionPage } from './components/ActiveConstructionPage';
import { FinancePage } from './components/FinancePage';
import { PriceInquiryPage } from './components/PriceInquiryPage';
import { TrackingPage } from './components/TrackingPage';
import { PreparationPage } from './components/PreparationPage';
import { VehicleMasterImport } from './components/VehicleMasterImport';
import { History, Box, LogOut, Clock, Hammer, UserPlus, Wallet, Save, Car, Tag, LayoutPanelTop, ChevronDown, Bell, ClipboardList, Sparkles, Palette, RefreshCcw } from 'lucide-react';

import { useIsMobile } from './hooks/useIsMobile';
import { MobileDashboard } from './components/mobile/MobileDashboard';
import { MobileActiveConstruction } from './components/mobile/MobileActiveConstruction';
import { MobilePendingList } from './components/mobile/MobilePendingList';
import { MobileInquiryList } from './components/mobile/MobileInquiryList';
import { MobileArchive } from './components/mobile/MobileArchive';
import { MobileInventory, MobileFinance } from './components/mobile/MobileMisc';


function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<FilmInventory[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const isMobile = useIsMobile();
  const [view, setView] = useState<'dashboard' | 'inquiry' | 'pending' | 'archive' | 'monitor' | 'inventory' | 'finance' | 'price_detailing' | 'price_film' | 'tracking' | 'preparation'>(isMobile ? 'dashboard' : 'pending');
  const [isLoading, setIsLoading] = useState(true);
  const [importProgress, setImportProgress] = useState<{current: number, total: number} | null>(null);

  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isPendingEditModalOpen, setIsPendingEditModalOpen] = useState(false);
  const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPendingImportModalOpen, setIsPendingImportModalOpen] = useState(false);
  const [isArchiveEditModalOpen, setIsArchiveEditModalOpen] = useState(false);
  const [isVehicleImportModalOpen, setIsVehicleImportModalOpen] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicleMaster, setVehicleMaster] = useState<any[]>([]);

  useEffect(() => {
    const initCloud = async () => {
      console.log('正在連線至雲端:', import.meta.env.VITE_SUPABASE_URL);
      // 增加超時保護
      setTimeout(() => {}, 15000); 
      
      try {
        const cloudCustomers = await api.getCustomers().catch(e => { console.error('客戶讀取失敗', e); return []; });
        const cloudInventory = await api.getInventory().catch(e => { console.error('庫存讀取失敗', e); return []; });
        const cloudLogs = await api.getInventoryLogs().catch(e => { console.error('日誌讀取失敗', e); return []; });
        const cloudPurchases = await api.getPurchaseRecords().catch(e => { console.error('叫貨紀錄讀取失敗', e); return []; });
        const cloudFinance = await api.getFinanceRecords().catch(e => { console.error('財務紀錄讀取失敗', e); return []; });
        const cloudSettlements = await api.getFinanceSettlements().catch(e => { console.error('結算紀錄讀取失敗', e); return []; });
        const cloudVehicleMaster = await api.getVehicleMaster().catch(e => { console.error('車型母檔讀取失敗', e); return []; });
        
        setCustomers(cloudCustomers || []);
        setInventory(cloudInventory || []);
        setInventoryLogs(cloudLogs || []);
        setPurchaseRecords(cloudPurchases || []);
        setFinanceRecords(cloudFinance || []);
        setSettlements(cloudSettlements || []);
        setVehicleMaster(cloudVehicleMaster || []);
      } catch (err: any) {
        console.error('雲端總體初始化失敗:', err);
        alert(`❌ 雲端同步嚴重失敗：\n${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      initCloud();
      if (isMobile) setView('dashboard');
    }
  }, [currentUser, isMobile]);

  const refreshVehicleMaster = async () => {
    const data = await api.getVehicleMaster();
    setVehicleMaster(data || []);
  };





  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPendingEditModalOpen(true);
  };

   const generateCustomerId = () => {
    const list = Array.isArray(customers) ? customers : [];
    return `C-${String(list.length + 1).padStart(3, '0')}`;
  };


  const handleAddOrUpdateCustomer = async (target: Customer, moveToConstruction?: boolean, originalId?: string) => {
    try {
      // If ID changed, delete the old record first
      if (originalId && originalId !== target.id) {
        await api.deleteCustomer(originalId);
        setCustomers(prev => prev.filter(c => c.id !== originalId));
      }

      await api.upsertCustomer(target);
      setCustomers(prev => {
        const exists = prev.find(c => c.id === target.id);
        if (exists) return prev.map(c => c.id === target.id ? target : c);
        return [...prev, target];
      });
    } catch (err) {
      console.error('儲存失敗:', err);
      alert('資料同步失敗，請檢查網路連線');
    }
    
    setIsPendingEditModalOpen(false);
    setIsIntakeModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      await api.upsertCustomer(updatedCustomer);
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    } catch (err) {
      console.error('背景更新失敗:', err);
    }
  };

  const handleGenericUpdate = async (updatedCustomer: Customer, originalId?: string) => {
    try {
      // If ID changed, delete the old record first
      if (originalId && originalId !== updatedCustomer.id) {
        await api.deleteCustomer(originalId);
        setCustomers(prev => prev.filter(c => c.id !== originalId));
      }

      await api.upsertCustomer(updatedCustomer);
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    } catch (err) {
      console.error('更新失敗:', err);
    }
    setIsConstructionModalOpen(false);
    setIsCompletedModalOpen(false);
    setIsArchiveEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('確定要永久刪除此客戶資料嗎？此動作無法復原。')) return;
    try {
      await api.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('刪除失敗:', err);
      alert('刪除失敗，請檢查網路連線');
    }
  };

  const handleImport = async (newCustomers: Customer[]) => {
    setIsImportModalOpen(false);
    setIsPendingImportModalOpen(false);
    
    console.log('--- 匯入除錯模式啟動 ---');
    console.log('原始讀取筆數:', newCustomers.length);

    const existingIds = new Set(customers.map(c => c.id));
    const existingRecords = new Set(customers.map(c => {
      const date = c.expectedStartDate || c.deliveryDate || '';
      return `${String(c.name || '').trim()}_${String(c.phone || '').trim()}_${String(c.plateNumber || '').trim()}_${date}`.toLowerCase();
    }));
    
    const processedCustomers: Customer[] = [];
    let skippedCount = 0;
    
    for (const customer of newCustomers) {
      const isTarget = String(customer.name).includes('黃') || 
                       String(customer.name).includes('欽') || 
                       String(customer.phone).includes('918');
      
      if (isTarget) {
        console.log('【除錯】讀取到目標對象:', customer);
      }

      const date = customer.expectedStartDate || customer.deliveryDate || '';
      const recordKey = `${String(customer.name || '').trim()}_${String(customer.phone || '').trim()}_${String(customer.plateNumber || '').trim()}_${date}`.toLowerCase();
      
      if (existingRecords.has(recordKey)) {
        if (isTarget) console.log(`【除錯】重複而被跳過: ${customer.name} (Key: ${recordKey})`);
        skippedCount++;
        continue;
      }

      let finalId = customer.id;
      let counter = 1;
      while (existingIds.has(finalId) || processedCustomers.some(pc => pc.id === finalId)) {
        finalId = `${customer.id}_${counter}`;
        counter++;
      }
      
      processedCustomers.push({ ...customer, id: finalId });
      if (isTarget) console.log(`【除錯】已加入準備上傳清單，最終 ID: ${finalId}`);
    }

    console.log('處理後準備上傳總筆數:', processedCustomers.length);

    if (processedCustomers.length === 0) {
      alert(`本次匯入 0 筆資料 (偵測到 ${skippedCount} 筆重複資料已自動過濾)`);
      return;
    }

    try {
      setImportProgress({ current: 0, total: processedCustomers.length });
      for (let i = 0; i < processedCustomers.length; i++) {
        await api.upsertCustomer(processedCustomers[i]);
        setImportProgress({ current: i + 1, total: processedCustomers.length });
      }
      
      setCustomers(prev => [...prev, ...processedCustomers]);
      setImportProgress(null);
      alert(`✅ 成功匯入 ${processedCustomers.length} 筆新資料！\n(已自動過濾 ${skippedCount} 筆重複資料)`);

    } catch (err) {
      console.error('雲端同步失敗:', err);
      alert('上傳雲端失敗，請檢查網路連線。');
      setImportProgress(null);
    }
  };
      console.error('雲端同步失敗:', err);
      alert('上傳雲端失敗，請檢查網路連線。');
      setImportProgress(null);
    }
  };

  const handleUpdateInventory = async (item: FilmInventory, detailsOverride?: string) => {
    const log: InventoryLog = {
      id: `LOG-${Date.now()}`,
      itemId: item.id,
      action: 'update',
      details: detailsOverride || `更新 ${item.brand} ${item.color} (${item.location.zone}${item.location.section}-${item.location.slot})`,
      timestamp: new Date().toLocaleString(),
      operator: currentUser?.name || '未知'
    };

    try {
      await Promise.all([
        api.updateInventory(item),
        api.addInventoryLog(log)
      ]);
      setInventory(prev => prev.map(i => i.id === item.id ? item : i));
      setInventoryLogs(prev => [log, ...prev]);
    } catch (err: any) {
      console.error('同步庫存失敗:', err);
      window.alert(`同步庫存失敗: ${err.message || '未知錯誤'}。請確認資料庫是否有 inventory 與 inventory_logs 表格。`);
    }
  };

  const handleAddInventory = async (item: FilmInventory) => {
    const log: InventoryLog = {
      id: `LOG-${Date.now()}`,
      itemId: item.id,
      action: 'add',
      details: `新增 ${item.brand} ${item.color} 於 ${item.location.zone}${item.location.section}-${item.location.slot}`,
      timestamp: new Date().toLocaleString(),
      operator: currentUser?.name || '未知'
    };

    try {
      await Promise.all([
        api.updateInventory(item),
        api.addInventoryLog(log)
      ]);
      setInventory(prev => [...prev, item]);
      setInventoryLogs(prev => [log, ...prev]);
    } catch (err: any) {
      console.error('新增庫存失敗:', err);
      window.alert(`新增庫存失敗: ${err.message || '未知錯誤'}。如果是新環境，請確保 Supabase 已建立 inventory 表格。`);
    }
  };


  const handleRemoveInventory = async (id: string) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const log: InventoryLog = {
      id: `LOG-${Date.now()}`,
      itemId: id,
      action: 'remove',
      details: `移除項目 ${item.brand} ${item.color} (${item.location.zone}${item.location.section}-${item.location.slot})`,
      timestamp: new Date().toLocaleString(),
      operator: currentUser?.name || '未知'
    };

    try {
      await Promise.all([
        api.deleteInventory(id),
        api.addInventoryLog(log)
      ]);
      setInventory(prev => prev.filter(i => i.id !== id));
      setInventoryLogs(prev => [log, ...prev]);
    } catch (err: any) {
      console.error('移除庫存失敗:', err);
      alert('移除失敗，請稍後再試。');
    }
  };

  const handleAddPurchaseRecord = async (record: PurchaseRecord) => {
    console.log('App.tsx: 準備新增叫貨紀錄', record);
    try {
      await api.addPurchaseRecord(record);
      setPurchaseRecords(prev => {
        const next = [record, ...prev];
        console.log('App.tsx: 更新後的紀錄總數:', next.length);
        return next;
      });
      window.alert('✅ 叫貨紀錄已成功暫存！(若尚未建立資料庫表格，重整後會更新回模擬資料)');
    } catch (err: any) {
      console.error('新增叫貨紀錄失敗:', err);
      window.alert(`❌ 新增失敗: ${err.message || '未知錯誤'}`);
    }
  };

  const handleAddFinanceRecord = async (record: FinanceRecord) => {
    try {
      await api.addFinanceRecord(record);
      setFinanceRecords(prev => {
        const next = [record, ...prev];
        localStorage.setItem('financeRecords', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error('新增財務紀錄失敗:', err);
    }
  };

  const handleDeleteFinanceRecord = async (id: string) => {
    try {
      await api.deleteFinanceRecord(id);
      setFinanceRecords(prev => {
        const next = prev.filter(r => r.id !== id);
        localStorage.setItem('financeRecords', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error('刪除財務紀錄失敗:', err);
    }
  };

  const handleSettleBook = async (settlement: any, recordIds: string[]) => {
    try {
      // 1. 先存入結算快照
      await api.addFinanceSettlement(settlement);
      
      // 2. 更新這些項目的 settlementId
      if (recordIds.length > 0) {
        await api.updateFinanceRecordsSettlement(recordIds, settlement.id);
      }

      // 3. 更新本地狀態
      setSettlements(prev => [settlement, ...prev]);
      setFinanceRecords(prev => prev.map(r => {
        if (recordIds.includes(r.id)) {
          return { ...r, settlementId: settlement.id };
        }
        return r;
      }));

      alert('帳本結算成功！該時段記錄已封存至結算紀錄。');
    } catch (err) {
      console.error('結算失敗:', err);
      alert('結算失敗，請確認資料表欄位是否正確');
    }
  };


  const handleLogout = () => {
    setCurrentUser(null);
    setView('pending');
  };



  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;
  
  if (isLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 'bold' }}>雲端同步中...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (isMobile) {
    return (
      <div className="mobile-app-container">
        {view === 'dashboard' ? (
          <MobileDashboard 
            user={currentUser} 
            onNavigate={(v) => setView(v === 'intake' ? 'inquiry' : v)} 
            onLogout={handleLogout}
            stats={{
              inquiry: customers.filter(c => c.status === 'new').length,
              pending: customers.filter(c => ['deposit', 'scheduled'].includes(c.status)).length,
              monitor: customers.filter(c => c.status === 'construction').length
            }}
          />
        ) : view === 'monitor' ? (
          <MobileActiveConstruction 
            customers={customers} 
            onEditCustomer={(c) => { setSelectedCustomer(c); setIsConstructionModalOpen(true); }}
            onAddNew={() => { setSelectedCustomer(null); setIsPendingEditModalOpen(true); }}
            onBack={() => setView('dashboard')}
            onDeleteCustomer={handleDeleteCustomer}
          />
        ) : view === 'pending' ? (
          <MobilePendingList 
            customers={customers}
            onEditCustomer={handleEditCustomer}
            onAddNew={() => { setSelectedCustomer(null); setIsPendingEditModalOpen(true); }}
            onBack={() => setView('dashboard')}
            onDeleteCustomer={handleDeleteCustomer}
          />
        ) : view === 'inquiry' ? (
          <MobileInquiryList 
            customers={customers}
            onEditCustomer={handleEditCustomer}
            onAddNew={() => { setSelectedCustomer(null); setIsIntakeModalOpen(true); }}
            onBack={() => setView('dashboard')}
            onDeleteCustomer={handleDeleteCustomer}
          />
        ) : view === 'archive' ? (
          <MobileArchive 
            customers={customers}
            onEdit={(c) => { setSelectedCustomer(c); setIsArchiveEditModalOpen(true); }}
            onBack={() => setView('dashboard')}
            onDeleteCustomer={handleDeleteCustomer}
          />
        {/* 
        ) : view === 'price_detailing' ? (
          <PriceInquiryPage vehicleMaster={vehicleMaster} initialMode="detailing" onBack={() => setView('dashboard')} />
        ) : view === 'price_film' ? (
          <PriceInquiryPage vehicleMaster={vehicleMaster} initialMode="film" onBack={() => setView('dashboard')} />
        */}
        ) : view === 'inventory' ? (
          <MobileInventory onBack={() => setView('dashboard')} />
        ) : view === 'finance' ? (
          <MobileFinance onBack={() => setView('dashboard')} />
        ) : null}

        {/* Reuse Modals for both Mobile and Desktop */}
        {isPendingEditModalOpen && (
          <Modal isOpen={isPendingEditModalOpen} onClose={() => setIsPendingEditModalOpen(false)} title="編輯排程資料">
            <PendingEditForm 
              customer={selectedCustomer || undefined} 
              onSuggestId={generateCustomerId()}
              vehicleMaster={vehicleMaster}
              userRole={currentUser.role}
              onSubmit={(c, m, o) => handleAddOrUpdateCustomer(c, m, o)} 
              onCancel={() => setIsPendingEditModalOpen(false)} 
            />
          </Modal>
        )}

        {isIntakeModalOpen && (
          <Modal isOpen={isIntakeModalOpen} onClose={() => setIsIntakeModalOpen(false)} title="新增諮詢進件">
            <IntakeForm 
              onSuggestId={generateCustomerId()}
              vehicleMaster={vehicleMaster}
              onSubmit={handleAddOrUpdateCustomer} 
              onCancel={() => setIsIntakeModalOpen(false)} 
            />
          </Modal>
        )}

        {isConstructionModalOpen && selectedCustomer && (
          <Modal isOpen={isConstructionModalOpen} onClose={() => setIsConstructionModalOpen(false)} title="施工進度更新">
            <ConstructionForm 
              customer={selectedCustomer} 
              onUpdate={handleGenericUpdate} 
              onCancel={() => setIsConstructionModalOpen(false)} 
            />
          </Modal>
        )}

          <Modal isOpen={isArchiveEditModalOpen} onClose={() => setIsArchiveEditModalOpen(false)} title="編輯完工檔案庫">
            {selectedCustomer && (
              <ArchiveEditForm 
                customer={selectedCustomer} 
                userRole={currentUser.role}
                onSubmit={(c, o) => {
                  handleGenericUpdate(c, o);
                }} 
                onCancel={() => setIsArchiveEditModalOpen(false)} 
              />
            )}
          </Modal>
      </div>
    );
  }

  return (

    <div className="app-container">
      {importProgress && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>🚀 資料上傳雲端中，請勿關閉網頁...</h2>
          <div style={{ width: '300px', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${(importProgress.current / importProgress.total) * 100}%`, height: '100%', background: '#e11d48', transition: 'width 0.2s' }}></div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>V.613 PRO MAX - 內部管理系統</p>
          <p style={{ color: '#64748b', fontWeight: 'bold' }}>{importProgress.current} / {importProgress.total} 筆已完成</p>
        </div>
      )}
      <header className="app-header glass-panel" style={{ padding: '8px 20px', height: 'auto', gap: '20px' }}>
        <div className="brand" style={{ gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>C</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              好室多膜 CRM
            </h1>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>PRO MAX V.614</span>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
          <div className="nav-group" style={{ padding: '3px' }}>
            <button className={`nav-tab ${view === 'inquiry' ? 'active' : ''}`} onClick={() => setView('inquiry')}>
              <UserPlus size={17} /> 諮詢區
            </button>
            <button className={`nav-tab ${view === 'pending' ? 'active' : ''}`} onClick={() => setView('pending')}>
              <Clock size={17} /> 待施工區
            </button>
            <button className={`nav-tab ${view === 'preparation' ? 'active' : ''}`} onClick={() => setView('preparation')}>
              <ClipboardList size={17} /> 事前準備
            </button>
            <button className={`nav-tab ${view === 'monitor' ? 'active' : ''}`} onClick={() => setView('monitor')}>
              <Hammer size={17} /> 現場監控
            </button>
            <button className={`nav-tab ${view === 'inventory' ? 'active' : ''}`} onClick={() => setView('inventory')}>
              <Box size={17} /> 膜料庫存
            </button>
            <button className={`nav-tab ${view === 'tracking' ? 'active' : ''}`} onClick={() => setView('tracking')}>
              <Bell size={17} /> 售後追蹤
            </button>
            <button className={`nav-tab ${view === 'archive' ? 'active' : ''}`} onClick={() => setView('archive')}>
              <History size={17} /> 完工檔案
            </button>
            {/* 價目查詢暫時隱藏，已轉移至獨立公開版 
            <div className="nav-dropdown">
              <button className={`nav-tab ${(view === 'price_detailing' || view === 'price_film') ? 'active-parent' : ''}`}>
                <Tag size={17} /> 價目查詢 <ChevronDown size={14} style={{ marginLeft: '4px' }} />
              </button>
              <div className="nav-dropdown-content">
                <button 
                  className={`dropdown-item ${view === 'price_detailing' ? 'active' : ''}`} 
                  onClick={() => setView('price_detailing')}
                >
                  <Sparkles size={16} /> 汽車美容報價
                </button>
                <button 
                  className={`dropdown-item ${view === 'price_film' ? 'active' : ''}`} 
                  onClick={() => setView('price_film')}
                >
                  <Palette size={16} /> 貼膜施工報價
                </button>
              </div>
            </div>
            */}
            {currentUser.role === 'admin' && (
              <button className={`nav-tab ${view === 'finance' ? 'active' : ''}`} onClick={() => setView('finance')}>
                <Wallet size={17} /> 收支記帳
              </button>
            )}
          </div>

          <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }}></div>

          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{currentUser.role === 'admin' ? 'ADMIN' : 'STAFF'}</div>
            </div>
            <button 
              className="btn" 
              onClick={loadData} 
              disabled={loading}
              title="重新同步雲端資料"
              style={{ background: '#f8fafc', color: '#0ea5e9', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="btn" onClick={handleLogout} style={{ background: '#f8fafc', color: '#64748b', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
        </div>
      </header>

      {view === 'inquiry' ? (
        <InquiryPage 
          customers={customers}
          onEditCustomer={handleEditCustomer}
          userRole={currentUser.role}
          onAddNew={() => setIsIntakeModalOpen(true)}
          onDeleteCustomer={handleDeleteCustomer}
        />
      ) : view === 'monitor' ? (
        <ActiveConstructionPage
          customers={customers}
          onEditCustomer={(c) => {
            setSelectedCustomer(c);
            setIsConstructionModalOpen(true);
          }}
          onDeleteCustomer={handleDeleteCustomer}
        />
      ) : view === 'pending' ? (
        <PendingListPage
          customers={customers}
          onEditCustomer={handleEditCustomer}
          onUpdateCustomer={handleGenericUpdate}
          userRole={currentUser.role}
          onImportClick={() => setIsPendingImportModalOpen(true)}
          onAddNew={() => { setSelectedCustomer(null); setIsPendingEditModalOpen(true); }}
          onDeleteCustomer={handleDeleteCustomer}
        />
      ) : view === 'archive' ? (
        <ArchivePage 
          customers={customers} 
          onBack={() => setView('pending')} 
          onUpdate={(c) => setCustomers(prev => prev.map(x => x.id === c.id ? c : x))}
          onEdit={(c) => {
            setSelectedCustomer(c);
            setIsArchiveEditModalOpen(true);
          }}
          onViewDetail={() => {}} 
          userRole={currentUser.role}
          onImportClick={() => setIsImportModalOpen(true)}
          onDeleteCustomer={handleDeleteCustomer}
        />
      ) : view === 'preparation' ? (
        <PreparationPage 
          customers={customers} 
          onUpdateCustomer={handleGenericUpdate} 
        />
      ) : view === 'inventory' ? (
        <InventoryPage 
          inventory={inventory}
          inventoryLogs={inventoryLogs}
          purchaseRecords={purchaseRecords}
          userRole={currentUser.role}
          onAddInventory={handleAddInventory}
          onUpdateInventory={handleUpdateInventory}
          onRemoveInventory={handleRemoveInventory}
          onAddPurchaseRecord={handleAddPurchaseRecord}
          onBack={() => setView('pending')}
        />

      ) : view === 'price_detailing' ? (
        <PriceInquiryPage key="detailing" vehicleMaster={vehicleMaster} initialMode="detailing" />
      ) : view === 'price_film' ? (
        <PriceInquiryPage key="film" vehicleMaster={vehicleMaster} initialMode="film" />

      ) : view === 'tracking' ? (
        <TrackingPage 
          customers={customers} 
          onUpdateCustomer={handleGenericUpdate} 
        />

      ) : view === 'finance' ? (
        <FinancePage 
          records={financeRecords}
          settlements={settlements}
          onAddRecord={handleAddFinanceRecord}
          onDeleteRecord={handleDeleteFinanceRecord}
          onSettle={handleSettleBook}
        />
      ) : (

        <ConstructionMonitorPage 
          customers={customers} 
          onBack={() => setView('pending')}
          onUpdateProgress={handleUpdateCustomer}
          onEdit={(c) => {
            setSelectedCustomer(c);
            setIsConstructionModalOpen(true);
          }}
        />


      )}



      {/* New Inquiry / Intake Modal */}
      <Modal isOpen={isIntakeModalOpen} onClose={() => setIsIntakeModalOpen(false)} title="新增客戶資料表單">
        <IntakeForm 
          onSuggestId={generateCustomerId()}
          vehicleMaster={vehicleMaster}
          onSubmit={(newCustomer) => {
            handleAddOrUpdateCustomer(newCustomer);
          }}
          onCancel={() => setIsIntakeModalOpen(false)}
        />
      </Modal>

      {/* Unified Pending Edit Modal */}
      <Modal isOpen={isPendingEditModalOpen} onClose={() => setIsPendingEditModalOpen(false)} title={selectedCustomer ? "修改待施工案件" : "新增客戶 / 預約單"}>
        <PendingEditForm 
          customer={selectedCustomer} 
          onSuggestId={generateCustomerId()}
          vehicleMaster={vehicleMaster}
          userRole={currentUser.role}
          onSubmit={(updatedCustomer, moveToConstruction, originalId) => {
             handleAddOrUpdateCustomer(updatedCustomer, moveToConstruction, originalId);
             if (moveToConstruction) {
                // If it moved to construction, we might want some feedback or different behavior, 
                // but handleAddOrUpdate already saves it with the new status.
             }
          }}
          onCancel={() => setIsPendingEditModalOpen(false)}
        />
      </Modal>


      <Modal isOpen={isConstructionModalOpen} onClose={() => setIsConstructionModalOpen(false)} title="施工檢核與照片上傳">
        {selectedCustomer && (
          <ConstructionForm 
            customer={selectedCustomer} 
            onSubmit={(c) => {
              handleGenericUpdate(c);
              setIsConstructionModalOpen(false);
            }}
            onSaveProgress={(c) => {
              handleGenericUpdate(c);
            }}
            onCancel={() => setIsConstructionModalOpen(false)} 
          />
        )}
      </Modal>

      <Modal isOpen={isCompletedModalOpen} onClose={() => setIsCompletedModalOpen(false)} title="售後關懷與結案設定">
        {selectedCustomer && (
          <CompletedForm 
            customer={selectedCustomer} 
            onSubmit={handleGenericUpdate} 
            onCancel={() => setIsCompletedModalOpen(false)} 
          />
        )}
      </Modal>

      <Modal isOpen={isArchiveEditModalOpen} onClose={() => setIsArchiveEditModalOpen(false)} title="編輯完工檔案庫">
        {selectedCustomer && (
          <ArchiveEditForm 
            customer={selectedCustomer} 
            userRole={currentUser.role}
            onSubmit={(c, o) => {
              handleGenericUpdate(c, o);
            }} 
            onCancel={() => setIsArchiveEditModalOpen(false)} 
          />
        )}
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="完工資料 Excel 匯入">
        <ExcelImport 
          onImport={handleImport} 
          onCancel={() => setIsImportModalOpen(false)} 
        />
      </Modal>

      <Modal isOpen={isPendingImportModalOpen} onClose={() => setIsPendingImportModalOpen(false)} title="排程資料 Excel 匯入">
        <PendingExcelImport 
          onImport={handleImport} 
          onCancel={() => setIsPendingImportModalOpen(false)} 
        />
      </Modal>

      <Modal isOpen={isVehicleImportModalOpen} onClose={() => setIsVehicleImportModalOpen(false)} title="車型母檔匯入">
        <VehicleMasterImport 
          onCancel={() => setIsVehicleImportModalOpen(false)}
          onSuccess={() => {
            setIsVehicleImportModalOpen(false);
            refreshVehicleMaster();
          }}
        />
      </Modal>

    </div>

  );
}

export default App;
