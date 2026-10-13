
/* =========================================================
   PRIFISA - JavaScript principal
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. MENÚ MÓVIL
     ========================================================= */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar menú al hacer clic en un enlace
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =========================================================
     2. NAVBAR - SCROLL Y ENLACE ACTIVO
     ========================================================= */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
    // Botón volver arriba
    const backBtn = document.querySelector('.back-to-top');
    if (backBtn) backBtn.classList.toggle('show', window.scrollY > 400);
  });

  // Marcar enlace activo según la página actual
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* =========================================================
     3. FAQ ACORDEÓN
     ========================================================= */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Cerrar todos (comportamiento acordeón)
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const q = i.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* =========================================================
     4. ANIMACIONES AL HACER SCROLL (IntersectionObserver)
     ========================================================= */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: mostrar todo si no hay soporte
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  /* =========================================================
     5. FORMULARIO DE CONTACTO
     ---------------------------------------------------------
     NOTA: Aquí se puede integrar Formspree, EmailJS o un
     backend propio. Actualmente solo simula el envío.
     Ejemplo con Formspree:
       fetch('https://formspree.io/f/TU_ID', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
         body: JSON.stringify(formData)
       })
     ========================================================= */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Reset errores
      contactForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

      let hasError = false;
      const requiredFields = contactForm.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        const group = field.closest('.form-group');
        if (!field.value.trim()) {
          if (group) group.classList.add('error');
          hasError = true;
        }
        if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          if (group) group.classList.add('error');
          hasError = true;
        }
      });

      if (hasError) return;
      const formData = Object.fromEntries(new FormData(contactForm).entries());

      // Recoger datos (listo para enviar a backend)
      fetch('https://formspree.io/f/xwvdoqyn', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  body: JSON.stringify(formData)
});

      // Mostrar mensaje de éxito
      const success = contactForm.querySelector('.form-success');
      if (success) success.classList.add('show');

      // Limpiar formulario
      contactForm.reset();

      // Ocultar mensaje tras 6 segundos
      setTimeout(() => {
        if (success) success.classList.remove('show');
      }, 6000);

      // TODO: Integrar aquí Formspree, EmailJS o backend propio
    });
  }

  /* =========================================================
     6. BOTÓN VOLVER ARRIBA
     ========================================================= */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});

