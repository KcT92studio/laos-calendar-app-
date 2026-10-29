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
import { LaoHoliday, WanSinDay, ColorTheme, Language, UserEvent } from '../types';
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
  currentTheme: ColorTheme;
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
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Calendar Card Container */}
      <div 
        className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Simple Month Navigation Bar */}
        <div className="bg-slate-50/80 p-3.5 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title={t.prevMonth}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center select-none">
            <h2 className="text-lg sm:text-xl font-bold font-serif-lao text-slate-900 leading-tight">
              {displayMonthName} {currentYear}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {t.buddhistYearPrefix} {toBuddhistYear(currentYear)} • {monthObj.lunarName}
            </p>
          </div>

          <button
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title={t.nextMonth}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center bg-slate-50 border-b border-slate-200 text-xs font-bold py-2.5">
          {LAO_DAYS_OF_WEEK.map((day) => (
            <div key={day.dayIndex} className={`${day.color} font-serif-lao text-xs sm:text-sm`}>
              {lang === 'lo' ? day.shortLao : day.shortEn}
            </div>
          ))}
        </div>

        {/* Calendar 7-column Grid */}
        <div className="grid grid-cols-7 bg-slate-200 gap-px">
          {calendarCells.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;
            const compactLunar = getCompactLunarText(cell.day, currentMonth, cell.wanSin);

            return (
              <div
                key={idx}
                onClick={() => onSelectDate(cell.dateStr)}
                className={`min-h-[58px] sm:min-h-[72px] p-1 sm:p-1.5 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/80 text-slate-300'
                    : 'bg-white text-slate-800 hover:bg-amber-50/30'
                } ${
                  isSelected
                    ? 'ring-3 ring-inset ring-amber-500 bg-amber-50/70 z-10'
                    : ''
                }`}
              >
                {/* Date Number & Wan Sin Moon Icon */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-xs sm:text-sm font-extrabold rounded-full ${
                      isToday
                        ? 'bg-amber-600 text-white shadow-xs'
                        : cell.holiday?.isOfficialDayOff
                        ? 'bg-rose-100 text-rose-700 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {cell.wanSin && (
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                        cell.wanSin.isMajor
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                      title={cell.wanSin.phaseNameLao}
                    >
                      <Moon className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                </div>

                {/* Compact Lunar Day */}
                <div className="text-[9px] sm:text-[10px] text-center font-medium leading-none py-0.5 truncate">
                  {cell.wanSin ? (
                    <span className="text-amber-700 font-bold">{compactLunar}</span>
                  ) : (
                    <span className="text-slate-400">{compactLunar}</span>
                  )}
                </div>

                {/* Minimal Indicator Dots (Holidays, Auspicious, and User Notes) */}
                <div className="flex items-center justify-center gap-1 h-3.5">
                  {/* Holiday Indicator */}
                  {cell.holiday && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cell.holiday.isOfficialDayOff ? 'bg-rose-600' : 'bg-emerald-500'
                      }`}
                      title={lang === 'lo' ? cell.holiday.nameLao : cell.holiday.nameEn}
                    />
                  )}

                  {/* Auspicious Indicator */}
                  {(cell.auspicious.rating === 'excellent' || cell.auspicious.rating === 'good') && (
                    <span
                      className={`text-[9px] leading-none ${
                        cell.auspicious.rating === 'excellent' ? 'text-amber-500 font-bold' : 'text-emerald-500'
                      }`}
                    >
                      ★
                    </span>
                  )}

                  {/* User Note Indicator Dot / Pin */}
                  {cell.notesCount > 0 && (
                    <span
                      className="w-2 h-2 rounded-full bg-violet-600 ring-1 ring-violet-300"
                      title={`${cell.notesCount} ${lang === 'lo' ? 'ບັນທຶກ' : 'notes'}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Swipe Hint */}
      <div className="text-center text-[11px] text-slate-400 font-medium">
        {t.swipeHint}
      </div>

      {/* Selected Day Details Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        {/* Selected Date Title */}
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {t.dateDetails}
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-serif-lao text-slate-900 leading-tight">
              {formatLaoDateLong(selectedDate, lang)}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {selectedHoliday?.isOfficialDayOff && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                🔴 {t.officialHoliday}
              </span>
            )}

            {selectedWanSin && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center gap-1">
                <Moon className="w-3 h-3" />
                <span>{selectedWanSin.phaseNameLao}</span>
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              {selectedAuspicious.ratingNameLao}
            </span>
          </div>
        </div>

        {/* 1. Daily Notes & Reminders Section (ບັນທຶກວຽກງານ & ແຈ້ງເຕືອນສຳລັບມື້ນີ້) */}
        <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <h4 className="font-bold text-sm sm:text-base font-serif-lao text-slate-900">
                {t.notesSectionTitle}
              </h4>
              {selectedDateEvents.length > 0 && (
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                  {selectedDateEvents.length}
                </span>
              )}
            </div>

            <button
              onClick={() => onOpenAddEvent(selectedDate)}
              className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addNote}</span>
            </button>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="p-3 text-center bg-white/70 rounded-xl border border-dashed border-amber-200 text-xs text-slate-500">
              <span>{t.noNotesForDay}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((ev) => {
                const catInfo = CATEGORY_INFO[ev.category];

                return (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl border transition flex items-start justify-between gap-2.5 bg-white ${
                      ev.completed ? 'border-slate-200 opacity-70' : 'border-amber-200/90 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleEventComplete(ev.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer flex-shrink-0"
                      >
                        {ev.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`font-bold text-xs sm:text-sm font-serif-lao text-slate-900 truncate ${
                              ev.completed ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {ev.title}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-md border font-medium ${catInfo.colorClass}`}>
                            {catInfo.icon} {lang === 'lo' ? catInfo.lo : catInfo.en}
                          </span>
                          {ev.isDaily && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                              <span>🔄</span>
                              <span>{t.everyDay}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          {ev.time && (
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              <Clock className="w-2.5 h-2.5" />
                              {ev.time}
                            </span>
                          )}
                          {ev.reminder && (
                            <span className="flex items-center gap-0.5 text-amber-700 font-semibold bg-amber-100/70 px-1 py-0.2 rounded">
                              <Bell className="w-2.5 h-2.5 text-amber-600" />
                              <span>{t.reminderBadge}</span>
                            </span>
                          )}
                        </div>

                        {ev.notes && (
                          <p className="text-xs text-slate-600 pt-0.5">
                            {ev.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onEditEvent(ev)}
                        className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded transition cursor-pointer"
                        title={t.editNote}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(ev.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
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
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold font-serif-lao text-rose-950">
                🔴 {lang === 'lo' ? selectedHoliday.nameLao : selectedHoliday.nameEn}
              </h4>
              <span className="text-xs text-rose-800 font-semibold">
                {lang === 'lo' ? selectedHoliday.nameEn : selectedHoliday.nameLao}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {lang === 'lo' ? selectedHoliday.descriptionLao : selectedHoliday.descriptionEn}
            </p>

            {selectedHoliday.traditionsLao.length > 0 && (
              <div className="pt-2 border-t border-rose-200/60 flex flex-wrap gap-1.5">
                {selectedHoliday.traditionsLao.map((tradition, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-rose-200 text-rose-900 px-2 py-0.5 rounded-lg text-xs font-medium"
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
          <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 text-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Moon className="w-4 h-4 text-amber-600" />
              <span>{t.wanSin} ({selectedWanSin.phaseNameLao} • {selectedWanSin.lunarMonthLao})</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              <strong>{t.wanSinAdvice}</strong> {selectedWanSin.dharmaAdviceLao}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedWanSin.meritActivitiesLao.map((act, idx) => (
                <span key={idx} className="bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded text-xs font-medium">
                  🙏 {act}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4. Auspicious Day Details (ມື້ດີຍາມດີ) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Star className="w-4 h-4 text-emerald-600" />
              <span>{t.auspiciousDay} {selectedAuspicious.ratingNameLao}</span>
            </div>
            <span className="text-xs text-slate-500">{selectedAuspicious.elementLao}</span>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <div>
              <strong className="text-emerald-800">✅ {t.goodFor}</strong> {selectedAuspicious.suitableFor.join(', ')}
            </div>
            <div>
              <strong className="text-rose-800">⚠️ {t.cautionFor}</strong> {selectedAuspicious.avoidFor.join(', ')}
            </div>
            <div className="pt-1 text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span><strong>{t.goodHours}</strong> {selectedAuspicious.goodHoursLao}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lao Holidays for Current Month Card - Only rendered if this month has holidays */}
      {currentMonthHolidays.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold">
                🇱🇦
              </span>
              <div>
                <h4 className="font-bold text-base sm:text-lg font-serif-lao text-slate-900 leading-snug">
                  {t.monthHolidaysTitle} {displayMonthName}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {t.monthHolidaysSubtitle} {currentMonthHolidays.length} {t.importantDaysCount}
                </p>
              </div>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-full border border-rose-200">
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
                    isSelected
                      ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-200'
                      : 'bg-slate-50/70 hover:bg-rose-50/40 border-slate-200/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm sm:text-base font-serif-lao text-slate-900">
                        {lang === 'lo' ? holiday.nameLao : holiday.nameEn}
                      </span>
                      {holiday.isOfficialDayOff && (
                        <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                          {t.officialHoliday}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-semibold text-rose-800">
                        🗓️ {formatLaoDateShort(holiday.date, lang)}
                      </span>
                      {holiday.lunarInfoLao && (
                        <span>• {holiday.lunarInfoLao}</span>
                      )}
                    </div>
                    {(lang === 'lo' ? holiday.descriptionLao : holiday.descriptionEn) && (
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {lang === 'lo' ? holiday.descriptionLao : holiday.descriptionEn}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 self-end sm:self-center">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1 transition ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-rose-700'
                      }`}
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
