/*
URL(s) où l'interaction est visible :
- /programmation.html : filtrage de la galerie, sélection/désélection des filtres, message "aucun résultat", tri alphabétique
- /index.html         : bouton PROGRAMMATION (redirection), carrousel de la page d'accueil
- /festival.html      : redirection du bouton HISTORIQUE
- /menu.html          : comportements de fermeture/fermeture animée
- /artiste1.html      : comportements de retour/redirection sur la page artiste
*/



document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".btn-menu:not(.btn-close)");
    if (menuBtn) {
        menuBtn.addEventListener("click", (ev) => {
            // Masque visuellement la grille des artistes avant la navigation pour feedback utilisateur
            ev.preventDefault();
            document.body.classList.add('hide-artists');
            // Laisse le temps au DOM de mettre à jour la classe CSS, puis navigue vers menu.html
            setTimeout(() => { window.location.href = "menu.html"; }, 100);
        });
    }

    // Quand la page est affichée (y compris via le cache back/forward du navigateur),
    // retire la classe 'hide-artists' pour s'assurer que le contenu est visible
    window.addEventListener('pageshow', function () {
        document.body.classList.remove('hide-artists');
    });

	const closeBtn = document.querySelector(".btn-menu.btn-close");
	if (closeBtn) {
        // Si on est sur la page menu (navigation menu présente), ignore le binding de navigation immédiate
        // (la gestion de fermeture du menu est dans menu.js)
        if (!document.querySelector('.menu-navigation')) {
            closeBtn.addEventListener("click", () => {
                // Ferme le menu et revient à la page précédente (accueil par défaut)
                if (document.referrer) {
                    window.history.back();
                } else {
                    window.location.href = "index.html";
                }
            });
        }
	}

	// Redirection du bouton HISTORIQUE vers la page festival (/festival.html)
	const histBtn = document.querySelector('.historique-logo');
	if (histBtn) {
		histBtn.addEventListener('click', () => {
			window.location.href = 'festival.html';
		});
	}

    // Redirection du bouton PROGRAMMATION de l'index vers la page programmation (/programmation.html)
    const progBtn = document.querySelector('.program-logo');
    if (progBtn) {
        progBtn.addEventListener('click', () => {
            window.location.href = 'programmation.html';
        });
    }

    // Initialise les libellés par défaut des résumés de filtres pour pouvoir les restaurer lors de la désélection
    // (Utilisé sur /programmation.html pour les filtres Genre/Date/Scène)
    const filterDetails = document.querySelectorAll('details.filter-dropdown');
    if(filterDetails && filterDetails.length){
        filterDetails.forEach(d => {
            const s = d.querySelector('.filter-summary');
            if(s && !s.dataset.default) s.dataset.default = s.textContent.trim();
        });
        // S'assure que la galerie est filtrée au chargement selon les filtres pré-sélectionnés
        if(typeof updateGalleryFilter === 'function') updateGalleryFilter();
    }
});

  // Carrousel de la page d'accueil (/index.html)
  // Guardé pour éviter d'interrompre les autres scripts si l'HTML n'est pas présent
    (function(){
        const track = document.querySelector('.carousel-track');
        const btnLeft = document.querySelector('.carousel-btn-left');
        const btnRight = document.querySelector('.carousel-btn-right');
        const trackContainer = document.querySelector('.carousel-track-container');
        if(!track || !track.children || !btnLeft || !btnRight || !trackContainer) return;

        const slides = Array.from(track.children);
        let currentIndex = 0;

        const updateCarousel = () => {
            if(!slides.length) return;
            const slideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        };

        btnRight.addEventListener('click', () => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        });

        btnLeft.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        // Gestion du redimensionnement de la fenêtre pour adapter la position des slides
        window.addEventListener('resize', updateCarousel);

        // Swipe tactile pour navigation par glissement sur mobile
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        const onTouchStart = (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
        };

        const onTouchMove = (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        };

        const onTouchEnd = () => {
            if (!isDragging) return;
            const deltaX = currentX - startX;
            const threshold = 40; // Distance minimale en pixels pour déclencher un changement de slide
            if (deltaX > threshold && currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            } else if (deltaX < -threshold && currentIndex < slides.length - 1) {
                currentIndex++;
                updateCarousel();
            }
            isDragging = false;
        };

        trackContainer.addEventListener('touchstart', onTouchStart, { passive: true });
        trackContainer.addEventListener('touchmove', onTouchMove, { passive: true });
        trackContainer.addEventListener('touchend', onTouchEnd, { passive: true });
    })();

