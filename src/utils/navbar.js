/* Asegúrate de importar este archivo en Layout.astro */
const navbar = document.querySelector('.navbar');
const threshold = parseFloat(getComputedStyle(document.documentElement)
  .getPropertyValue('--topbar-h'));

window.addEventListener('scroll', () => {
  if (window.scrollY > threshold) {
    navbar.classList.add('scrolled');   // sólo el NAV recibe la clase
  } else {
    navbar.classList.remove('scrolled');
  }
});
