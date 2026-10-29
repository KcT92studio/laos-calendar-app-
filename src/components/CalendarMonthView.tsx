import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Star, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Bell, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3 
} from 'lucide-react';
import { LaoHoliday, WanSinDay, ActiveThemeConfig, Language, UserEvent } from '../types';
import { 
  LAO_MONTHS, 
  LAO_DAYS_OF_WEEK, 
  getLaoHolidayForDate, 
  getWanSinForDate, 
  getAuspiciousDayInfo 
} from '../data/laoHolidays';
import { toBuddhistYear, formatLaoDateLong, formatLaoDateShort } from '../utils/formatters';
import { TRANSLATIONS, CATEGORY_INFO } from '../utils/translations';

interface CalendarMonthViewProps {
  currentYear: number;
  currentMonth: number; // 0-11
  onChangeMonth: (month: number, year: number) => void;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  holidays: LaoHoliday[];
  currentTheme: ActiveThemeConfig;
  lang: Language;
  events: UserEvent[];
  onOpenAddEvent: (date?: string) => void;
  onToggleEventComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: UserEvent) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentYear,
  currentMonth,
  onChangeMonth,
  selectedDate,
  onSelectDate,
  holidays = [],
  currentTheme,
  lang,
  events = [],
  onOpenAddEvent,
  onToggleEventComplete,
  onDeleteEvent,
  onEditEvent,
}) => {
  const t = TRANSLATIONS[lang];

  // Touch Swipe Gesture State (ເລື່ອນຊ້າຍ-ຂວາເພື່ອປ່ຽນເດືອນ)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const todayStr = '2026-10-20';

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onChangeMonth(11, currentYear - 1);
    } else {
      onChangeMonth(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onChangeMonth(0, currentYear + 1);
    } else {
      onChangeMonth(currentMonth + 1, currentYear);
    }
  };

  // Touch handlers for smooth left/right swipe
  const minSwipeDistance = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      handleNextMonth(); // Swiped left -> Next month
    } else if (distance < -minSwipeDistance) {
      handlePrevMonth(); // Swiped right -> Prev month
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const formatCellDate = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Pre-calculate note count map for fast cell lookups (including daily recurring notes)
  const dailyEventsCount = events.filter((ev) => ev.isDaily).length;
  const notesCountMap: Record<string, number> = {};
  events.forEach((ev) => {
    if (!ev.isDaily) {
      notesCountMap[ev.date] = (notesCountMap[ev.date] || 0) + 1;
    }
  });

  // Build grid cells
  const calendarCells = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = formatCellDate(prevYear, prevMonth, day);
    calendarCells.push({
      dateStr,
      day,
      isCurrentMonth: false,
      holiday: getLaoHolidayForDate(dateStr),
      wanSin: getWanSinForDate(dateStr),
      auspicious: getAuspiciousDayInfo(dateStr),
      notesCount: (notesCountMap[dateStr] || 0) + dailyEventsCount,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatCellDate(currentYear, currentMonth, day);
    const holiday = getLaoHolidayForDate(dateStr);
    const wanSin = getWanSinForDate(dateStr);
    const auspicious = getAuspiciousDayInfo(dateStr);
    calendarCells.push({
      dateStr,
      day,
      isCurrentMonth: true,
      holiday,
      wanSin,
      auspicious,
      notesCount: (notesCountMap[dateStr] || 0) + dailyEventsCount,
    });
  }

  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = formatCellDate(nextYear, nextMonth, day);
    calendarCells.push({
      dateStr,
      day,
      isCurrentMonth: false,
      holiday: getLaoHolidayForDate(dateStr),
      wanSin: getWanSinForDate(dateStr),
      auspicious: getAuspiciousDayInfo(dateStr),
      notesCount: (notesCountMap[dateStr] || 0) + dailyEventsCount,
    });
  }

  const getCompactLunarText = (day: number, month: number, wanSin?: WanSinDay): string => {
    if (wanSin) {
      if (wanSin.phase === 'waxing_15') return lang === 'lo' ? 'ເພັງ 15' : 'Full 15';
      if (wanSin.phase === 'waning_14_15') return lang === 'lo' ? 'ດັບ 15' : 'New 15';
      if (wanSin.phase === 'waxing_8') return lang === 'lo' ? 'ຂຶ້ນ 8' : 'Wax 8';
      if (wanSin.phase === 'waning_8') return lang === 'lo' ? 'ແຮມ 8' : 'Wan 8';
    }

    if (month === 9) {
      if (day <= 10) return `${day + 4}ຄ່ຳ`;
      if (day <= 25) return `${day - 10}ຄ່ຳ`;
      return `${day - 25}ຄ່ຳ`;
    } else if (month === 10) {
      if (day <= 9) return `${day + 6}ຄ່ຳ`;
      if (day <= 24) return `${day - 9}ຄ່ຳ`;
      return `${day - 24}ຄ່ຳ`;
    } else if (month === 11) {
      if (day <= 9) return `${day + 6}ຄ່ຳ`;
      if (day <= 24) return `${day - 9}ຄ່ຳ`;
      return `${day - 24}ຄ່ຳ`;
    }
    const cycle = ((day + month * 2) % 30) + 1;
    return cycle <= 15 ? `${cycle}ຄ່ຳ` : `${cycle - 15}ຄ່ຳ`;
  };

  // Active selected date details
  const selectedHoliday = getLaoHolidayForDate(selectedDate);
  const selectedWanSin = getWanSinForDate(selectedDate);
  const selectedAuspicious = getAuspiciousDayInfo(selectedDate);

  // Selected date's user notes (including daily recurring notes)
  const selectedDateEvents = events.filter((ev) => ev.date === selectedDate || ev.isDaily);

  // Lao holidays in currently viewed month (Only displayed if currentMonth has holidays)
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const currentMonthHolidays = holidays.filter((h) => h.date.startsWith(currentMonthPrefix));

  const monthObj = LAO_MONTHS[currentMonth];
  const displayMonthName = lang === 'lo' ? monthObj.nameLao : monthObj.nameEn;

  return (
    <div className="space-y-4 max-w-4xl mx-auto relative z-1">
      {/* Calendar Card Container */}
      <div 
        className="rounded-3xl shadow-sm border overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Simple Month Navigation Bar */}
        <div 
          className="p-3.5 border-b flex items-center justify-between transition-colors duration-300"
          style={{
            backgroundColor: 'var(--card-subtle-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-xl shadow-xs border hover:opacity-80 active:scale-95 flex items-center justify-center transition cursor-pointer"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)'
            }}
            title={t.prevMonth}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center select-none">
            <h2 
              className="text-lg sm:text-xl font-bold font-serif-lao leading-tight transition-colors duration-300"
              style={{ color: 'var(--text-primary)' }}
            >
              {displayMonthName} {currentYear}
            </h2>
            <p 
              className="text-[11px] font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {t.buddhistYearPrefix} {toBuddhistYear(currentYear)} • {monthObj.lunarName}
            </p>
          </div>

          <button
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-xl shadow-xs border hover:opacity-80 active:scale-95 flex items-center justify-center transition cursor-pointer"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)'
            }}
            title={t.nextMonth}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div 
          className="grid grid-cols-7 text-center border-b py-2 select-none transition-colors duration-300"
          style={{
            backgroundColor: 'var(--card-subtle-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          {LAO_DAYS_OF_WEEK.map((day) => (
            <div 
              key={day.dayIndex} 
              className={`${day.color} font-serif-lao font-bold`}
              style={{ fontSize: 'clamp(0.68rem, 2.4vw, 0.85rem)' }}
            >
              {lang === 'lo' ? day.shortLao : day.shortEn}
            </div>
          ))}
        </div>

        {/* Calendar 7-column Grid */}
        <div 
          className="grid grid-cols-7 gap-px w-full overflow-hidden transition-colors duration-300"
          style={{ backgroundColor: 'var(--card-border)' }}
        >
          {calendarCells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;
            const compactLunar = getCompactLunarText(cell.day, currentMonth, cell.wanSin);

            return (
              <div
                key={idx}
                onClick={() => onSelectDate(cell.dateStr)}
                className={`min-h-[56px] xs:min-h-[60px] sm:min-h-[72px] p-0.5 sm:p-1 transition-all cursor-pointer relative flex flex-col justify-between items-center select-none overflow-hidden ${
                  isSelected ? 'z-10' : ''
                }`}
                style={{
                  backgroundColor: !cell.isCurrentMonth
                    ? 'var(--card-subtle-bg)'
                    : isSelected
                    ? 'var(--card-subtle-bg)'
                    : 'var(--card-bg)',
                  boxShadow: isSelected ? 'inset 0 0 0 2.5px var(--accent-primary)' : undefined,
                  opacity: !cell.isCurrentMonth ? 0.45 : 1,
                }}
              >
                {/* 1. Top Corner Layer (Unobtrusive - leaves center wide open) */}
                <div className="w-full flex items-center justify-between pointer-events-none px-0.5 sm:px-1 h-3 sm:h-3.5 z-10">
                  {/* Left Corner: Moon phase dot & Note dot */}
                  <div className="flex items-center gap-0.5">
                    {cell.wanSin && (
                      <span
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full inline-flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: cell.wanSin.isMajor ? 'var(--wan-sin-color)' : 'var(--card-subtle-bg)',
                          color: cell.wanSin.isMajor ? 'var(--btn-primary-text)' : 'var(--wan-sin-color)',
                          border: `1px solid var(--wan-sin-color)`
                        }}
                        title={cell.wanSin.phaseNameLao}
                      >
                        <Moon className="w-1.5 h-1.5 fill-current" />
                      </span>
                    )}
                    {cell.notesCount > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-violet-500 ring-1 ring-violet-300 shrink-0"
                        title={`${cell.notesCount} ${lang === 'lo' ? 'ບັນທຶກ' : 'notes'}`}
                      />
                    )}
                  </div>

                  {/* Right Corner: Small holiday ★ indicator dot / badge */}
                  <div className="flex items-center justify-end">
                    {cell.holiday ? (
                      <span
                        className="text-[9px] sm:text-[11px] leading-none font-black"
                        style={{ color: 'var(--holiday-color)' }}
                        title={lang === 'lo' ? cell.holiday.nameLao : cell.holiday.nameEn}
                      >
                        ★
                      </span>
                    ) : cell.auspicious.rating === 'excellent' ? (
                      <span
                        className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'var(--accent-secondary)' }}
                        title={selectedAuspicious.ratingNameLao}
                      />
                    ) : null}
                  </div>
                </div>

                {/* 2. Center: Big Bold Day Number (1, 2, 3...) */}
                <div className="flex-1 flex items-center justify-center w-full my-auto">
                  <span
                    className={`font-black font-sans leading-none flex items-center justify-center transition-transform ${
                      isToday ? 'w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-xs' : ''
                    }`}
                    style={{
                      fontSize: 'clamp(1rem, 4.2vw, 1.4rem)',
                      backgroundColor: isToday ? 'var(--today-bg)' : 'transparent',
                      color: isToday
                        ? 'var(--today-text)'
                        : cell.holiday?.isOfficialDayOff && cell.isCurrentMonth
                        ? 'var(--holiday-color)'
                        : !cell.isCurrentMonth
                        ? 'var(--text-muted)'
                        : 'var(--text-primary)', // Crisp white in dark mode, dark slate in light mode
                    }}
                  >
                    {cell.day}
                  </span>
                </div>

                {/* 3. Bottom: Lunar waxing/waning text (4ຄ່ຳ, 5ຄ່ຳ, ເພັງ 15...) - small & muted */}
                <div className="w-full text-center px-0.5 pb-0.5 pointer-events-none truncate leading-none">
                  <span
                    className="font-medium tracking-tight truncate block"
                    style={{
                      fontSize: 'clamp(0.55rem, 1.95vw, 0.72rem)',
                      color: !cell.isCurrentMonth
                        ? 'var(--text-muted)'
                        : cell.wanSin
                        ? 'var(--wan-sin-color)'
                        : 'var(--text-muted)',
                      fontWeight: cell.wanSin ? 700 : 500,
                    }}
                  >
                    {compactLunar}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Swipe Hint */}
      <div 
        className="text-center text-[11px] font-medium"
        style={{ color: 'var(--text-muted)' }}
      >
        {t.swipeHint}
      </div>

      {/* Selected Day Details Card */}
      <div 
        className="rounded-3xl p-5 shadow-sm border space-y-4 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)'
        }}
      >
        {/* Selected Date Title */}
        <div 
          className="pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <div>
            <span 
              className="text-[11px] font-medium block"
              style={{ color: 'var(--text-muted)' }}
            >
              {t.dateDetails}
            </span>
            <h3 
              className="text-lg sm:text-xl font-bold font-serif-lao leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {formatLaoDateLong(selectedDate, lang)}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {selectedHoliday?.isOfficialDayOff && (
              <span 
                className="px-2.5 py-0.5 rounded-full font-bold border"
                style={{
                  backgroundColor: 'var(--holiday-bg)',
                  borderColor: 'var(--holiday-border)',
                  color: 'var(--holiday-color)',
                }}
              >
                🔴 {t.officialHoliday}
              </span>
            )}

            {selectedWanSin && (
              <span 
                className="px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--wan-sin-color)',
                  color: 'var(--btn-primary-text)',
                }}
              >
                <Moon className="w-3 h-3" />
                <span>{selectedWanSin.phaseNameLao}</span>
              </span>
            )}

            <span 
              className="px-2.5 py-0.5 rounded-full font-bold border"
              style={{
                backgroundColor: 'var(--card-subtle-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)'
              }}
            >
              {selectedAuspicious.ratingNameLao}
            </span>
          </div>
        </div>

        {/* 1. Daily Notes & Reminders Section (ບັນທຶກວຽກງານ & ແຈ້ງເຕືອນສຳລັບມື້ນີ້) */}
        <div 
          className="p-4 rounded-2xl border space-y-3 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--card-subtle-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <h4 
                className="font-bold text-sm sm:text-base font-serif-lao"
                style={{ color: 'var(--text-primary)' }}
              >
                {t.notesSectionTitle}
              </h4>
              {selectedDateEvents.length > 0 && (
                <span 
                  className="text-[10px] font-bold px-1.5 py-0.2 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--btn-primary-text)'
                  }}
                >
                  {selectedDateEvents.length}
                </span>
              )}
            </div>

            <button
              onClick={() => onOpenAddEvent(selectedDate)}
              className="px-2.5 py-1 rounded-xl active:scale-95 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs hover:opacity-90"
              style={{
                backgroundColor: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)'
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addNote}</span>
            </button>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div 
              className="p-3 text-center rounded-xl border border-dashed text-xs"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-muted)'
              }}
            >
              <span>{t.noNotesForDay}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((ev) => {
                const catInfo = CATEGORY_INFO[ev.category];

                return (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl border transition flex items-start justify-between gap-2.5 ${
                      ev.completed ? 'opacity-70' : 'shadow-xs'
                    }`}
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleEventComplete(ev.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-500 transition cursor-pointer flex-shrink-0"
                      >
                        {ev.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100/20" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`font-bold text-xs sm:text-sm font-serif-lao truncate ${
                              ev.completed ? 'line-through opacity-60' : ''
                            }`}
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {ev.title}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-md border font-medium ${catInfo.colorClass}`}>
                            {catInfo.icon} {lang === 'lo' ? catInfo.lo : catInfo.en}
                          </span>
                          {ev.isDaily && (
                            <span 
                              className="text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5"
                              style={{
                                backgroundColor: 'var(--accent-primary)',
                                color: 'var(--btn-primary-text)'
                              }}
                            >
                              <span>🔄</span>
                              <span>{t.everyDay}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {ev.time && (
                            <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                              <Clock className="w-2.5 h-2.5 text-amber-500" />
                              {ev.time}
                            </span>
                          )}
                          {ev.reminder && (
                            <span className="flex items-center gap-0.5 font-semibold px-1 py-0.2 rounded" style={{ backgroundColor: 'var(--card-subtle-bg)', color: 'var(--accent-primary)' }}>
                              <Bell className="w-2.5 h-2.5" />
                              <span>{t.reminderBadge}</span>
                            </span>
                          )}
                        </div>

                        {ev.notes && (
                          <p className="text-xs pt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {ev.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onEditEvent(ev)}
                        className="p-1 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded transition cursor-pointer"
                        title={t.editNote}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(ev.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition cursor-pointer"
                        title={t.deleteNote}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Holiday Details (If holiday) */}
        {selectedHoliday && (
          <div 
            className="p-4 rounded-2xl border space-y-2 transition-colors duration-300"
            style={{
              backgroundColor: 'var(--holiday-bg)',
              borderColor: 'var(--holiday-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h4 
                className="text-base font-bold font-serif-lao"
                style={{ color: 'var(--holiday-color)' }}
              >
                🔴 {lang === 'lo' ? selectedHoliday.nameLao : selectedHoliday.nameEn}
              </h4>
              <span 
                className="text-xs font-semibold opacity-90"
                style={{ color: 'var(--holiday-color)' }}
              >
                {lang === 'lo' ? selectedHoliday.nameEn : selectedHoliday.nameLao}
              </span>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {lang === 'lo' ? selectedHoliday.descriptionLao : selectedHoliday.descriptionEn}
            </p>

            {selectedHoliday.traditionsLao.length > 0 && (
              <div className="pt-2 border-t flex flex-wrap gap-1.5" style={{ borderColor: 'var(--holiday-border)' }}>
                {selectedHoliday.traditionsLao.map((tradition, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg text-xs font-medium border"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--holiday-border)',
                      color: 'var(--holiday-color)'
                    }}
                  >
                    ✨ {tradition}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Wan Sin Guidance (If Wan Sin) */}
        {selectedWanSin && (
          <div 
            className="p-4 rounded-2xl border space-y-2 transition-colors duration-300"
            style={{
              backgroundColor: 'var(--card-subtle-bg)',
              borderColor: 'var(--wan-sin-color)',
            }}
          >
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--wan-sin-color)' }}>
              <Moon className="w-4 h-4" />
              <span>{t.wanSin} ({selectedWanSin.phaseNameLao} • {selectedWanSin.lunarMonthLao})</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              <strong style={{ color: 'var(--wan-sin-color)' }}>{t.wanSinAdvice}</strong> {selectedWanSin.dharmaAdviceLao}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedWanSin.meritActivitiesLao.map((act, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 rounded text-xs font-medium border"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--wan-sin-color)'
                  }}
                >
                  🙏 {act}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4. Auspicious Day Details (ມື້ດີຍາມດີ) */}
        <div 
          className="p-4 rounded-2xl border text-xs sm:text-sm space-y-2 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--card-subtle-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
              <Star className="w-4 h-4 text-emerald-500" />
              <span>{t.auspiciousDay} {selectedAuspicious.ratingNameLao}</span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedAuspicious.elementLao}</span>
          </div>

          <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <div>
              <strong className="text-emerald-500">✅ {t.goodFor}</strong> {selectedAuspicious.suitableFor.join(', ')}
            </div>
            <div>
              <strong className="text-rose-500">⚠️ {t.cautionFor}</strong> {selectedAuspicious.avoidFor.join(', ')}
            </div>
            <div className="pt-1 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span><strong>{t.goodHours}</strong> {selectedAuspicious.goodHoursLao}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lao Holidays for Current Month Card - Only rendered if this month has holidays */}
      {currentMonthHolidays.length > 0 && (
        <div 
          className="rounded-3xl p-5 shadow-sm border space-y-3.5 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          <div 
            className="flex items-center justify-between pb-3 border-b"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <div className="flex items-center gap-2.5">
              <span 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border"
                style={{
                  backgroundColor: 'var(--holiday-bg)',
                  borderColor: 'var(--holiday-border)',
                  color: 'var(--holiday-color)',
                }}
              >
                🇱🇦
              </span>
              <div>
                <h4 
                  className="font-bold text-base sm:text-lg font-serif-lao leading-snug"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.monthHolidaysTitle} {displayMonthName}
                </h4>
                <p 
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.monthHolidaysSubtitle} {currentMonthHolidays.length} {t.importantDaysCount}
                </p>
              </div>
            </div>
            <span 
              className="text-xs font-bold px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: 'var(--holiday-bg)',
                borderColor: 'var(--holiday-border)',
                color: 'var(--holiday-color)',
              }}
            >
              {currentMonthHolidays.length} {lang === 'lo' ? 'ວັນ' : 'days'}
            </span>
          </div>

          <div className="space-y-2">
            {currentMonthHolidays.map((holiday) => {
              const isSelected = holiday.date === selectedDate;
              return (
                <div
                  key={holiday.id}
                  onClick={() => onSelectDate(holiday.date)}
                  className={`p-3.5 rounded-2xl transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
                    isSelected ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--card-subtle-bg)' : 'var(--card-bg)',
                    borderColor: isSelected ? 'var(--holiday-color)' : 'var(--card-border)',
                    boxShadow: isSelected ? `0 0 0 1px var(--holiday-color)` : undefined,
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        className="font-bold text-sm sm:text-base font-serif-lao"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {lang === 'lo' ? holiday.nameLao : holiday.nameEn}
                      </span>
                      {holiday.isOfficialDayOff && (
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--holiday-color)',
                            color: 'var(--btn-primary-text)'
                          }}
                        >
                          {t.officialHoliday}
                        </span>
                      )}
                    </div>
                    <div className="text-xs flex flex-wrap items-center gap-x-2 gap-y-0.5" style={{ color: 'var(--text-muted)' }}>
                      <span className="font-semibold" style={{ color: 'var(--holiday-color)' }}>
                        🗓️ {formatLaoDateShort(holiday.date, lang)}
                      </span>
                      {holiday.lunarInfoLao && (
                        <span>• {holiday.lunarInfoLao}</span>
                      )}
                    </div>
                    {(lang === 'lo' ? holiday.descriptionLao : holiday.descriptionEn) && (
                      <p className="text-xs line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                        {lang === 'lo' ? holiday.descriptionLao : holiday.descriptionEn}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 self-end sm:self-center">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1 transition shadow-xs"
                      style={{
                        backgroundColor: isSelected ? 'var(--holiday-color)' : 'var(--card-bg)',
                        color: isSelected ? 'var(--btn-primary-text)' : 'var(--text-primary)',
                        border: `1px solid var(--card-border)`
                      }}
                    >
                      {isSelected ? t.currentlyViewing : t.viewDetails}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
