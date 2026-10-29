import React from 'react';
import { Settings, Plus, Download, Sun, Moon } from 'lucide-react';
import { ActiveThemeConfig, ThemeId, Language } from '../types';
import { LAO_COLOR_THEMES } from '../data/themes';
import { TRANSLATIONS } from '../utils/translations';
import { usePWAInstall } from '../utils/usePWAInstall';

interface HeaderProps {
  currentTheme: ActiveThemeConfig;
  lang: Language;
  notesCount: number;
  isDark: boolean;
  onToggleMode: () => void;
  onOpenSettings: () => void;
  onOpenAddNote: () => void;
  onQuickSelectTheme: (themeId: ThemeId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  lang,
  notesCount,
  isDark,
  onToggleMode,
  onOpenSettings,
  onOpenAddNote,
  onQuickSelectTheme,
}) => {
  const t = TRANSLATIONS[lang];
  const { isInstalled, install } = usePWAInstall();

  return (
    <header className={`bg-gradient-to-r ${currentTheme.headerGradient} text-white shadow-md border-b-2 ${currentTheme.headerBorder} transition-all duration-300 w-full max-w-full overflow-hidden relative z-10`}>
      <div className={`h-1 w-full bg-gradient-to-r ${currentTheme.accentBarGradient}`}></div>

      <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 min-w-0 w-full">
        {/* Simple Brand Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 max-w-[50%] sm:max-w-none">
          <span className="text-xl sm:text-2xl leading-none shrink-0 drop-shadow-xs">🌸</span>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg md:text-xl font-bold font-serif-lao text-amber-100 leading-tight truncate">
              {t.appTitle}
            </h1>
            <span className="text-[10px] text-slate-300 hidden sm:block truncate opacity-90">
              {t.appSubtitle}
            </span>
          </div>
        </div>

        {/* Header Actions: Native PWA Install Button + Mode Toggle (☀️/🌙) + Quick Note + Settings */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* PWA Install Button using beforeinstallprompt (Compact on mobile) */}
          {!isInstalled && (
            <button
              onClick={() => install()}
              className="px-2 sm:px-2.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition cursor-pointer shadow-xs border border-emerald-300/40 shrink-0"
              title={lang === 'lo' ? 'ຕິດຕັ້ງແອັບລົງໂທລະສັບ (PWA)' : 'Install App to Home Screen'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px] font-serif-lao">
                {lang === 'lo' ? 'ຕິດຕັ້ງ' : 'Install'}
              </span>
              <span className="text-[10px] font-serif-lao hidden sm:inline">
                {lang === 'lo' ? 'ແອັບ' : 'App'}
              </span>
            </button>
          )}

          {/* Dark / Light Mode Toggle Button (☀️/🌙) */}
          <button
            onClick={onToggleMode}
            className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-amber-300 flex items-center justify-center transition cursor-pointer border border-white/20 shrink-0"
            title={t.toggleDarkMode}
            aria-label={t.toggleDarkMode}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-amber-100 animate-in spin-in-180 duration-200" />
            )}
          </button>

          {/* Quick Add Note Button */}
          <button
            onClick={onOpenAddNote}
            className="px-2 sm:px-2.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs shrink-0"
            title={t.addNewNote}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-serif-lao hidden md:inline">{t.notes}</span>
            {notesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[9px] flex items-center justify-center font-extrabold">
                {notesCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="px-2 sm:px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white font-medium text-xs flex items-center gap-1 transition cursor-pointer border border-white/20 shrink-0"
            title={t.settings}
          >
            <Settings className="w-3.5 h-3.5 text-amber-200" />
            <span className="text-[11px] font-semibold hidden md:inline">{t.settings}</span>
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
                    ? 'scale-125 ring-2 ring-white shadow-xs'
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
