import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CalendarMonthView } from './components/CalendarMonthView';
import { SettingsModal } from './components/SettingsModal';
import { NoteEditorModal } from './components/NoteEditorModal';
import { LaoSinPattern } from './components/LaoSinPattern';
import { InAppBrowserGuideModal } from './components/InAppBrowserGuideModal';
import { usePWAInstall } from './utils/usePWAInstall';

import { ThemeId, ThemeMode, Language, UserEvent, LaoHoliday } from './types';
import { LAO_HOLIDAYS_2026 } from './data/laoHolidays';
import { getActiveThemeConfig, getThemeCssVariables } from './data/themes';
import { TRANSLATIONS } from './utils/translations';

const STORAGE_KEY_THEME = 'lao_calendar_theme_v2';
const STORAGE_KEY_MODE = 'lao_calendar_theme_mode_v2';
const STORAGE_KEY_LANG = 'lao_calendar_lang_v1';
const STORAGE_KEY_EVENTS = 'lao_calendar_events_v2';
const STORAGE_KEY_SELECTED_DATE = 'lao_calendar_selected_date_v1';
const STORAGE_KEY_VIEWED_MONTH = 'lao_calendar_viewed_month_v1';
const STORAGE_KEY_VIEWED_YEAR = 'lao_calendar_viewed_year_v1';

const DEFAULT_EVENTS: UserEvent[] = [
  {
    id: 'evt-01',
    title: 'ຕຽມເອກະສານ & ນັດໝາຍປະຊຸມ',
    date: '2026-10-20',
    time: '09:30',
    category: 'work',
    reminder: true,
    notes: 'ກວດເອກະສານໂຄງການກ່ອນເຂົ້າປະຊຸມ',
    completed: false,
    createdAt: '2026-10-20T08:00:00Z',
  },
  {
    id: 'evt-02',
    title: 'ຕຽມດອກໄມ້ & ຂັນໝາກເບັງ ບຸນອອກພັນສາ',
    date: '2026-10-25',
    time: '06:00',
    category: 'merit',
    reminder: true,
    notes: 'ໄປຕັກບາດເທໂວ ແລະ ໄຫຼເຮືອໄຟຕາມແຄມຂອງ',
    completed: false,
    createdAt: '2026-10-20T08:00:00Z',
  },
  {
    id: 'evt-03',
    title: 'ຊົມການແຂ່ງຂັນຊ່ວງເຮືອທ່າວັດຈັນ',
    date: '2026-10-26',
    time: '13:00',
    category: 'travel',
    reminder: true,
    notes: 'ໄປຊົມ ແລະ ເຊຍເຮືອຊ່ວງຮ່ວມກັບໝູ່ເພື່ອນ',
    completed: false,
    createdAt: '2026-10-20T08:00:00Z',
  },
];

// Helper to extract local date values dynamically from real system time
export const getTodayDateParts = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { year, month, day, dateStr };
};

