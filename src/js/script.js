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
    if(summary) {
        summary.textContent = li.textContent.trim();
    }

    // mark selected item (remove selected from siblings in the same list)
    const list = li.closest('.filter-list');
    if(list){
        list.querySelectorAll('li').forEach(node => node.classList.remove('selected'));
        li.classList.add('selected');
    }

    // mark the parent filter as having a selection and clear others
    const parentFilter = li.closest('.filter');
    if(parentFilter){
        const container = document.querySelector('.program-filters');
        if(container){
            container.querySelectorAll('.filter').forEach(f => f.classList.remove('has-selection'));
        }
        parentFilter.classList.add('has-selection');
    }

    // Ensure all details close and the container state is cleared so UI visibly closes
    const container = document.querySelector('.program-filters');
    if(container){
        const detailsList = Array.from(container.querySelectorAll('details.filter-dropdown'));
        detailsList.forEach(d => d.open = false);
        container.classList.remove('filters--one-open');
        container.querySelectorAll('.filter').forEach(f => f.classList.remove('filter--active'));
    } else {
        details.open = false;
    }
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