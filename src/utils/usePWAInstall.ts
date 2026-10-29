import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [inAppBrowserType, setInAppBrowserType] = useState<'facebook' | 'messenger' | 'instagram' | 'line' | 'other' | null>(null);
  const [showInAppGuide, setShowInAppGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect user agent & device types
    const userAgent = (window.navigator.userAgent || '').toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Detect in-app browsers (Facebook, Messenger, Instagram, Line, etc.)
    const isFB = /fban|fbav|fb_iab|fb4a|fbss/.test(userAgent);
    const isMsg = /messenger/.test(userAgent);
    const isInsta = /instagram/.test(userAgent);
    const isLineApp = /line/.test(userAgent);
    const isGenericIAB = /webview|wv/.test(userAgent);

    if (isFB) {
      setIsInAppBrowser(true);
      setInAppBrowserType('facebook');
    } else if (isMsg) {
      setIsInAppBrowser(true);
      setInAppBrowserType('messenger');
    } else if (isInsta) {
      setIsInAppBrowser(true);
      setInAppBrowserType('instagram');
    } else if (isLineApp) {
      setIsInAppBrowser(true);
      setInAppBrowserType('line');
    } else if (isGenericIAB) {
      setIsInAppBrowser(true);
      setInAppBrowserType('other');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Open the current page directly in the external system browser (Chrome on Android)
   * bypassing the Facebook in-app browser without copying link!
   */
  const openInExternalBrowser = useCallback(() => {
    const rawUrl = window.location.href;
    const cleanUrl = rawUrl.replace(/^https?:\/\//, '');

    if (isAndroid) {
      // Android Intent scheme to trigger Chrome directly from Facebook
      const chromeIntent = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end;`;
      try {
        window.location.href = chromeIntent;
      } catch {
        // Fallback to generic view intent
        window.location.href = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end;`;
      }
      return;
    }

    // On iOS or others, show the guided modal pointing to 3-dots
    setShowInAppGuide(true);
  }, [isAndroid]);

  const install = async (): Promise<boolean> => {
    // 1. If inside Facebook / In-App Browser:
    if (isInAppBrowser) {
      if (isAndroid) {
        // Direct jump to Chrome using Android Intent (no copy-pasting needed!)
        openInExternalBrowser();
        return true;
      } else {
        // On iPhone inside Facebook, show the 3-dots popup guide
        setShowInAppGuide(true);
        return false;
      }
    }

    // 2. Standard native PWA prompt (Chrome, Edge, Samsung Internet)
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    }

    // 3. Standard Safari on iOS:
    if (isIOS) {
      setShowInAppGuide(true);
      return false;
    }

    // 4. Fallback if browser doesn't support beforeinstallprompt yet
    openInExternalBrowser();
    return false;
  };

  return {
    isInstallable: !isInstalled,
    canPrompt: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isInAppBrowser,
    inAppBrowserType,
    showInAppGuide,
    setShowInAppGuide,
    openInExternalBrowser,
    install,
  };
}
