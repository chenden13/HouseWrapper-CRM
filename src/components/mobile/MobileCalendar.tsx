import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Phone, Car, X, Edit, Trash2 } from 'lucide-react';
import type { Customer } from '../../types';

interface MobileCalendarProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onUpdateCustomer: (updatedCustomer: Customer) => Promise<void>;
  onDeleteCustomer: (id: string) => void;
  onBack: () => void;
}

export const MobileCalendar: React.FC<MobileCalendarProps> = ({
  customers, onEditCustomer, onUpdateCustomer, onDeleteCustomer, onBack
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 8)); // June 8th, 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-06-08');
  
  // Custom event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    constructionTime: '',
    notes: ''
  });

  // Filter customers for calendar (scheduled, deposit, construction status)
  // Also include custom events (id starts with EVENT-)
  const calendarItems = useMemo(() => {
    return customers.filter(c => {
      if (!c.expectedStartDate) return false;
      const isCustomEvent = c.id.startsWith('EVENT-');
      if (isCustomEvent) return true;
      return ['deposit', 'scheduled', 'construction'].includes(c.status);
    });
  }, [customers]);

  // Color helper based on main service type
  const getItemColors = (item: Customer) => {
    if (item.id.startsWith('EVENT-')) {
      return {
        bg: '#b5b0a5', // Muted sand grey primary
        lightBg: '#dad7cf', // Soft background
        text: '#3c3833',
        border: '#706b64',
        darkText: '#3c3833',
        badge: '局部'
      };
    }

    const service = item.mainService || '';
    if (service.includes('全車犀牛皮')) {
      return {
        bg: '#8ea391', // Muted sage green primary
        lightBg: '#ccd5cd', // Soft background
        text: '#2d3b2f',
        border: '#5a6e5d',
        darkText: '#2d3b2f',
        badge: '犀牛皮'
      };
    } else if (service.includes('全車改色膜') || service.includes('全車改色')) {
      return {
        bg: '#b89f9f', // Muted clay rose primary
        lightBg: '#dcd0d0', // Soft background
        text: '#4f3838',
        border: '#8c6b6b',
        darkText: '#4f3838',
        badge: '改色膜'
      };
    } else if (service.includes('迎風面')) {
      return {
        bg: '#95a7b8', // Muted steel blue primary
        lightBg: '#cbd3dc', // Soft background
        text: '#2e4053',
        border: '#566573',
        darkText: '#2e4053',
        badge: '迎風面'
      };
    } else if (service.includes('局部')) {
      return {
        bg: '#b5b0a5', // Muted sand grey primary
        lightBg: '#dad7cf', // Soft background
        text: '#3c3833',
        border: '#706b64',
        darkText: '#3c3833',
        badge: '局部'
      };
    } else {
      return {
        bg: '#b2a5ba', // Muted dusty plum primary
        lightBg: '#d8d2dc', // Soft background
        text: '#3c3147',
        border: '#6c5d7a',
        darkText: '#3c3147',
        badge: '其他'
      };
    }
  };

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // 6 weeks * 7 days grid for Month view
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    
    const calStart = new Date(firstDay);
    calStart.setDate(1 - startDayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(calStart);
      d.setDate(calStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Check which events are active on a given date (expectedStartDate <= date <= expectedEndDate)
  const getEventsForDate = (dateStr: string) => {
    return calendarItems.filter(item => {
      const start = item.expectedStartDate || '';
      const end = item.expectedEndDate || start;
      return start <= dateStr && end >= dateStr;
    });
  };

  // Active items for currently selected day
  const selectedDayEvents = useMemo(() => {
    return getEventsForDate(selectedDateStr);
  }, [selectedDateStr, calendarItems]);

  const todayDropOffCustomers = useMemo(() => {
    return calendarItems.filter(item => {
      if (item.id.startsWith('EVENT-')) return false;
      return item.expectedStartDate === selectedDateStr;
    });
  }, [selectedDateStr, calendarItems]);

  const todayDeliveryCustomers = useMemo(() => {
    return calendarItems.filter(item => {
      if (item.id.startsWith('EVENT-')) return false;
      return item.expectedEndDate === selectedDateStr;
    });
  }, [selectedDateStr, calendarItems]);

  const selectedDateLabel = useMemo(() => {
    const date = new Date(selectedDateStr);
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${months[date.getMonth()]}${date.getDate()}日 ${weekdays[date.getDay()]}`;
  }, [selectedDateStr]);

  const isToday = (date: Date) => {
    const today = new Date(2026, 5, 8); // Jun 8, 2026
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  // Submit custom event
  const handleSaveCustomEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title) return;

    const newEvent: Customer = {
      id: `EVENT-${Date.now()}`,
      name: eventForm.title,
      phone: '',
      plateNumber: '',
      status: 'scheduled',
      mainService: '局部施工',
      expectedStartDate: selectedDateStr,
      expectedEndDate: selectedDateStr,
      constructionTime: eventForm.constructionTime,
      notes: eventForm.notes,
      inCalendar: true
    };

    try {
      await onUpdateCustomer(newEvent);
      setIsEventModalOpen(false);
      setEventForm({ title: '', constructionTime: '', notes: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('確定要刪除此局部施工項目嗎？')) {
      try {
        await onDeleteCustomer(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ background: '#111827', minHeight: '100vh', padding: '16px 16px 80px', color: '#f3f4f6' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
        >
          ← 返回首頁
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#f3f4f6', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={22} color="var(--primary)" /> 施工排程行事曆
          </h2>
          <button
            onClick={() => setIsEventModalOpen(true)}
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={16} /> 新增局部施工
          </button>
        </div>
      </header>

      {/* Month Navigation Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </span>
        <div style={{ display: 'flex', gap: '4px', background: '#1f2937', padding: '2px', borderRadius: '8px' }}>
          <button onClick={handlePrevMonth} style={{ border: 'none', background: 'transparent', padding: '6px', color: '#9ca3af', cursor: 'pointer' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date(2026, 5, 8))} style={{ border: 'none', background: 'transparent', padding: '6px', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 'bold' }}>
            今
          </button>
          <button onClick={handleNextMonth} style={{ border: 'none', background: 'transparent', padding: '6px', color: '#9ca3af', cursor: 'pointer' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <div style={{ background: '#1f2937', borderRadius: '16px', border: '1px solid #374151', overflow: 'hidden', marginBottom: '20px', paddingBottom: '4px' }}>
        
        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', padding: '8px 0', borderBottom: '1px solid #374151', fontSize: '0.72rem', fontWeight: 'bold', color: '#9ca3af' }}>
          <div>週日</div>
          <div>週一</div>
          <div>週二</div>
          <div>週三</div>
          <div>週四</div>
          <div>週五</div>
          <div>週六</div>
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', gap: '1px', background: '#374151' }}>
          {monthDays.map((day, idx) => {
            const dayStr = formatDateString(day);
            const events = getEventsForDate(dayStr);
            const isSel = selectedDateStr === dayStr;
            const isCurr = day.getMonth() === currentDate.getMonth();
            const isTod = isToday(day);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDateStr(dayStr)}
                style={{
                  background: isSel ? '#374151' : '#1f2937',
                  minHeight: '62px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '4px 2px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {/* Date bubble */}
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  borderRadius: '50%',
                  background: isTod ? 'var(--primary)' : 'transparent',
                  color: isTod ? '#fff' : isCurr ? '#f3f4f6' : '#4b5563',
                  marginBottom: '4px'
                }}>
                  {day.getDate()}
                </span>

                {/* Event pills underneath (render up to 3 tiny lines) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', padding: '0 2px', overflow: 'hidden' }}>
                  {events.slice(0, 3).map(ev => {
                    const col = getItemColors(ev);
                    return (
                      <div 
                        key={ev.id} 
                        style={{ 
                          height: '4px', 
                          borderRadius: '2px', 
                          background: col.bg,
                          width: '100%'
                        }} 
                      />
                    );
                  })}
                  {events.length > 3 && (
                    <div style={{ fontSize: '0.55rem', color: '#9ca3af', textAlign: 'center', lineHeight: '1', fontWeight: 'bold' }}>
                      +{events.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date detail list section (day detail) */}
      <div style={{ background: '#1f2937', borderRadius: '16px', padding: '16px', border: '1px solid #374151' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '900', color: '#f3f4f6', borderBottom: '1px dashed #374151', paddingBottom: '8px' }}>
          {selectedDateLabel}
        </h3>

        {/* 現場留車車輛 */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🚗 現場留車 ({selectedDayEvents.filter(e => !e.id.startsWith('EVENT-') && (e.expectedStartDate || '') <= selectedDateStr && (e.expectedEndDate || e.expectedStartDate || '') >= selectedDateStr).length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(() => {
              const inShop = selectedDayEvents.filter(e => !e.id.startsWith('EVENT-') && (e.expectedStartDate || '') <= selectedDateStr && (e.expectedEndDate || e.expectedStartDate || '') >= selectedDateStr);
              return inShop.length > 0 ? inShop.map(item => {
                const colors = getItemColors(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => onEditCustomer(item)}
                    style={{
                      background: '#111827',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid #374151',
                      borderLeft: `4px solid ${colors.bg}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: colors.bg, color: '#fff', fontWeight: 'bold' }}>
                          {colors.badge}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: '#f3f4f6' }}>{item.name}</strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{item.plateNumber}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem', color: '#9ca3af' }}>
                      {item.model && <span>{item.model}</span>}
                      {item.filmColor && <span style={{ color: '#ef4444' }}>● {item.filmColor}</span>}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                      留車期間: {item.expectedStartDate} ~ {item.expectedEndDate || '未定'}
                    </div>
                  </div>
                );
              }) : (
                <div style={{ padding: '15px 0', textAlign: 'center', color: '#6b7280', fontSize: '0.75rem', background: '#111827', borderRadius: '12px', border: '1px dashed #374151' }}>無現場留車車輛</div>
              );
            })()}
          </div>
        </div>

        {/* 今日施工車輛 */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🛠️ 今日施工 ({selectedDayEvents.filter(e => {
              if (e.id.startsWith('EVENT-')) return e.expectedStartDate === selectedDateStr;
              return e.constructionStartDate && e.constructionStartDate <= selectedDateStr && (e.constructionEndDate || e.constructionStartDate) >= selectedDateStr;
            }).length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(() => {
              const constructing = selectedDayEvents.filter(e => {
                if (e.id.startsWith('EVENT-')) return e.expectedStartDate === selectedDateStr;
                return e.constructionStartDate && e.constructionStartDate <= selectedDateStr && (e.constructionEndDate || e.constructionStartDate) >= selectedDateStr;
              });
              return constructing.length > 0 ? constructing.map(item => {
                const colors = getItemColors(item);
                const isCustom = item.id.startsWith('EVENT-');
                const isSpanningTwoDays = !isCustom && 
                  item.constructionStartDate && 
                  item.constructionEndDate && 
                  item.constructionStartDate !== item.constructionEndDate;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isCustom && onEditCustomer(item)}
                    style={{
                      background: '#111827',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid #374151',
                      borderLeft: `4px solid ${isCustom ? '#0ea5e9' : colors.bg}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      position: 'relative'
                    }}
                  >
                    {isCustom && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(item.id); }}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: '#374151', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: isCustom ? '30px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: isCustom ? '#0ea5e9' : colors.bg, color: '#fff', fontWeight: 'bold' }}>
                          {isCustom ? '局部施工' : colors.badge}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: '#f3f4f6' }}>{item.name}</strong>
                        
                        {isSpanningTwoDays && (
                          <span style={{ fontSize: '0.6rem', padding: '1px 4px', background: '#fffbeb', color: '#b45309', borderRadius: '3px', border: '1px solid #fef3c7', fontWeight: 'bold' }}>
                            施工半台
                          </span>
                        )}
                      </div>
                      {!isCustom && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{item.plateNumber}</span>
                      )}
                    </div>

                    {!isCustom ? (
                      <>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem', color: '#9ca3af' }}>
                          {item.model && <span>{item.model}</span>}
                          {item.filmColor && <span style={{ color: '#ef4444' }}>● {item.filmColor}</span>}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 'bold' }}>
                          施工: {item.constructionStartDate} ~ {item.constructionEndDate || '未定'}
                        </div>
                      </>
                    ) : (
                      <>
                        {item.constructionTime && (
                          <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 'bold' }}>
                            留車時間: {item.constructionTime}
                          </div>
                        )}
                        {item.notes && (
                          <div style={{ fontSize: '0.78rem', color: '#9ca3af', background: '#1f2937', padding: '6px 10px', borderRadius: '6px', marginTop: '2px' }}>
                            {item.notes}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              }) : (
                <div style={{ padding: '15px 0', textAlign: 'center', color: '#6b7280', fontSize: '0.75rem', background: '#111827', borderRadius: '12px', border: '1px dashed #374151' }}>無施工進度</div>
              );
            })()}
          </div>
        </div>

        {/* 今日預計進場留車 */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📥 今日預計留車 ({todayDropOffCustomers.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayDropOffCustomers.length > 0 ? todayDropOffCustomers.map(item => {
              const colors = getItemColors(item);
              return (
                <div
                  key={item.id}
                  onClick={() => onEditCustomer(item)}
                  style={{
                    background: '#111827',
                    borderRadius: '12px',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderLeft: `4px solid ${colors.bg}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: colors.bg, color: '#fff', fontWeight: 'bold' }}>
                        {colors.badge}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: '#f3f4f6' }}>{item.name}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{item.plateNumber}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{item.model}</div>
                </div>
              );
            }) : (
              <div style={{ padding: '15px 0', textAlign: 'center', color: '#6b7280', fontSize: '0.75rem', background: '#111827', borderRadius: '12px', border: '1px dashed #374151' }}>無預計留車車輛</div>
            )}
          </div>
        </div>

        {/* 今日預計完工交車 */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📤 今日預計交車 ({todayDeliveryCustomers.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayDeliveryCustomers.length > 0 ? todayDeliveryCustomers.map(item => {
              const colors = getItemColors(item);
              return (
                <div
                  key={item.id}
                  onClick={() => onEditCustomer(item)}
                  style={{
                    background: '#111827',
                    borderRadius: '12px',
                    padding: '12px',
                    border: '1px solid #374151',
                    borderLeft: `4px solid ${colors.bg}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: colors.bg, color: '#fff', fontWeight: 'bold' }}>
                        {colors.badge}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: '#f3f4f6' }}>{item.name}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{item.plateNumber}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{item.model}</div>
                </div>
              );
            }) : (
              <div style={{ padding: '15px 0', textAlign: 'center', color: '#6b7280', fontSize: '0.75rem', background: '#111827', borderRadius: '12px', border: '1px dashed #374151' }}>無預計交車車輛</div>
            )}
          </div>
        </div>
      </div>

      {/* --- ADD CUSTOM EVENT MODAL --- */}
      {isEventModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#1f2937', width: '100%', maxWidth: '340px', borderRadius: '16px', border: '1px solid #374151', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: '#f3f4f6' }}>新增局部施工</h3>
              <button onClick={() => setIsEventModalOpen(false)} style={{ border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCustomEvent} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af' }}>車型 / 項目名稱*</label>
                <input 
                  type="text" 
                  required 
                  placeholder="例如: 特斯拉 Model Y 引擎蓋貼膜" 
                  value={eventForm.title} 
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '8px', background: '#111827', color: '#f3f4f6', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af' }}>留車時間 (幾點留車)</label>
                <input 
                  type="text" 
                  placeholder="例如: 14:00" 
                  value={eventForm.constructionTime} 
                  onChange={(e) => setEventForm(prev => ({ ...prev, constructionTime: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '8px', background: '#111827', color: '#f3f4f6', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af' }}>詳細備註</label>
                <textarea 
                  rows={3} 
                  placeholder="請填寫局部施工細節..." 
                  value={eventForm.notes} 
                  onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '8px', background: '#111827', color: '#f3f4f6', outline: 'none', fontFamily: 'inherit', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsEventModalOpen(false)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #374151', background: 'transparent', color: '#9ca3af', fontSize: '0.8rem', cursor: 'pointer' }}>取消</button>
                <button type="submit" style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
