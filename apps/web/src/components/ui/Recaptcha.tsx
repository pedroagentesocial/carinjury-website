import { useEffect, useRef } from 'react';

interface Props {
  /** Google reCAPTCHA v2 site key */
  siteKey: string;
  /** Callback con el token cuando el usuario completa el captcha */
  onVerify: (token: string) => void;
  /** Callback cuando el token expira (~2 min) */
  onExpire?: () => void;
  /** Tema visual */
  theme?: 'light' | 'dark';
}

/* Tipos globales agregados por el script de Google */
declare global {
  interface Window {
    grecaptcha?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: 'light' | 'dark';
          callback: (token: string) => void;
          'expired-callback'?: () => void;
        },
      ) => number;
      reset: (widgetId?: number) => void;
    };
    _onRecaptchaReady?: () => void;
  }
}

let scriptLoading = false;
const readyCallbacks: Array<() => void> = [];

/** Carga el script de Google reCAPTCHA solo una vez. */
function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    if (window.grecaptcha?.render) return resolve();

    readyCallbacks.push(resolve);

    if (!scriptLoading) {
      scriptLoading = true;
      window._onRecaptchaReady = () => {
        readyCallbacks.splice(0).forEach((cb) => cb());
      };
      const s = document.createElement('script');
      s.src = 'https://www.google.com/recaptcha/api.js?onload=_onRecaptchaReady&render=explicit';
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  });
}

/**
 * reCAPTCHA v2 Checkbox widget.
 * Lazy load del script de Google solo cuando el componente monta.
 * Si la siteKey no está, no renderiza nada (modo dev).
 */
export default function Recaptcha({ siteKey, onVerify, onExpire, theme = 'light' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    loadRecaptchaScript().then(() => {
      if (cancelled || !containerRef.current || !window.grecaptcha) return;
      if (widgetIdRef.current !== null) return;
      try {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: onVerify,
          'expired-callback': onExpire,
        });
      } catch {
        /* ya renderizado o error — ignoramos */
      }
    });

    return () => {
      cancelled = true;
    };
  }, [siteKey, onVerify, onExpire, theme]);

  if (!siteKey) {
    return (
      <div className="rounded-lg border border-amber-400/40 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        ⚠️ <code>PUBLIC_RECAPTCHA_SITE_KEY</code> no configurada — captcha desactivado en dev.
      </div>
    );
  }

  return <div ref={containerRef} className="g-recaptcha-wrapper" />;
}
