// Carrusel infinito real con reciclaje de slides (sin parones, sin huecos)
(function () {
  const section = document.querySelector('.testimonials');
  const carousel = section?.querySelector('.carousel');
  const track = carousel?.querySelector('.track');
  if (!section || !carousel || !track) return;

  // Opcional: velocidad en px/seg desde data-speed (por defecto 8 = suave)
  const SPEED = (() => {
    const v = Number(carousel.dataset?.speed);
    return Number.isFinite(v) && v > 0 ? v : 8;
  })();

  const prefersReduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) return;

  // Lee el gap entre slides: usa CSS gap de .track; si no hay, usa el margin-right del primer slide
  const getGap = () => {
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    if (gap > 0) return gap;

    const first = track.children[0];
    if (!first) return 0;
    const s = getComputedStyle(first);
    const mr = parseFloat(s.marginRight || '0') || 0;
    const ml = parseFloat(s.marginLeft || '0') || 0;
    // Suponemos margen horizontal simétrico; suma una sola vez porque ya hay gap visual
    return Math.max(mr, ml);
  };

  // Ancho total de un slide incluyendo su gap de la derecha
  const slideTotalWidth = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.width + getGap();
  };

  // Rellena con clones hasta cubrir ≥ 3× viewport (suficiente para que nunca haya hueco)
  const ensureFill = () => {
    // Primero, elimina clones previos (dejamos solo la serie original marcada)
    // Si no había marca, marcamos ahora los originales
    Array.from(track.children).forEach((el) => {
      if (!el.dataset.original) el.dataset.original = '1';
    });
    Array.from(track.children).forEach((el) => {
      if (el.dataset.clone === '1') el.remove();
    });

    const viewportW = carousel.clientWidth || window.innerWidth;
    let total = 0;
    Array.from(track.children).forEach((el) => (total += slideTotalWidth(el)));

    // Clonamos la secuencia original (no los clones) hasta alcanzar cobertura
    let safety = 0;
    while (total < viewportW * 3 && safety < 200) {
      const originals = Array.from(track.children).filter((n) => n.dataset.original === '1');
      for (const orig of originals) {
        const clone = orig.cloneNode(true);
        clone.dataset.clone = '1';
        track.appendChild(clone);
        total += slideTotalWidth(clone);
        if (total >= viewportW * 3) break;
      }
      safety++;
    }
  };

  // Estado del ticker
  let x = 0;
  let last = performance.now();
  let rafId = null;
  let paused = false;

  const step = (t) => {
    if (paused) {
      last = t;
      rafId = requestAnimationFrame(step);
      return;
    }

    const dt = (t - last) / 1000; // segundos
    last = t;
    x -= SPEED * dt;

    // Reciclar el primer slide cuando salió por completo
    const first = track.firstElementChild;
    if (first) {
      const w = slideTotalWidth(first);
      if (-x >= w) {
        x += w;               // compensar desplazamiento
        track.appendChild(first); // mandar el primero al final
      }
    }

    track.style.transform = `translate3d(${x}px,0,0)`;
    rafId = requestAnimationFrame(step);
  };

  const start = () => {
    cancelAnimationFrame(rafId);
    x = 0;
    last = performance.now();
    ensureFill();
    rafId = requestAnimationFrame(step);
  };

  // Pausas accesibles (hover o foco dentro de la sección)
  const setPaused = (v) => (paused = v);
  carousel.addEventListener('mouseenter', () => setPaused(true));
  carousel.addEventListener('mouseleave', () => setPaused(false));
  section.addEventListener('focusin', () => setPaused(true));
  section.addEventListener('focusout', () => setPaused(false));

  // Recalcular en resize/orientation/load (por cargas de fuentes/imágenes)
  let resizeRAF;
  const onResize = () => {
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(start);
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  window.addEventListener('load', () => setTimeout(start, 200));

  // Arranca ya
  start();
})();
