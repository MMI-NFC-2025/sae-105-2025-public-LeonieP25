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
});

  // Carrousel
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const btnLeft = document.querySelector('.carousel-btn-left');
    const btnRight = document.querySelector('.carousel-btn-right');
    const trackContainer = document.querySelector('.carousel-track-container');
    
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