const getInitialSampleEvents = (dateStr: string): UserEvent[] => [
  {
    id: 'evt-01',
    title: 'ກວດສອບວຽກປະຈຳວັນ',
    date: dateStr,
    time: '09:00',
    category: 'work',
    reminder: true,
    notes: 'ກວດສອບຕາຕະລາງ ແລະ ເອກະສານສຳຄັນ',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  const todayParts = useMemo(() => getTodayDateParts(), []);

  // Selected date (Default: localStorage value or dynamically set to today's date string, e.g. 2026-10-29)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SELECTED_DATE);
      if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) {
        return saved;
      }
    } catch {}
    return todayParts.dateStr;
  });

  // Month and Year state (Default: localStorage or dynamically set to current year and month)
  const [currentYear, setCurrentYear] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VIEWED_YEAR);
      if (saved) {
        const y = parseInt(saved, 10);
        if (!isNaN(y)) return y;
      }
    } catch {}
    return todayParts.year;
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VIEWED_MONTH);
      if (saved !== null) {
        const m = parseInt(saved, 10);
        if (!isNaN(m) && m >= 0 && m <= 11) return m;
      }
    } catch {}
    return todayParts.month;
  });

  // Holidays state dynamically loaded from ./holidays.json (easy to edit every year)
  const [holidays, setHolidays] = useState<LaoHoliday[]>(LAO_HOLIDAYS_2026);

  // Language state (Default: 'lo' Lao, with toggle to 'en' English)
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG) as Language;
      return saved === 'en' ? 'en' : 'lo';
    } catch {
      return 'lo';
    }
  });

  // Theme selection state (Default: 'champa_gold')
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME) as ThemeId;
      return saved || 'champa_gold';
    } catch {
      return 'champa_gold';
    }
  });

  // Display Mode state ('light' | 'dark' | 'system')
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode;
      return saved || 'system';
    } catch {
      return 'system';
    }
  });

  // System dark preference detection
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Effective dark mode status
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);

  // Active theme configuration & CSS variables
  const currentTheme = getActiveThemeConfig(currentThemeId, isDark);
  const themeCssVariables = getThemeCssVariables(currentTheme.colors);
  const t = TRANSLATIONS[lang];

  // Calendar Notes / Reminders state
  const [events, setEvents] = useState<UserEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (saved) {
        return JSON.parse(saved);
      }
      return DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  });

  // Modals state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [noteEditorTargetDate, setNoteEditorTargetDate] = useState<string>(todayParts.dateStr);
  const [editingEvent, setEditingEvent] = useState<UserEvent | null>(null);

  // PWA & In-App Browser (Facebook/Messenger) install management
  const pwa = usePWAInstall();

  // Register Service Worker for Offline PWA Support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js', { scope: './' })
          .then((registration) => {
            console.log('Lao Calendar PWA Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.log('Service Worker registration note:', error);
          });
      });
    }
  }, []);

  // Fetch holidays from external ./holidays.json for easy annual customization
  useEffect(() => {
    fetch('./holidays.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data: LaoHoliday[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setHolidays(data);
        }
      })
      .catch((err) => {
        console.log('Using default holidays bundle (offline/local fallback):', err);
      });
  }, []);

  // Sync theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, currentThemeId);
    } catch (e) {
      console.error(e);
    }
  }, [currentThemeId]);

  // Sync mode to localStorage and html root
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODE, themeMode);
    } catch (e) {
      console.error(e);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      document.body.style.backgroundColor = currentTheme.colors.pageBg;
    }
  }, [themeMode, isDark, currentTheme.colors.pageBg]);

  // Sync language
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {
      console.error(e);
    }
  }, [lang]);

  // Sync events
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error(e);
    }
  }, [events]);

  // Sync selectedDate to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SELECTED_DATE, selectedDate);
    } catch (e) {
      console.error(e);
    }
  }, [selectedDate]);

  // Sync viewed year and month to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VIEWED_YEAR, String(currentYear));
      localStorage.setItem(STORAGE_KEY_VIEWED_MONTH, String(currentMonth));
    } catch (e) {
      console.error(e);
    }
  }, [currentYear, currentMonth]);

  // Note actions
  const handleOpenAddEvent = (targetDate?: string) => {
    setEditingEvent(null);
    setNoteEditorTargetDate(targetDate || selectedDate || todayParts.dateStr);
    setIsNoteEditorOpen(true);
  };

  const handleEditEvent = (event: UserEvent) => {
    setEditingEvent(event);
    setNoteEditorTargetDate(event.date);
    setIsNoteEditorOpen(true);
  };

  const handleGoToToday = () => {
    const today = getTodayDateParts();
    setCurrentYear(today.year);
    setCurrentMonth(today.month);
    setSelectedDate(today.dateStr);
  };

  const handleSaveEvent = (eventData: Omit<UserEvent, 'id' | 'createdAt'> & { id?: string }) => {
    if (eventData.id) {
      // Edit existing event
      setEvents((prev) =>
        prev.map((item) =>
          item.id === eventData.id
            ? {
                ...item,
                ...eventData,
              }
            : item
        )
      );
    } else {
      // Create new event
      const newEvent: UserEvent = {
        ...eventData,
        id: `evt-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [newEvent, ...prev]);
    }
  };

  const handleToggleEventComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleMode = () => {
    // If currently dark, flip to light; if light, flip to dark
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-['Phetsarath',sans-serif] transition-colors duration-300 w-full max-w-full overflow-x-hidden relative"
      style={{
        ...themeCssVariables as React.CSSProperties,
        backgroundColor: 'var(--app-bg)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Traditional Lao Sin Woven Textile Pattern Background (4-8% opacity, offline SVG) */}
      <LaoSinPattern />

      {/* Facebook / In-App Browser Quick-Jump Banner */}
      {pwa.isInAppBrowser && !pwa.isInstalled && (
        <div 
          className="bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 text-white px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-md relative z-30"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base shrink-0">📲</span>
            <span className="font-serif-lao font-bold truncate text-[11px] sm:text-xs">
              {lang === 'lo'
                ? 'ກຳລັງເປີດໃນ Facebook: ຕິດຕັ້ງແອັບລົງໜ້າຈໍໂທລະສັບ'
                : 'Opened in Facebook: Install App'}
            </span>
          </div>
          <button
            onClick={() => {
              if (pwa.isAndroid) {
                pwa.openInExternalBrowser();
              } else {
                pwa.setShowInAppGuide(true);
              }
            }}
            className="px-2.5 py-1 rounded-full bg-white text-slate-950 font-black text-[10px] sm:text-xs hover:bg-amber-100 active:scale-95 transition shadow-xs shrink-0 cursor-pointer"
          >
            {pwa.isAndroid
              ? (lang === 'lo' ? 'ເປີດໃນ Chrome ທັນທີ 🚀' : 'Open in Chrome')
              : (lang === 'lo' ? 'ວິທີຕິດຕັ້ງ 💡' : 'How to Install')}
          </button>
        </div>
      )}

      {/* Clean Minimal Header with PWA Install Button, ☀️/🌙 Mode Toggle, Settings and Add Note */}
      <Header
        currentTheme={currentTheme}
        lang={lang}
        notesCount={events.length}
        isDark={isDark}
        onToggleMode={handleToggleMode}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAddNote={() => handleOpenAddEvent(selectedDate)}
        onQuickSelectTheme={(newThemeId) => setCurrentThemeId(newThemeId)}
      />

      {/* Main Calendar & Inline Details */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-2.5 sm:px-4 py-3 sm:py-4 overflow-x-hidden relative z-1">
        <CalendarMonthView
          currentYear={currentYear}
          currentMonth={currentMonth}
          onChangeMonth={(m, y) => {
            setCurrentMonth(m);
            setCurrentYear(y);
          }}
          selectedDate={selectedDate}
          onSelectDate={(dateStr) => setSelectedDate(dateStr)}
          todayDateStr={todayParts.dateStr}
          onGoToToday={handleGoToToday}
          holidays={holidays}
          currentTheme={currentTheme}
          lang={lang}
          events={events}
          onOpenAddEvent={handleOpenAddEvent}
          onToggleEventComplete={handleToggleEventComplete}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleEditEvent}
        />
      </main>

      {/* Unified Settings & Notes Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        lang={lang}
        onSelectLanguage={(newLang) => setLang(newLang)}
        currentThemeId={currentThemeId}
        onSelectTheme={(newThemeId) => setCurrentThemeId(newThemeId)}
        themeMode={themeMode}
        onSelectThemeMode={(newMode) => setThemeMode(newMode)}
        isDark={isDark}
        events={events}
        onToggleEventComplete={handleToggleEventComplete}
        onDeleteEvent={handleDeleteEvent}
        onOpenAddEvent={handleOpenAddEvent}
        onEditEvent={handleEditEvent}
      />

      {/* Add / Edit Note Modal */}
      <NoteEditorModal
        isOpen={isNoteEditorOpen}
        onClose={() => {
          setIsNoteEditorOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        initialDate={noteEditorTargetDate}
        initialEvent={editingEvent}
        lang={lang}
      />

      {/* In-App Browser (Facebook/Messenger) Installation Guide Modal */}
      <InAppBrowserGuideModal
        isOpen={pwa.showInAppGuide}
        onClose={() => pwa.setShowInAppGuide(false)}
        isAndroid={pwa.isAndroid}
        isIOS={pwa.isIOS}
        inAppBrowserType={pwa.inAppBrowserType}
        onOpenChrome={pwa.openInExternalBrowser}
        lang={lang}
      />

      {/* Simple Footer */}
      <footer 
        className="text-center py-4 text-xs border-t w-full overflow-hidden relative z-1 transition-colors duration-300"
        style={{
          borderColor: 'var(--card-border)',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--card-subtle-bg)'
        }}
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px]">
          <span>🌸 {t.appTitle} • {t.buddhistYearPrefix} 2569 / 2026</span>
          <span>{lang === 'lo' ? 'ເລື່ອນຊ້າຍ-ຂວາເພື່ອປ່ຽນເດືອນ' : 'Swipe left/right to change month'}</span>
        </div>
      </footer>
    </div>
  );
}
