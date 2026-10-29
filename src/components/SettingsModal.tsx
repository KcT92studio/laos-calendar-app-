import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Palette, 
  Globe, 
  Check, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle,
  Sun,
  Moon,
  Laptop,
  Download
} from 'lucide-react';
import { ThemeId, ThemeMode, Language, UserEvent } from '../types';
import { LAO_COLOR_THEMES } from '../data/themes';
import { TRANSLATIONS, CATEGORY_INFO } from '../utils/translations';
import { formatLaoDateShort } from '../utils/formatters';
import { usePWAInstall } from '../utils/usePWAInstall';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectLanguage: (newLang: Language) => void;
  currentThemeId: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  themeMode: ThemeMode;
  onSelectThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  events: UserEvent[];
  onToggleEventComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onOpenAddEvent: (date?: string) => void;
  onEditEvent: (event: UserEvent) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectLanguage,
  currentThemeId,
  onSelectTheme,
  themeMode,
  onSelectThemeMode,
  isDark,
  events,
  onToggleEventComplete,
  onDeleteEvent,
  onOpenAddEvent,
  onEditEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'notes'>('settings');
  const [notesFilter, setNotesFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  const { isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Filter notes
  const filteredEvents = events.filter((ev) => {
    if (notesFilter === 'today') {
      return ev.date === todayStr || ev.isDaily;
    }
    if (notesFilter === 'upcoming') {
      return ev.date >= todayStr || ev.isDaily;
    }
    return true;
  }).sort((a, b) => {
    if (a.isDaily && !b.isDaily) return -1;
    if (!a.isDaily && b.isDaily) return 1;
    return a.date.localeCompare(b.date);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] border transition-colors"
        style={{ 
          backgroundColor: 'var(--card-bg)', 
          borderColor: 'var(--card-border)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Compact Header */}
        <div className="bg-slate-900 text-white px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0 border-b border-slate-800 relative">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base font-serif-lao text-amber-200 leading-tight truncate">
                {lang === 'lo' ? 'ຕັ້ງຄ່າ & ໂນ້ດບັນທຶກ' : 'Settings & Notes'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                {lang === 'lo' ? 'ເລືອກພາສາ, ໂໝດມືດ/ສະຫວ່າງ, ໂທນສີ ແລະ ບັນທຶກ' : 'Language, themes, mode, and notes'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
            title={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Segmented Pill Tab Switcher */}
        <div 
          className="p-1.5 sm:p-2 border-b flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--card-subtle-bg)', 
            borderColor: 'var(--card-border)' 
          }}
        >
          <div 
            className="grid grid-cols-2 p-1 rounded-xl border gap-1"
            style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'shadow-xs text-white'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeTab === 'settings' ? 'var(--btn-primary-bg)' : 'transparent',
                color: activeTab === 'settings' ? 'var(--btn-primary-text)' : 'var(--text-secondary)'
              }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.tabSettings}</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'notes'
                  ? 'shadow-xs text-white'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeTab === 'notes' ? 'var(--btn-primary-bg)' : 'transparent',
                color: activeTab === 'notes' ? 'var(--btn-primary-text)' : 'var(--text-secondary)'
              }}
            >
              <span className="text-sm leading-none">📝</span>
              <span>{t.tabNotes}</span>
              {events.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black">
                  {events.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3.5">
          {activeTab === 'settings' ? (
            <>
              {/* Native PWA Install Banner (Compact) */}
              {!isInstalled && (
                <div 
                  className="p-2.5 rounded-xl border flex items-center justify-between gap-2 transition"
                  style={{
                    backgroundColor: 'var(--card-subtle-bg)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">📲</span>
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs font-serif-lao leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                        {lang === 'lo' ? 'ຕິດຕັ້ງແອັບລົງໜ້າຈໍໂທລະສັບ (PWA)' : 'Install App to Home Screen'}
                      </h5>
                      <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                        {lang === 'lo' ? 'ໃຊ້ງານເຕັມຈໍແບບ Offline ບໍ່ໃຊ້ອິນເຕີເນັດ' : 'Works completely offline'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => install()}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1 active:scale-95"
                  >
                    <Download className="w-3 h-3" />
                    <span>{lang === 'lo' ? 'ຕິດຕັ້ງແອັບ' : 'Install'}</span>
                  </button>
                </div>
              )}

              {/* Section 1: Display Mode (Compact 3-segment row) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5">
                    {isDark ? (
                      <Moon className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <h4 className="font-bold text-xs sm:text-sm font-serif-lao" style={{ color: 'var(--text-primary)' }}>
                      {t.themeModeTitle}
                    </h4>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {t.themeModeSubtitle}
                  </span>
                </div>

                <div 
                  className="grid grid-cols-3 p-1 rounded-xl border gap-1"
                  style={{
                    backgroundColor: 'var(--card-subtle-bg)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  {/* Light */}
                  <button
                    onClick={() => onSelectThemeMode('light')}
                    className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                      themeMode === 'light'
                        ? 'shadow-xs border'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: themeMode === 'light' ? 'var(--card-bg)' : 'transparent',
                      borderColor: themeMode === 'light' ? 'var(--accent-primary)' : 'transparent',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.lightMode}</span>
                    {themeMode === 'light' && <span className="text-amber-500 text-[10px]">✓</span>}
                  </button>

                  {/* Dark */}
                  <button
                    onClick={() => onSelectThemeMode('dark')}
                    className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                      themeMode === 'dark'
                        ? 'shadow-xs border'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: themeMode === 'dark' ? 'var(--card-bg)' : 'transparent',
                      borderColor: themeMode === 'dark' ? 'var(--accent-primary)' : 'transparent',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.darkMode}</span>
                    {themeMode === 'dark' && <span className="text-amber-400 text-[10px]">✓</span>}
                  </button>

                  {/* System */}
                  <button
                    onClick={() => onSelectThemeMode('system')}
                    className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                      themeMode === 'system'
                        ? 'shadow-xs border'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: themeMode === 'system' ? 'var(--card-bg)' : 'transparent',
                      borderColor: themeMode === 'system' ? 'var(--accent-primary)' : 'transparent',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.systemMode}</span>
                    {themeMode === 'system' && <span className="text-amber-500 text-[10px]">✓</span>}
                  </button>
                </div>
              </div>

              {/* Section 2: Language Selection (Compact 2-col) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 pb-1">
                  <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-bold text-xs sm:text-sm font-serif-lao" style={{ color: 'var(--text-primary)' }}>
                    {t.selectLanguage}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Lao */}
                  <button
                    onClick={() => onSelectLanguage('lo')}
                    className={`p-2.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-between text-left ${
                      lang === 'lo'
                        ? 'border-amber-500 shadow-xs'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: lang === 'lo' ? 'var(--card-subtle-bg)' : 'var(--card-bg)',
                      borderColor: lang === 'lo' ? 'var(--accent-primary)' : 'var(--card-border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">🇱🇦</span>
                      <div>
                        <div className="font-bold text-xs font-serif-lao">ພາສາລາວ</div>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Lao</span>
                      </div>
                    </div>
                    {lang === 'lo' && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>

                  {/* English */}
                  <button
                    onClick={() => onSelectLanguage('en')}
                    className={`p-2.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-between text-left ${
                      lang === 'en'
                        ? 'border-amber-500 shadow-xs'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: lang === 'en' ? 'var(--card-subtle-bg)' : 'var(--card-bg)',
                      borderColor: lang === 'en' ? 'var(--accent-primary)' : 'var(--card-border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">🇬🇧</span>
                      <div>
                        <div className="font-bold text-xs">English</div>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>ພາສາອັງກິດ</span>
                      </div>
                    </div>
                    {lang === 'en' && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 3: Color Themes (Compact 2-column Grid) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <h4 className="font-bold text-xs sm:text-sm font-serif-lao" style={{ color: 'var(--text-primary)' }}>
                      {t.calendarThemes}
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-500 font-bold">
                    {LAO_COLOR_THEMES.length} ໂທນສີ
                  </span>
                </div>

                {/* 2-Column Responsive Grid - Compact & Beautiful */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LAO_COLOR_THEMES.map((theme) => {
                    const isSelected = theme.id === currentThemeId;
                    const previewColors = isDark ? theme.dark : theme.light;

                    return (
                      <div
                        key={theme.id}
                        onClick={() => onSelectTheme(theme.id)}
                        className={`p-2.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                          isSelected
                            ? 'shadow-xs ring-1 ring-amber-400/50'
                            : 'opacity-85 hover:opacity-100 hover:border-slate-400'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--card-subtle-bg)' : 'var(--card-bg)',
                          borderColor: isSelected ? 'var(--accent-primary)' : 'var(--card-border)',
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Gradient Swatch */}
                          <div
                            className="w-8 h-8 rounded-lg shadow-xs flex items-center justify-center text-white flex-shrink-0"
                            style={{ 
                              background: `linear-gradient(135deg, ${previewColors.primary}, ${previewColors.secondary})`,
                              border: `1px solid ${previewColors.secondary}50`
                            }}
                          >
                            {isSelected ? <Check className="w-4 h-4 drop-shadow stroke-[3]" /> : null}
                          </div>

                          <div className="min-w-0">
                            <h5 className="font-bold text-xs font-serif-lao leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                              {lang === 'lo' ? theme.nameLao : theme.nameEn}
                            </h5>
                            <span className="text-[9px] block truncate opacity-80" style={{ color: 'var(--text-muted)' }}>
                              {theme.id === 'thatluang_amber' ? '✨ ເອກະລັກມໍລະດົກລາວ' : theme.descriptionLao.slice(0, 32) + '...'}
                            </span>
                          </div>
                        </div>

                        {/* Theme dots */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span
                            className="w-3 h-3 rounded-full border border-white/60 shadow-xs"
                            style={{ backgroundColor: previewColors.primary }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-white/60 shadow-xs"
                            style={{ backgroundColor: previewColors.secondary }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Notes & Reminders Management */
            <div className="space-y-3">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm font-serif-lao" style={{ color: 'var(--text-primary)' }}>
                    {t.notesSectionTitle}
                  </h4>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {t.notesSectionSubtitle}
                  </p>
                </div>

                <button
                  onClick={() => onOpenAddEvent()}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1 self-start sm:self-auto active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addNewNote}</span>
                </button>
              </div>

              {/* Filter Tabs */}
              <div 
                className="flex items-center gap-1 p-1 rounded-xl text-xs border"
                style={{ 
                  backgroundColor: 'var(--card-subtle-bg)',
                  borderColor: 'var(--card-border)' 
                }}
              >
                <button
                  onClick={() => setNotesFilter('all')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition cursor-pointer text-center text-xs ${
                    notesFilter === 'all'
                      ? 'shadow-xs font-bold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: notesFilter === 'all' ? 'var(--card-bg)' : 'transparent',
                    color: 'var(--text-primary)'
                  }}
                >
                  {t.filterAll} ({events.length})
                </button>
                <button
                  onClick={() => setNotesFilter('today')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition cursor-pointer text-center text-xs ${
                    notesFilter === 'today'
                      ? 'shadow-xs font-bold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: notesFilter === 'today' ? 'var(--card-bg)' : 'transparent',
                    color: 'var(--text-primary)'
                  }}
                >
                  {t.filterToday}
                </button>
                <button
                  onClick={() => setNotesFilter('upcoming')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition cursor-pointer text-center text-xs ${
                    notesFilter === 'upcoming'
                      ? 'shadow-xs font-bold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: notesFilter === 'upcoming' ? 'var(--card-bg)' : 'transparent',
                    color: 'var(--text-primary)'
                  }}
                >
                  {t.filterUpcoming}
                </button>
              </div>

              {/* Notes List */}
              {filteredEvents.length === 0 ? (
                <div 
                  className="p-6 text-center rounded-xl border border-dashed space-y-2"
                  style={{ 
                    backgroundColor: 'var(--card-subtle-bg)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  <div className="text-2xl">📝</div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {t.noNotesOverall}
                  </p>
                  <button
                    onClick={() => onOpenAddEvent()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 hover:underline cursor-pointer pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addNewNote}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEvents.map((ev) => {
                    const catInfo = CATEGORY_INFO[ev.category];
                    const isToday = ev.date === todayStr;

                    return (
                      <div
                        key={ev.id}
                        className={`p-2.5 rounded-xl border transition flex items-start justify-between gap-2.5 ${
                          ev.completed
                            ? 'opacity-70'
                            : 'shadow-xs hover:border-amber-400'
                        }`}
                        style={{
                          backgroundColor: ev.completed ? 'var(--card-subtle-bg)' : 'var(--card-bg)',
                          borderColor: 'var(--card-border)',
                        }}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          {/* Complete Checkbox */}
                          <button
                            type="button"
                            onClick={() => onToggleEventComplete(ev.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-500 transition cursor-pointer flex-shrink-0"
                            title={ev.completed ? t.pending : t.completed}
                          >
                            {ev.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100/20" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Event info */}
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`font-bold text-xs font-serif-lao truncate ${
                                  ev.completed ? 'line-through opacity-60' : ''
                                }`}
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {ev.title}
                              </span>

                              {/* Category Badge */}
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full border font-medium ${catInfo.colorClass}`}>
                                {catInfo.icon} {lang === 'lo' ? catInfo.lo : catInfo.en}
                              </span>

                              {ev.isDaily ? (
                                <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                  <span>🔄</span>
                                  <span>{t.everyDay}</span>
                                </span>
                              ) : isToday ? (
                                <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-md">
                                  {t.today}
                                </span>
                              ) : null}
                            </div>

                            {/* Date, Time & Reminder Info */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                                <CalendarIcon className="w-3 h-3 text-amber-500" />
                                {ev.isDaily ? t.dailyBadge : formatLaoDateShort(ev.date, lang)}
                              </span>

                              {ev.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  {ev.time}
                                </span>
                              )}

                              {ev.reminder && (
                                <span className="flex items-center gap-1 text-amber-500 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded">
                                  <Bell className="w-3 h-3 text-amber-500" />
                                  <span>{t.reminderBadge}</span>
                                </span>
                              )}
                            </div>

                            {/* Note details */}
                            {ev.notes && (
                              <p className="text-[11px] line-clamp-1 pt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                {ev.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => onEditEvent(ev)}
                            className="p-1 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition cursor-pointer"
                            title={t.editNote}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEvent(ev.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition cursor-pointer"
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
          )}
        </div>

        {/* Compact Footer */}
        <div 
          className="px-3.5 sm:px-4 py-2.5 border-t flex items-center justify-between flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--card-subtle-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {lang === 'lo' ? 'ບັນທຶກໄວ້ໃນເຄື່ອງ • Offline PWA' : 'Saved locally • Offline PWA'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold hover:opacity-90 active:scale-95 transition cursor-pointer shadow-xs"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
