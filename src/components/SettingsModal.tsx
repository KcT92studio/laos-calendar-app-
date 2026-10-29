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
  Circle 
} from 'lucide-react';
import { ColorTheme, ThemeId, Language, UserEvent } from '../types';
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
  const todayStr = '2026-10-20';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-serif-lao text-amber-200">
                {lang === 'lo' ? 'ຕັ້ງຄ່າ & ໂນ້ດບັນທຶກ' : 'Settings & Notes'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {lang === 'lo' ? 'ເລືອກພາສາ, ໂທນສີ ແລະ ບັນທຶກວຽກງານປະຕິທິນ' : 'Choose language, color theme, and daily task notes'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition border-b-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 text-amber-600" />
            <span>{t.tabSettings}</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition border-b-2 cursor-pointer relative ${
              activeTab === 'notes'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-base leading-none">📝</span>
            <span>{t.tabNotes}</span>
            {events.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-extrabold">
                {events.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'settings' ? (
            <>
              {/* Native PWA Install Banner */}
              {!isInstalled && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📲</span>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 font-serif-lao">
                        {lang === 'lo' ? 'ຕິດຕັ້ງແອັບລົງໜ້າຈໍໂທລະສັບ' : 'Install App to Home Screen'}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        {lang === 'lo' ? 'ໃຊ້ງານເຕັມຈໍແບບ Offline ບໍ່ຕ້ອງໃຊ້ອິນເຕີເນັດ' : 'Works completely offline as a standalone PWA'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => install()}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    {lang === 'lo' ? 'ຕິດຕັ້ງແອັບ' : 'Install App'}
                  </button>
                </div>
              )}

              {/* Section 1: Language Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm sm:text-base font-serif-lao text-slate-900">
                    {t.selectLanguage}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Lao Option */}
                  <button
                    onClick={() => onSelectLanguage('lo')}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between text-left ${
                      lang === 'lo'
                        ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl leading-none">🇱🇦</span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 font-serif-lao">
                          ພາສາລາວ
                        </div>
                        <span className="text-[10px] text-slate-400">Lao language</span>
                      </div>
                    </div>
                    {lang === 'lo' && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>

                  {/* English Option */}
                  <button
                    onClick={() => onSelectLanguage('en')}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between text-left ${
                      lang === 'en'
                        ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl leading-none">🇬🇧</span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">
                          English
                        </div>
                        <span className="text-[10px] text-slate-400">ພາສາອັງກິດ</span>
                      </div>
                    </div>
                    {lang === 'en' && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 2: Color Themes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-sm sm:text-base font-serif-lao text-slate-900">
                      {t.calendarThemes}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {LAO_COLOR_THEMES.map((theme) => {
                    const isSelected = theme.id === currentThemeId;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => onSelectTheme(theme.id)}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl shadow-xs flex items-center justify-center text-white flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                          >
                            {isSelected ? <Check className="w-4 h-4 drop-shadow" /> : null}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 font-serif-lao">
                                {lang === 'lo' ? theme.nameLao : theme.nameEn}
                              </h5>
                              {isSelected && (
                                <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                                  {t.activeTheme}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {theme.descriptionLao}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: theme.secondaryColor }}
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
            <div className="space-y-4">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-sm sm:text-base font-serif-lao text-slate-900">
                    {t.notesSectionTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {t.notesSectionSubtitle}
                  </p>
                </div>

                <button
                  onClick={() => onOpenAddEvent()}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addNewNote}</span>
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setNotesFilter('all')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer text-center ${
                    notesFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.filterAll} ({events.length})
                </button>
                <button
                  onClick={() => setNotesFilter('today')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer text-center ${
                    notesFilter === 'today'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.filterToday}
                </button>
                <button
                  onClick={() => setNotesFilter('upcoming')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer text-center ${
                    notesFilter === 'upcoming'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.filterUpcoming}
                </button>
              </div>

              {/* Notes List */}
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <div className="text-3xl">📝</div>
                  <p className="text-xs text-slate-500 font-medium">
                    {t.noNotesOverall}
                  </p>
                  <button
                    onClick={() => onOpenAddEvent()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline cursor-pointer pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addNewNote}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredEvents.map((ev) => {
                    const catInfo = CATEGORY_INFO[ev.category];
                    const isToday = ev.date === todayStr;

                    return (
                      <div
                        key={ev.id}
                        className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                          ev.completed
                            ? 'bg-slate-50/60 border-slate-200 opacity-75'
                            : 'bg-white border-slate-200 shadow-xs hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Complete Checkbox */}
                          <button
                            type="button"
                            onClick={() => onToggleEventComplete(ev.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer flex-shrink-0"
                            title={ev.completed ? t.pending : t.completed}
                          >
                            {ev.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          {/* Event info */}
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`font-bold text-xs sm:text-sm font-serif-lao text-slate-900 truncate ${
                                  ev.completed ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {ev.title}
                              </span>

                              {/* Category Badge */}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${catInfo.colorClass}`}>
                                {catInfo.icon} {lang === 'lo' ? catInfo.lo : catInfo.en}
                              </span>

                              {ev.isDaily ? (
                                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1">
                                  <span>🔄</span>
                                  <span>{t.everyDay}</span>
                                </span>
                              ) : isToday ? (
                                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-md">
                                  {t.today}
                                </span>
                              ) : null}
                            </div>

                            {/* Date, Time & Reminder Info */}
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <CalendarIcon className="w-3 h-3 text-slate-400" />
                                {ev.isDaily ? t.dailyBadge : formatLaoDateShort(ev.date, lang)}
                              </span>

                              {ev.time && (
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {ev.time}
                                </span>
                              )}

                              {ev.reminder && (
                                <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                                  <Bell className="w-3 h-3 text-amber-600" />
                                  <span>{t.reminderBadge}</span>
                                </span>
                              )}
                            </div>

                            {/* Note details */}
                            {ev.notes && (
                              <p className="text-xs text-slate-600 line-clamp-2 pt-0.5">
                                {ev.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => onEditEvent(ev)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title={t.editNote}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEvent(ev.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-400">
            {lang === 'lo' ? 'ຂໍ້ມູນບັນທຶກຈະຖືກເກັບໄວ້ໃນເຄື່ອງຂອງທ່ານ' : 'Notes are securely saved to your local device'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
