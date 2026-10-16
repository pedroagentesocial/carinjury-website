// Abre/cierra el dropdown con click (útil en touch)
document.querySelectorAll('[data-dropdown] > a').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    const parent = trigger.closest('[data-dropdown]');
    const isOpen = parent.classList.contains('open');

    // primer click: abre y NO navega
    if (!isOpen) {
      e.preventDefault();
      parent.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    } else {
      // segundo click en "Servicios": navega a /services
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
});

// Cierra al hacer click en un item o fuera del menú
document.addEventListener('click', (e) => {
  document.querySelectorAll('[data-dropdown].open').forEach(dd => {
    if (!dd.contains(e.target)) {
      dd.classList.remove('open');
      const a = dd.querySelector('a');
      if (a) a.setAttribute('aria-expanded', 'false');
    }
  });
});

// Cierra con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('[data-dropdown].open').forEach(dd => {
      dd.classList.remove('open');
      const a = dd.querySelector('a');
      if (a) a.setAttribute('aria-expanded', 'false');
    });
  }
});