// Mise à jour des résumés de filtres au clic sur une option (filtres programmation)
// Utilisé sur /programmation.html pour gérer la sélection/désélection des filtres genre/date/scène
document.addEventListener('click', function(e){
    const li = e.target.closest('.filter-list li');
    if(!li) return;
    // Empêche la propagation qui pourrait interférer avec le basculement details
    e.preventDefault();
    e.stopPropagation();

    const details = li.closest('details');
    if(!details) return;
    const summary = details.querySelector('.filter-summary');
    // S'assure que le label par défaut est enregistré
    if(summary && !summary.dataset.default) summary.dataset.default = summary.textContent.trim();

    // Si cet item est déjà sélectionné, le désactive (réinitialise au défaut)
    if(li.classList.contains('selected')){
        // Désélectionne cet item
        li.classList.remove('selected');
        // Retire has-selection du filtre parent
        const parentFilter = li.closest('.filter');
        if(parentFilter) parentFilter.classList.remove('has-selection');
        // Restaure le texte du summary à sa valeur par défaut
        if(summary) summary.textContent = summary.dataset.default || summary.textContent.trim();

        // Ferme les details et efface l'état actif de l'interface
        const container = document.querySelector('.program-filters');
        if(container){
            const detailsList = Array.from(container.querySelectorAll('details.filter-dropdown'));
            detailsList.forEach(d => d.open = false);
            container.classList.remove('filters--one-open');
            container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
        } else {
            details.open = false;
        }

        // Rafraîchit le filtrage de la galerie après désélection
        if(typeof updateGalleryFilter === 'function') updateGalleryFilter();
        return; // Stoppe l'exécution ici pour la désélection
    }

    if(summary) {
        summary.textContent = li.textContent.trim();
    }

    // Marque l'item sélectionné (retire selected des frères dans la même liste)
    const list = li.closest('.filter-list');
    if(list){
        list.querySelectorAll('li').forEach(node => node.classList.remove('selected'));
        li.classList.add('selected');
    }

    // Marque le filtre parent comme ayant une sélection (ne désélectionne pas les autres filtres)
    const parentFilter = li.closest('.filter');
    if(parentFilter){
        parentFilter.classList.add('has-selection');
    }

    // Ferme les details et efface l'état actif de l'interface
    const container = document.querySelector('.program-filters');
    if(container){
        const detailsList = Array.from(container.querySelectorAll('details.filter-dropdown'));
        detailsList.forEach(d => d.open = false);
        container.classList.remove('filters--one-open');
        container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
    } else {
        details.open = false;
    }

    // Rafraîchit le filtrage de la galerie après sélection
    if(typeof updateGalleryFilter === 'function') updateGalleryFilter();
});

