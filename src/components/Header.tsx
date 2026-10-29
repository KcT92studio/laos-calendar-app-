import React from 'react';
import { Settings, Plus, Download } from 'lucide-react';
import { ColorTheme, ThemeId, Language } from '../types';
import { LAO_COLOR_THEMES } from '../data/themes';
import { TRANSLATIONS } from '../utils/translations';
import { usePWAInstall } from '../utils/usePWAInstall';

interface HeaderProps {
  currentTheme: ColorTheme;
  lang: Language;
  notesCount: number;
  onOpenSettings: () => void;
  onOpenAddNote: () => void;
  onQuickSelectTheme: (themeId: ThemeId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  lang,
  notesCount,
  onOpenSettings,
  onOpenAddNote,
  onQuickSelectTheme,
}) => {
  const t = TRANSLATIONS[lang];
  const { isInstalled, isInstallable, install } = usePWAInstall();

  return (
    <header className={`bg-gradient-to-r ${currentTheme.headerGradient} text-white shadow-md border-b-2 ${currentTheme.headerBorder} transition-all duration-300`}>
      <div className={`h-1 w-full bg-gradient-to-r ${currentTheme.accentBarGradient}`}></div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Simple Brand Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">🌸</span>
          <div>
            <h1 className="text-base sm:text-xl font-bold font-serif-lao text-amber-100 leading-tight">
              {t.appTitle}
            </h1>
            <span className="text-[10px] text-slate-300 block truncate max-w-[180px] xs:max-w-none">
              {t.appSubtitle}
            </span>
          </div>
        </div>

        {/* Header Actions: Native PWA Install Button + Quick Note + Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Button using beforeinstallprompt (Hides when already running standalone) */}
          {!isInstalled && (
            <button
              onClick={() => install()}
              className="px-2.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm border border-emerald-300/40"
              title={lang === 'lo' ? 'ຕິດຕັ້ງແອັບລົງໂທລະສັບ (PWA)' : 'Install App to Home Screen'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[11px] font-serif-lao">
                {lang === 'lo' ? 'ຕິດຕັ້ງແອັບ' : 'Install App'}
              </span>
            </button>
          )}

          {/* Quick Add Note Button */}
          <button
            onClick={onOpenAddNote}
            className="px-2.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
            title={t.addNewNote}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-serif-lao hidden xs:inline">{t.notes}</span>
            {notesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[9px] flex items-center justify-center font-extrabold">
                {notesCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer border border-white/20"
            title={t.settings}
          >
            <Settings className="w-3.5 h-3.5 text-amber-200" />
            <span className="text-[11px] font-semibold hidden sm:inline">{t.settings}</span>
            <span className="text-xs">{lang === 'lo' ? '🇱🇦' : '🇬🇧'}</span>
          </button>

          {/* Quick Theme Switcher Dots */}
          <div className="hidden md:flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full border border-white/15">
            {LAO_COLOR_THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => onQuickSelectTheme(th.id)}
                className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                  currentTheme.id === th.id
                    ? 'scale-125 ring-2 ring-white'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: th.primaryColor }}
                title={lang === 'lo' ? th.nameLao : th.nameEn}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
