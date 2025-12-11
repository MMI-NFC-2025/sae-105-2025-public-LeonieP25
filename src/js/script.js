document.addEventListener("DOMContentLoaded", () => {
    // Menu navigation
    const menuBtn = document.querySelector(".btn-menu:not(.btn-close)");
    if (menuBtn) {
        menuBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            document.body.classList.add('hide-artists');
            setTimeout(() => window.location.href = "menu.html", 100);
        });
    }

    window.addEventListener('pageshow', () => {
        document.body.classList.remove('hide-artists');
    });

    const closeBtn = document.querySelector(".btn-menu.btn-close");
    if (closeBtn && !document.querySelector('.menu-navigation')) {
        closeBtn.addEventListener("click", () => {
            document.referrer ? window.history.back() : window.location.href = "index.html";
        });
    }

    // Redirections boutons
    const histBtn = document.querySelector('.historique-logo');
    if (histBtn) histBtn.addEventListener('click', () => window.location.href = 'festival.html');

    const progBtn = document.querySelector('.program-logo');
    if (progBtn) progBtn.addEventListener('click', () => window.location.href = 'programmation.html');

    // Filtres programmation
    const filterDetails = document.querySelectorAll('details.filter-dropdown');
    if (filterDetails.length) {
        filterDetails.forEach(d => {
            const s = d.querySelector('.filter-summary');
            if (s && !s.dataset.default) s.dataset.default = s.textContent.trim();
        });
        if (typeof updateGalleryFilter === 'function') updateGalleryFilter();
    }
});

// Carrousel
(function() {
    const track = document.querySelector('.carousel-track');
    const btnLeft = document.querySelector('.carousel-btn-left');
    const btnRight = document.querySelector('.carousel-btn-right');
    const container = document.querySelector('.carousel-track-container');
    if (!track || !btnLeft || !btnRight || !container) return;

    const slides = Array.from(track.children);
    let currentIndex = 0;

    const updateCarousel = () => {
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

    window.addEventListener('resize', updateCarousel);

    // Swipe tactile
    let startX, isDragging = false;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        const threshold = 40;
        if (Math.abs(deltaX) > threshold) {
            currentIndex = deltaX > 0 && currentIndex > 0 ? currentIndex - 1 
                         : deltaX < 0 && currentIndex < slides.length - 1 ? currentIndex + 1 
                         : currentIndex;
            updateCarousel();
            isDragging = false;
        }
    }, { passive: true });

    container.addEventListener('touchend', () => isDragging = false, { passive: true });
})();

// Filtres programmation - clic sur option
document.addEventListener('click', (e) => {
    const li = e.target.closest('.filter-list li');
    if (!li) return;
    
    e.preventDefault();
    e.stopPropagation();

    const details = li.closest('details');
    const summary = details?.querySelector('.filter-summary');
    const parentFilter = li.closest('.filter');
    const container = document.querySelector('.program-filters');
    
    if (summary && !summary.dataset.default) {
        summary.dataset.default = summary.textContent.trim();
    }

    const closeFilters = () => {
        if (container) {
            container.querySelectorAll('details.filter-dropdown').forEach(d => d.open = false);
            container.classList.remove('filters--one-open');
            container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
        } else if (details) {
            details.open = false;
        }
    };

    // Désélection
    if (li.classList.contains('selected')) {
        li.classList.remove('selected');
        parentFilter?.classList.remove('has-selection');
        if (summary) summary.textContent = summary.dataset.default || summary.textContent.trim();
        closeFilters();
        if (typeof updateGalleryFilter === 'function') updateGalleryFilter();
        return;
    }

    // Sélection
    if (summary) summary.textContent = li.textContent.trim();
    li.closest('.filter-list')?.querySelectorAll('li').forEach(node => node.classList.remove('selected'));
    li.classList.add('selected');
    parentFilter?.classList.add('has-selection');
    closeFilters();
    if (typeof updateGalleryFilter === 'function') updateGalleryFilter();
});

// Ouverture exclusive des filtres
(function() {
    const container = document.querySelector('.program-filters');
    if (!container) return;
    
    const detailsList = container.querySelectorAll('details.filter-dropdown');
    detailsList.forEach(d => {
        d.addEventListener('toggle', () => {
            if (d.open) {
                detailsList.forEach(other => { if (other !== d) other.open = false; });
                container.classList.add('filters--one-open');
                container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
                d.closest('.filter')?.classList.add('filter--active');
            } else {
                setTimeout(() => {
                    if (![...detailsList].some(dd => dd.open)) {
                        container.classList.remove('filters--one-open');
                        container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
                    }
                }, 0);
            }
        });
    });
})();

// Filtrage galerie programmation
function updateGalleryFilter() {
    const container = document.querySelector('.program-filters');
    const cards = document.querySelectorAll('.programmation-card');
    if (!cards.length) return;

    const getSelected = (n) => container?.querySelector(`.filter:nth-of-type(${n}) .filter-list li.selected`)?.textContent.trim();
    const [genreVal, dateVal, sceneVal] = [1, 2, 3].map(getSelected);
    const anySelected = genreVal || dateVal || sceneVal;

    // Tri alphabétique
    const gallery = document.querySelector('.programmation-photos');
    if (gallery) {
        [...gallery.querySelectorAll('.programmation-card')]
            .sort((a, b) => (a.querySelector('img')?.alt || '').localeCompare(b.querySelector('img')?.alt || '', 'fr'))
            .forEach(i => gallery.appendChild(i));
    }

    // Filtrage
    cards.forEach(card => {
        const img = card.querySelector('img');
        if (!img) return;

        if (!anySelected) {
            card.style.display = '';
            return;
        }

        const match = (!genreVal || img.dataset.genre === genreVal) &&
                     (!dateVal || img.dataset.date === dateVal) &&
                     (!sceneVal || img.dataset.scene === sceneVal);
        
        card.style.display = match ? '' : 'none';
    });

    // Message vide
    const visible = [...cards].filter(c => c.style.display !== 'none').length;
    const empty = document.querySelector('.programmation-empty');
    const photos = document.querySelector('.programmation-photos');
    const main = document.querySelector('main');

    if (visible === 0 && anySelected) {
        if (empty) empty.style.display = '';
        if (photos) photos.style.display = 'none';
        if (main) main.style.minHeight = 'auto';
    } else {
        if (empty) empty.style.display = 'none';
        if (photos) photos.style.display = '';
        if (main) main.style.minHeight = '';
    }
}