// Gère l'état d'ouverture exclusive : quand un filtre s'ouvre, masque les autres contrôles de filtre
// Utilisé sur /programmation.html pour empêcher plusieurs filtres d'être ouverts simultanément
(function(){
    const container = document.querySelector('.program-filters');
    if(!container) return;
    const detailsList = Array.from(container.querySelectorAll('details.filter-dropdown'));

    detailsList.forEach(d => {
        d.addEventListener('toggle', () => {
            if(d.open){
                // Ferme les autres details
                detailsList.forEach(other => { if(other !== d) other.open = false; });
                // Marque le filtre actif
                container.classList.add('filters--one-open');
                container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
                const parent = d.closest('.filter'); if(parent) parent.classList.add('filter--active');
            } else {
                // Aucun details ouvert
                // Petit délai pour permettre à un autre details de s'ouvrir immédiatement
                setTimeout(() => {
                    const anyOpen = detailsList.some(dd => dd.open);
                    if(!anyOpen){
                        container.classList.remove('filters--one-open');
                        container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
                    }
                }, 0);
            }
        });
    });
})();

    // Logique de filtrage de la galerie : affiche les cartes qui correspondent à toutes les catégories sélectionnées.
    // - Si aucun filtre n'est sélectionné, affiche toutes les cartes.
    // - Pour les catégories où une sélection existe (genre/date/scène), une carte doit correspondre à cette valeur pour être affichée.
    // (Utilisé sur /programmation.html pour filtrer les cartes artistes)
    function updateGalleryFilter(){
        const container = document.querySelector('.program-filters');
        const cards = Array.from(document.querySelectorAll('.programmation-card'));
        if(!cards.length) return;

        // Determine current selections (by filter order in the DOM: 1=genre,2=date,3=scene)
        const selectedGenre = container ? container.querySelector('.filter:nth-of-type(1) .filter-list li.selected') : null;
        const selectedDate = container ? container.querySelector('.filter:nth-of-type(2) .filter-list li.selected') : null;
        const selectedScene = container ? container.querySelector('.filter:nth-of-type(3) .filter-list li.selected') : null;

        const genreVal = selectedGenre ? selectedGenre.textContent.trim() : null;
        const dateVal = selectedDate ? selectedDate.textContent.trim() : null;
        const sceneVal = selectedScene ? selectedScene.textContent.trim() : null;

        const anySelected = !!(genreVal || dateVal || sceneVal);

        // helper: sort the gallery alphabetically by img alt
        function sortGalleryByAlt(){
            const gallery = document.querySelector('.programmation-photos');
            if(!gallery) return;
            const items = Array.from(gallery.querySelectorAll('.programmation-card'));
            items.sort((a,b) => {
                const aText = (a.querySelector('img')?.alt || '').trim().toLowerCase();
                const bText = (b.querySelector('img')?.alt || '').trim().toLowerCase();
                return aText.localeCompare(bText, 'fr', {sensitivity: 'base'});
            });
            items.forEach(i => gallery.appendChild(i));
        }

        cards.forEach(card => {
            const img = card.querySelector('img');
            if(!img) return;

            const cardGenre = img.dataset.genre || null;
            const cardDate = img.dataset.date || null;
            const cardScene = img.dataset.scene || null;

            // If no filters selected, show all
            if(!anySelected){
                card.style.display = '';
                return;
            }

            // Pour chaque catégorie qui a une sélection, requiert l'égalité. Si la carte manque cette donnée, la traiter comme non-correspondante.
            let match = true;
            if(genreVal){ if(!cardGenre || cardGenre.trim() !== genreVal) match = false; }
            if(dateVal){ if(!cardDate || cardDate.trim() !== dateVal) match = false; }
            if(sceneVal){ if(!cardScene || cardScene.trim() !== sceneVal) match = false; }

            card.style.display = match ? '' : 'none';
        });

        // Show/hide the empty-results message when no cards are visible and at least one filter is active
        const visibleCount = cards.filter(c => c.style.display !== 'none').length;
        const emptyEl = document.querySelector('.programmation-empty');
        const photosContainer = document.querySelector('.programmation-photos');
        const mainEl = document.querySelector('main');

        if(visibleCount === 0 && anySelected){
            if(emptyEl) emptyEl.style.display = '';
            if(photosContainer) photosContainer.style.display = 'none';
            if(mainEl) mainEl.style.minHeight = 'auto';
        } else {
            if(emptyEl) emptyEl.style.display = 'none';
            if(photosContainer) photosContainer.style.display = '';
            if(mainEl) mainEl.style.minHeight = '';
        }

        // Keep gallery sorted (call once)
        sortGalleryByAlt();
    }