/*
Fichier : menu.js
URL d'action : /menu.html
Rôle : Gère les animations d'ouverture/fermeture douce du menu de navigation,
       la persistance de l'item actif via localStorage,
       et la navigation animée avec retour vers la page précédente.
*/



document.addEventListener('DOMContentLoaded', function () {
  // Déclenche l'animation d'ouverture douce du menu
  requestAnimationFrame(() => {
    // Petit délai pour s'assurer que l'état CSS initial est appliqué
    setTimeout(() => document.body.classList.add('menu-open'), 40);
  });
  const menuLinks = document.querySelectorAll('.menu-navigation .menu-item a');
  if (!menuLinks || menuLinks.length === 0) return;

  // Lit la variable CSS --rose pour la couleur de fallback inline (utilise la valeur calculée si disponible)
  let roseColor = 'var(--rose)';
  try {
    const root = getComputedStyle(document.documentElement);
    const v = root.getPropertyValue('--rose');
    if (v) roseColor = v.trim();
  } catch (e) {}

  // Applique l'item actif stocké au chargement (persisté via localStorage)
  // Permet de garder le menu synchronisé entre les pages
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

  // Gestionnaires de clic : active la classe et persiste la sélection dans localStorage
  menuLinks.forEach((link) => {
    link.addEventListener('click', function () {
      // Efface la sélection précédente
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

  // Gère la fermeture animée : au clic sur le bouton fermer, joue l'animation puis navigue
  // Utilise la classe .menu-closing pour raccourcir la durée de transition
  const closeBtn = document.querySelector('.btn-menu.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      // Ajoute la classe closing d'abord pour que la durée raccourcie s'applique
      document.body.classList.add('menu-closing');

      // Force un reflow pour s'assurer que le navigateur applique la classe avant de retirer menu-open
      // afin que la transition de fermeture utilise la --menu-duration raccourcie
      void document.body.offsetWidth;

      document.body.classList.remove('menu-open');

      // Calcule la durée depuis la variable CSS (fallback à 140ms)
      let durationMs = 140;
      try {
        const cs = getComputedStyle(document.body);
        const v = cs.getPropertyValue('--menu-duration');
        if (v) {
          // Parse des valeurs comme '140ms' ou '0.14s'
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
