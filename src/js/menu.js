document.addEventListener('DOMContentLoaded', function () {
  // trigger gentle open animation
  requestAnimationFrame(() => {
    // small timeout to ensure CSS initial state applied
    setTimeout(() => document.body.classList.add('menu-open'), 40);
  });
  const menuLinks = document.querySelectorAll('.menu-navigation .menu-item a');
  if (!menuLinks || menuLinks.length === 0) return;

  // Read CSS variable --rose for inline fallback color (use computed value when available)
  let roseColor = 'var(--rose)';
  try {
    const root = getComputedStyle(document.documentElement);
    const v = root.getPropertyValue('--rose');
    if (v) roseColor = v.trim();
  } catch (e) {}

  // Apply stored active item on load (persisted via localStorage)
  try {
    const activeHref = localStorage.getItem('menuActiveHref');
    if (activeHref) {
      const activeLink = document.querySelector(
        `.menu-navigation .menu-item a[href="${activeHref}"]`
      );
      if (activeLink && activeLink.closest('.menu-item')) {
        activeLink.closest('.menu-item').classList.add('active');
        activeLink.style.color = roseColor;
      }
    }
  } catch (e) {}

  // Click handlers: set active class and persist selection
  menuLinks.forEach((link) => {
    link.addEventListener('click', function () {
      // clear previous
      menuLinks.forEach((l) => {
        const p = l.closest('.menu-item');
        if (p) p.classList.remove('active');
        l.style.color = '';
      });

      const parent = link.closest('.menu-item');
      if (parent) parent.classList.add('active');
      link.style.color = roseColor;

      try {
        localStorage.setItem('menuActiveHref', link.getAttribute('href'));
      } catch (e) {}
    });
  });

  // Handle animated close: when clicking the close button, play closing animation then navigate
  const closeBtn = document.querySelector('.btn-menu.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      // Add closing class first so the shorter duration applies
      document.body.classList.add('menu-closing');

      // Force a reflow to ensure the browser applies the class before we remove menu-open
      // so the closing transition uses the shortened --menu-duration
      void document.body.offsetWidth;

      document.body.classList.remove('menu-open');

      // Compute duration from CSS variable (fallback to 140ms)
      let durationMs = 140;
      try {
        const cs = getComputedStyle(document.body);
        const v = cs.getPropertyValue('--menu-duration');
        if (v) {
          // parse value like '140ms' or '0.14s'
          const ms = v.trim().endsWith('ms') ? parseFloat(v) : (parseFloat(v) * 1000);
          if (!Number.isNaN(ms)) durationMs = ms;
        }
      } catch (e) {}

      const buffer = 40;
      setTimeout(() => {
        try {
          if (document.referrer) window.history.back();
          else window.location.href = 'index.html';
        } catch (e) {
          window.location.href = 'index.html';
        }
      }, Math.max(0, Math.round(durationMs + buffer)));
    });
  }
});
