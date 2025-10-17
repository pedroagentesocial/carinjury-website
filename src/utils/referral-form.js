// src/scripts/referral-form.js
// Mejora progresiva del formulario + validación de archivos + firma digital

(() => {
  const form = document.getElementById('referral-form');
  if (!form) return;

  const msg = document.getElementById('form-msg');

  // ============ VALIDACIÓN ARCHIVOS ============
  const fileInput = form.querySelector('#files');
  fileInput?.addEventListener('change', () => {
    const files = fileInput.files;
    if (!files) return;
    if (files.length > 5) {
      alert('Máximo 5 archivos.');
      fileInput.value = '';
      return;
    }
    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) {
        alert('Cada archivo debe ser menor a 10MB.');
        fileInput.value = '';
        return;
      }
    }
  });

  // ============ FIRMA DIGITAL (CANVAS) ============
  const canvas = document.getElementById('sig-canvas');
  const clearBtn = document.getElementById('sig-clear');
  const sigData = document.getElementById('sig-data');

  if (canvas && clearBtn && sigData) {
    const ctx = canvas.getContext('2d');
    let drawing = false;

    const setStyles = () => {
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#111';
    };

    const resizeCanvas = () => {
      // Mantén altura constante; usa el ancho actual del CSS renderizado
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(300, Math.floor(rect.width));
      canvas.height = 200;
      // Redibujar fondo blanco para que no quede transparente
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setStyles();
      // Si había firma previa en base64, podríamos re-colocarla (simple: limpiar)
      if (!sigData.value) {
        // vacío
      }
    };

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const start = (e) => {
      drawing = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      e.preventDefault();
    };

    const draw = (e) => {
      if (!drawing) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      e.preventDefault();
    };

    const end = () => {
      if (!drawing) return;
      drawing = false;
      // Guardar como PNG base64 (fondo blanco)
      sigData.value = canvas.toDataURL('image/png');
    };

    // Eventos
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseout', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', end);

    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Rellenar blanco de nuevo
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setStyles();
      sigData.value = '';
    });

    // Resize
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas.parentElement || canvas);
    window.addEventListener('orientationchange', resizeCanvas);
    window.addEventListener('load', () => setTimeout(resizeCanvas, 200));
    resizeCanvas();
  }

  // ============ ENVÍO (fetch, fallback natural si el server no acepta) ============
  form.addEventListener('submit', async (ev) => {
    // Honeypot
    if (form.querySelector('[name="_trap"]')?.value) return;

    if (!form.reportValidity()) return;
    ev.preventDefault();

    msg.textContent = 'Enviando…';
    const fd = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) throw new Error('NETWORK');

      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        msg.textContent = '¡Enviado! Te contactaremos en breve.';
        form.reset();
        // limpia firma si existe
        if (canvas && sigData) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          sigData.value = '';
        }
      } else {
        msg.textContent = 'No se pudo enviar. Intenta de nuevo o llámanos.';
      }
    } catch (err) {
      msg.textContent = 'No se pudo enviar. Intenta de nuevo o llámanos.';
    }
  });
})();
