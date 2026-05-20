import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import type { Locale } from '@carinjury/shared';

export interface SignatureCanvasHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

interface Props {
  locale: Locale;
  /** Callback con la data URL (PNG) cada vez que cambia el dibujo. '' si está vacío. */
  onChange?: (dataUrl: string) => void;
  label?: string;
  hint?: string;
  required?: boolean;
  error?: boolean;
}

const SignatureCanvas = forwardRef<SignatureCanvasHandle, Props>(function SignatureCanvas(
  { locale, onChange, label, hint, required, error },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const clearLabel = locale === 'en' ? 'Clear' : 'Limpiar';
  const placeholder = locale === 'en' ? 'Sign here with your mouse or finger' : 'Firma aquí con el mouse o tu dedo';

  /* Configura canvas con DPR escalado para que la línea no se vea pixelada */
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#1A1D2A';
  }, []);

  /* Inicializa + reacciona a resize */
  useEffect(() => {
    setupCanvas();
    const onResize = () => {
      // Resize borra el canvas — guardar y restaurar
      const canvas = canvasRef.current;
      if (!canvas) return;
      const prev = canvas.toDataURL();
      setupCanvas();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        const rect = canvas.getBoundingClientRect();
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = prev;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setupCanvas]);

  const getPos = (e: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPoint.current = getPos(e);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPoint.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPoint.current = pos;
    if (!hasInk) setHasInk(true);
  };

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (onChange) onChange(hasInk ? canvas.toDataURL('image/png') : '');
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasInk(false);
    if (onChange) onChange('');
  }, [onChange]);

  useImperativeHandle(ref, () => ({
    clear,
    isEmpty: () => !hasInk,
    toDataURL: () => (canvasRef.current && hasInk ? canvasRef.current.toDataURL('image/png') : ''),
  }), [clear, hasInk]);

  return (
    <div className="grid gap-2">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            {label} {required && '*'}
          </span>
          {hasInk && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:border-primary/40 hover:text-primary"
            >
              {clearLabel}
            </button>
          )}
        </div>
      )}
      <div
        className={`relative overflow-hidden rounded-xl border-2 border-dashed bg-white transition ${
          error
            ? 'border-red-400 bg-red-50/40'
            : hasInk
              ? 'border-primary/30'
              : 'border-line'
        }`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerCancel={endDraw}
          onPointerLeave={endDraw}
          className="block h-44 w-full cursor-crosshair touch-none md:h-48"
          aria-label={label ?? placeholder}
        />
        {!hasInk && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm italic text-muted/60">
            {placeholder}
          </div>
        )}
        {/* Baseline visual */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-6 h-px bg-line/60"
        />
      </div>
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
});

export default SignatureCanvas;
