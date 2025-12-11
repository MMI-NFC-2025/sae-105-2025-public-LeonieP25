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
		menuBtn.addEventListener("click", () => {
			window.location.href = "menu.html";
		});
	}

	const closeBtn = document.querySelector(".btn-menu.btn-close");
	if (closeBtn) {
        // If we're on the menu page (menu navigation present), skip binding immediate navigation
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

	// Redirect HISTORIQUE button to festival page
	const histBtn = document.querySelector('.historique-logo');
	if (histBtn) {
		histBtn.addEventListener('click', () => {
			window.location.href = 'festival.html';
		});
	}

    // Redirect PROGRAMMATION button from index to programmation page
    const progBtn = document.querySelector('.program-logo');
    if (progBtn) {
        progBtn.addEventListener('click', () => {
            window.location.href = 'programmation.html';
        });
    }

    // Initialize default labels for filter summaries so we can restore them on deselect
    const filterDetails = document.querySelectorAll('details.filter-dropdown');
    if(filterDetails && filterDetails.length){
        filterDetails.forEach(d => {
            const s = d.querySelector('.filter-summary');
            if(s && !s.dataset.default) s.dataset.default = s.textContent.trim();
        });
        // Ensure gallery is filtered initially according to any pre-selected filters
        if(typeof updateGalleryFilter === 'function') updateGalleryFilter();
    }
});

  // Carrousel (guardé pour éviter d'interrompre les autres scripts si l'HTML n'est pas présent)
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

        // Gestion du redimensionnement
        window.addEventListener('resize', updateCarousel);

        // Swipe tactile
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
            const threshold = 40; // distance minimale pour déclencher un slide
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

// Update filter summaries when an option is clicked (programmation filters)
document.addEventListener('click', function(e){
    const li = e.target.closest('.filter-list li');
    if(!li) return;
    // Prevent bubbling that could interfere with details toggle
    e.preventDefault();
    e.stopPropagation();

    const details = li.closest('details');
    if(!details) return;
    const summary = details.querySelector('.filter-summary');
    // ensure we have the default label recorded
    if(summary && !summary.dataset.default) summary.dataset.default = summary.textContent.trim();

    // If this item is already selected, toggle it off (reset to default)
    if(li.classList.contains('selected')){
        // deselect this item
        li.classList.remove('selected');
        // remove has-selection from parent filter
        const parentFilter = li.closest('.filter');
        if(parentFilter) parentFilter.classList.remove('has-selection');
        // restore summary text to its default
        if(summary) summary.textContent = summary.dataset.default || summary.textContent.trim();

        // close details and clear UI active state
        const container = document.querySelector('.program-filters');
        if(container){
            const detailsList = Array.from(container.querySelectorAll('details.filter-dropdown'));
            detailsList.forEach(d => d.open = false);
            container.classList.remove('filters--one-open');
            container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
        } else {
            details.open = false;
        }

        // Refresh gallery filtering after deselect
        if(typeof updateGalleryFilter === 'function') updateGalleryFilter();
        return; // stop here for deselect
    }

    if(summary) {
        summary.textContent = li.textContent.trim();
    }

    // mark selected item (remove selected from siblings in the same list)
    const list = li.closest('.filter-list');
    if(list){
        list.querySelectorAll('li').forEach(node => node.classList.remove('selected'));
        li.classList.add('selected');
    }

    // mark the parent filter as having a selection (do not clear other filters' selections)
    const parentFilter = li.closest('.filter');
    if(parentFilter){
        parentFilter.classList.add('has-selection');
    }

    // close details and clear UI active state
    const container = document.querySelector('.program-filters');
    if(container){
        const detailsList = Array.from(container.querySelectorAll('details.filter-dropdown'));
        detailsList.forEach(d => d.open = false);
        container.classList.remove('filters--one-open');
        container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
    } else {
        details.open = false;
    }

    // Refresh gallery filtering after selection
    if(typeof updateGalleryFilter === 'function') updateGalleryFilter();
});

// Manage exclusive open state: when a filter dropdown opens, hide the other filter controls
(function(){
    const container = document.querySelector('.program-filters');
    if(!container) return;
    const detailsList = Array.from(container.querySelectorAll('details.filter-dropdown'));

    detailsList.forEach(d => {
        d.addEventListener('toggle', () => {
            if(d.open){
                // close other details
                detailsList.forEach(other => { if(other !== d) other.open = false; });
                // mark active filter
                container.classList.add('filters--one-open');
                container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
                const parent = d.closest('.filter'); if(parent) parent.classList.add('filter--active');
            } else {
                // no open details
                // small timeout to allow another details to open immediately
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

    // Gallery filtering logic: show cards that match all selected categories.
    // - If no filters are selected, show all cards.
    // - For categories where a selection exists (genre/date/scene), a card must match that value to be shown.
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

            // For each category that has a selection, require equality. If card lacks that data, treat as non-matching.
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