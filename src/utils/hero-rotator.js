// /src/utils/hero-rotator.js
(function(){
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll('.h-slide'));
  if (slides.length <= 1) return;

  const dots = Array.from(hero.querySelectorAll('.h-dot'));
  const prev = hero.querySelector('.h-nav.prev');
  const next = hero.querySelector('.h-nav.next');
  const bar  = hero.querySelector('.h-progress span');

  const D = Number(hero.dataset.duration) || 30000; // lee data-duration

  let index = 0;
  let t = null;

  function apply(i){
    slides.forEach((el, k) => {
      const active = k === i;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
      // Mata cualquier interferencia de CSS global:
      el.style.display        = active ? 'block' : 'none';
      el.style.visibility     = active ? 'visible' : 'hidden';
      el.style.pointerEvents  = active ? 'auto' : 'none';
      el.style.zIndex         = active ? '1' : '0';
    });
    dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === i);
      d.setAttribute('aria-selected', k === i ? 'true' : 'false');
    });
    index = i;
    restartBar();
  }

  function nextSlide(){ apply((index + 1) % slides.length); }
  function prevSlide(){ apply((index - 1 + slides.length) % slides.length); }

  function restartBar(){
    if (!bar) return;
    bar.style.animation = 'none';
    // reflow
    void bar.offsetWidth;
    bar.style.animation = `hBar ${D}ms linear forwards`;
  }

  function loop(){
    nextSlide();
    t = setTimeout(loop, D);
  }

  function start(){
    clearTimeout(t);
    restartBar();
    t = setTimeout(loop, D);
  }

  // Controles
  next && next.addEventListener('click', () => { nextSlide(); restartBar(); clearTimeout(t); t = setTimeout(loop, D); });
  prev && prev.addEventListener('click', () => { prevSlide(); restartBar(); clearTimeout(t); t = setTimeout(loop, D); });
  dots.forEach(d => d.addEventListener('click', (e) => {
    const i = Number(e.currentTarget.dataset.index);
    apply(i);
    clearTimeout(t); t = setTimeout(loop, D);
  }));

  // Arranque limpio
  slides.forEach((el, k) => {
    el.style.display       = k === 0 ? 'block' : 'none';
    el.style.visibility    = k === 0 ? 'visible' : 'hidden';
    el.style.pointerEvents = k === 0 ? 'auto'   : 'none';
    el.style.zIndex        = k === 0 ? '1'      : '0';
  });
  apply(0);
  start();

  // Debug opcional:
  // console.log('[Hero] slides:', slides.length, 'Duración:', D);
})();
