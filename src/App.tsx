import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalendarMonthView } from './components/CalendarMonthView';
import { SettingsModal } from './components/SettingsModal';
import { NoteEditorModal } from './components/NoteEditorModal';

import { ThemeId, Language, UserEvent, LaoHoliday } from './types';
import { LAO_HOLIDAYS_2026 } from './data/laoHolidays';
import { getThemeById } from './data/themes';
import { TRANSLATIONS } from './utils/translations';

const STORAGE_KEY_THEME = 'lao_calendar_theme_v2';
const STORAGE_KEY_LANG = 'lao_calendar_lang_v1';
const STORAGE_KEY_EVENTS = 'lao_calendar_events_v2';

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

export default function App() {
  // Month and Year state (Default: October 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // October = index 9

  // Selected date (Default: Today 2026-10-20)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-20');

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

  // Theme selection state
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME) as ThemeId;
      return saved || 'champa_gold';
    } catch {
      return 'champa_gold';
    }
  });

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
  const [noteEditorTargetDate, setNoteEditorTargetDate] = useState<string>('2026-10-20');
  const [editingEvent, setEditingEvent] = useState<UserEvent | null>(null);

  // Active theme object
  const currentTheme = getThemeById(currentThemeId);
  const t = TRANSLATIONS[lang];

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

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, currentThemeId);
    } catch (e) {
      console.error(e);
    }
  }, [currentThemeId]);

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

  // Note actions
  const handleOpenAddEvent = (targetDate?: string) => {
    setEditingEvent(null);
    setNoteEditorTargetDate(targetDate || selectedDate || '2026-10-20');
    setIsNoteEditorOpen(true);
  };

  const handleEditEvent = (event: UserEvent) => {
    setEditingEvent(event);
    setNoteEditorTargetDate(event.date);
    setIsNoteEditorOpen(true);
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

  return (
    <div className={`min-h-screen ${currentTheme.pageBgClass} flex flex-col font-['Noto_Sans_Lao',sans-serif] transition-colors duration-300`}>
      {/* Clean Minimal Header with PWA Install Button, Settings and Add Note */}
      <Header
        currentTheme={currentTheme}
        lang={lang}
        notesCount={events.length}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAddNote={() => handleOpenAddEvent(selectedDate)}
        onQuickSelectTheme={(newThemeId) => setCurrentThemeId(newThemeId)}
      />

      {/* Main Calendar & Inline Details */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-4 py-4">
        <CalendarMonthView
          currentYear={currentYear}
          currentMonth={currentMonth}
          onChangeMonth={(m, y) => {
            setCurrentMonth(m);
            setCurrentYear(y);
          }}
          selectedDate={selectedDate}
          onSelectDate={(dateStr) => setSelectedDate(dateStr)}
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

      {/* Simple Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200/60">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-[11px]">
          <span>🌸 {t.appTitle} • {t.buddhistYearPrefix} 2569 / 2026</span>
          <span>{lang === 'lo' ? 'ເລື່ອນຊ້າຍ-ຂວາເພື່ອປ່ຽນເດືອນ' : 'Swipe left/right to change month'}</span>
        </div>
      </footer>
    </div>
  );
}
