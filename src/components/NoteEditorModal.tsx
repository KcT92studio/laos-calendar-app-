import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Bell, Check, Tag } from 'lucide-react';
import { UserEvent, EventCategory, Language } from '../types';
import { TRANSLATIONS, CATEGORY_INFO } from '../utils/translations';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<UserEvent, 'id' | 'createdAt'> & { id?: string }) => void;
  initialDate?: string;
  initialEvent?: UserEvent | null;
  lang: Language;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialEvent,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const todayStr = '2026-10-20';

  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || initialDate || todayStr);
  const [isDaily, setIsDaily] = useState(initialEvent?.isDaily || false);
  const [time, setTime] = useState(initialEvent?.time || '');
  const [category, setCategory] = useState<EventCategory>(initialEvent?.category || 'work');
  const [reminder, setReminder] = useState(initialEvent?.reminder ?? true);
  const [notes, setNotes] = useState(initialEvent?.notes || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickDate = (targetDate: string) => {
    setIsDaily(false);
    setDate(targetDate);
  };

  const handleToggleDaily = () => {
    setIsDaily((prev) => !prev);
  };

  const tomorrowStr = (() => {
    const d = new Date(todayStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(lang === 'lo' ? 'ກະລຸນາປ້ອນຫົວຂໍ້ບັນທຶກ' : 'Please enter a title for the note');
      return;
    }

    if (reminder && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }

    onSave({
      id: initialEvent?.id,
      title: title.trim(),
      date,
      time: time || undefined,
      category,
      reminder,
      notes: notes.trim() || undefined,
      completed: initialEvent?.completed ?? false,
      isDaily,
    });

    onClose();
  };

  const categories: EventCategory[] = ['work', 'personal', 'merit', 'bill', 'birthday', 'travel'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 text-base">
              📝
            </span>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-serif-lao text-amber-200">
                {initialEvent ? t.editNote : t.addNewNote}
              </h3>
              <p className="text-[11px] text-slate-300">
                {t.notesSectionSubtitle}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-serif-lao">
              {t.noteTitleLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder={t.noteTitlePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-sm bg-slate-50/50"
              autoFocus
            />
          </div>

          {/* Date & Quick Date buttons (ມື້ນີ້, ມື້ອື່ນ, ທຸກມື້) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <label className="text-xs font-bold text-slate-700 font-serif-lao flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                {t.dateLabel}
              </label>

              <div className="flex items-center gap-1 sm:gap-1.5 text-xs">
                {/* ມື້ນີ້ */}
                <button
                  type="button"
                  onClick={() => handleQuickDate(todayStr)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    !isDaily && date === todayStr
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.today}
                </button>
                {/* ມື້ອື່ນ */}
                <button
                  type="button"
                  onClick={() => handleQuickDate(tomorrowStr)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    !isDaily && date === tomorrowStr
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.tomorrow}
                </button>
                {/* ທຸກມື້ (Every day) */}
                <button
                  type="button"
                  onClick={handleToggleDaily}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    isDaily
                      ? 'bg-amber-500 text-slate-950 font-bold ring-1 ring-amber-600'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                  title={lang === 'lo' ? 'ທຳເປັນປະຈຳທຸກໆມື້' : 'Repeat every single day'}
                >
                  <span>🔄</span>
                  <span>{t.everyDay}</span>
                </button>
              </div>
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setIsDaily(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                isDaily ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 focus:border-amber-500'
              }`}
              required
            />

            {/* Daily repeat active banner */}
            {isDaily && (
              <div className="mt-1.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center gap-1.5 text-xs text-amber-900 font-medium">
                <span className="text-sm">🔄</span>
                <span>
                  {t.repeatsDaily} ({lang === 'lo' ? 'ຈະສະແດງໃນທຸກໆມື້ຂອງປະຕິທິນ' : 'Will be displayed on all days of the calendar'})
                </span>
              </div>
            )}
          </div>

          {/* Time & Reminder Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block font-serif-lao flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {t.timeLabel}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={reminder}
                  onChange={(e) => setReminder(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <div className="flex items-center gap-1.5">
                  <Bell className={`w-3.5 h-3.5 ${reminder ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold text-slate-700 font-serif-lao">
                    {t.reminderLabel}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 font-serif-lao flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {t.categoryLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const info = CATEGORY_INFO[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2 rounded-xl text-xs font-medium border text-left flex items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-400'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span className="truncate">{lang === 'lo' ? info.lo : info.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-serif-lao">
              {t.detailsLabel}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.detailsPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-sm bg-slate-50/50 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
