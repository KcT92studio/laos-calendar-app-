import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, MoreVertical, Share2, Smartphone } from 'lucide-react';

interface InAppBrowserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAndroid: boolean;
  isIOS: boolean;
  inAppBrowserType: string | null;
  onOpenChrome: () => void;
  lang: 'lo' | 'en';
}

export const InAppBrowserGuideModal: React.FC<InAppBrowserGuideModalProps> = ({
  isOpen,
  onClose,
  isAndroid,
  isIOS,
  inAppBrowserType,
  onOpenChrome,
  lang,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const appName = inAppBrowserType === 'facebook'
    ? 'Facebook'
    : inAppBrowserType === 'messenger'
    ? 'Messenger'
    : inAppBrowserType === 'instagram'
    ? 'Instagram'
    : inAppBrowserType === 'line'
    ? 'LINE'
    : 'In-App Browser';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-amber-500/40 animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 p-4 text-white flex items-center justify-between border-b border-amber-500/30 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif-lao text-amber-200 leading-tight">
                {lang === 'lo' ? `ວິທີຕິດຕັ້ງຈາກ ${appName}` : `Install from ${appName}`}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-300">
                {lang === 'lo' ? 'ຕິດຕັ້ງແອັບລົງໜ້າຈໍໂທລະສັບແບບງ່າຍໆ' : 'Open in native browser to install app'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Note explaining Facebook restrictions */}
          <div 
            className="p-3 rounded-2xl border text-xs space-y-1"
            style={{
              backgroundColor: 'var(--card-subtle-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <p className="font-bold text-amber-600 dark:text-amber-400 font-serif-lao">
              {lang === 'lo' ? `💡 ລະບົບ ${appName} ບໍ່ອະນຸຍາດໃຫ້ຕິດຕັ້ງໂດຍກົງໃນຕົວມັນ` : `💡 ${appName} restricts in-app installation`}
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {lang === 'lo'
                ? `ຕ້ອງເປີດຜ່ານ Google Chrome ຫຼື Safari ເພື່ອໃຫ້ແອັບຕິດຕັ້ງລົງໜ້າຈໍໂຮມໄດ້ຢ່າງສົມບູນ:`
                : `Please open in Chrome or Safari to install properly:`}
            </p>
          </div>

          {/* Quick 1-Click Action for Android */}
          {isAndroid && (
            <button
              onClick={onOpenChrome}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-98 border border-emerald-400/40"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="font-serif-lao">
                {lang === 'lo' ? 'ກົດບ່ອນນີ້: ເປີດໃນ Google Chrome ທັນທີ' : 'Open in Google Chrome'}
              </span>
            </button>
          )}

          {/* Step-by-Step Visual Instructions for iOS or Fallback */}
          <div className="space-y-2.5 text-xs">
            <div className="font-bold font-serif-lao text-amber-500">
              {lang === 'lo' ? 'ວິທີເປີດອອກໄປບຣາວເຊີ (ພຽງ 2 ຂັ້ນຕອນ):' : 'Easy 2-Step Guide:'}
            </div>

            <div 
              className="p-3 rounded-xl border flex items-center gap-3"
              style={{
                backgroundColor: 'var(--card-subtle-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div className="min-w-0">
                <span className="font-bold font-serif-lao block text-xs" style={{ color: 'var(--text-primary)' }}>
                  {lang === 'lo' ? 'ກົດປຸ່ມ 3 ຈຸດ (•••)' : 'Tap the 3 dots (•••)'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'lo' ? 'ຢູ່ມຸມຂວາເທິງ ຫຼື ລຸ່ມສຸດຂອງໜ້າຈໍ Facebook' : 'Located at top-right or bottom of screen'}
                </span>
              </div>
              <MoreVertical className="w-4 h-4 text-amber-400 shrink-0 ml-auto" />
            </div>

            <div 
              className="p-3 rounded-xl border flex items-center gap-3"
              style={{
                backgroundColor: 'var(--card-subtle-bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div className="min-w-0">
                <span className="font-bold font-serif-lao block text-xs" style={{ color: 'var(--text-primary)' }}>
                  {lang === 'lo' ? 'ເລືອກ "Open in external browser"' : 'Select "Open in external browser"'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'lo' ? '(ຫຼື "Open in Chrome" / "Open in Safari")' : '(or "Open in Chrome" / "Safari")'}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />
            </div>
          </div>

          {/* Copy Link Option */}
          <div className="pt-2 border-t flex flex-col gap-2" style={{ borderColor: 'var(--card-border)' }}>
            <span className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
              {lang === 'lo' ? 'ຫຼື ກັອບປີ້ລິ້ງໄປວາງໃສ່ບຣາວເຊີ:' : 'Or copy link directly:'}
            </span>
            <button
              onClick={handleCopyLink}
              className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer active:scale-98 ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: copied ? undefined : 'var(--card-subtle-bg)',
                borderColor: copied ? undefined : 'var(--card-border)',
                color: copied ? undefined : 'var(--text-primary)'
              }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{lang === 'lo' ? '✓ ກັອບປີ້ລິ້ງສຳເລັດແລ້ວ!' : '✓ Link Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'lo' ? 'ກັອບປີ້ລິ້ງເວັບໄຊ' : 'Copy Website Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-3 border-t text-center"
          style={{
            backgroundColor: 'var(--card-subtle-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold hover:opacity-90 transition cursor-pointer"
          >
            {lang === 'lo' ? 'ເຂົ້າໃຈແລ້ວ / ປິດ' : 'Got it / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
