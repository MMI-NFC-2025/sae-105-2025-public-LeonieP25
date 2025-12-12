/*
Fichier : script.js
URL d’action : toutes les pages.
Rôle : interactions globales : création/animation du menu overlay (ouverture/fermeture/persistance active), redirections boutons historique/programme, filtres programmation (sélection, ouverture exclusive, filtrage, tri alpha, message vide), carrousel partenaires, animations de reveal au scroll.
*/

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    let menuOverlay;

    const readMenuDuration = () => {
        let durationMs = 180;
        try {
            const v = getComputedStyle(body).getPropertyValue('--menu-duration');
            if (v) {
                const trimmed = v.trim();
                durationMs = trimmed.endsWith('ms') ? parseFloat(trimmed) : parseFloat(trimmed) * 1000;
            }
        } catch (e) {}
        return Number.isNaN(durationMs) ? 180 : durationMs;
    };

    const ensureMenuOverlay = () => {
        if (menuOverlay && document.body.contains(menuOverlay)) return menuOverlay;

        const layer = document.createElement('div');
        layer.className = 'menu-layer';
        layer.setAttribute('aria-hidden', 'true');
        layer.hidden = true;
        layer.innerHTML = `
            <video class="bg-video" autoplay loop muted playsinline aria-hidden="true">
                <source src="/assets/mp4/FondImage.mp4" type="video/mp4" />
            </video>
            <div class="menu-shell">
                <nav class="topbar" aria-hidden="true" aria-label="Top navigation">
                    <a href="/" class="logo-link">
                        <img src="assets/svg/LogoLumimix.svg" alt="LUMIMIX" class="logo" />
                    </a>
                    <button class="btn-menu btn-close" type="button" aria-label="Fermer le menu">
                        <img src="assets/svg/croix.svg" alt="Fermer" aria-hidden="true" />
                    </button>
                </nav>
                <main class="hero" role="presentation">
                    <h1 class="menu-page-title">MENU</h1>
                    <nav class="menu-navigation">
                        <div class="menu-item"><a href="index.html">ACCUEIL</a></div>
                        <div class="menu-item"><a href="festival.html">LE FESTIVAL</a></div>
                        <div class="menu-item"><a href="programmation.html">PROGRAMMATION</a></div>
                        <div class="menu-item"><a href="artistes.html">ARTISTES</a></div>
                        <div class="menu-item"><a href="scenes.html">SCÈNES</a></div>
                        <div class="menu-item"><a href="infos.html">INFOS PRATIQUES</a></div>
                        <div class="menu-item"><a href="contact.html">CONTACT</a></div>
                    </nav>
                    <nav class="menu-socials" aria-label="Menu social links">
                        <a href="https://facebook.com" class="social-icon" aria-label="Facebook">
                            <img src="assets/svg/facebook.svg" alt="Facebook" />
                        </a>
                        <a href="https://x.com" class="social-icon" aria-label="X (Twitter)">
                            <img src="assets/svg/xtwitter.svg" alt="X (Twitter)" />
                        </a>
                        <a href="https://instagram.com" class="social-icon" aria-label="Instagram">
                            <img src="assets/svg/instagram.svg" alt="Instagram" />
                        </a>
                        <a href="https://tiktok.com" class="social-icon" aria-label="TikTok">
                            <img src="assets/svg/tiktok.svg" alt="TikTok" />
                        </a>
                        <a href="https://youtube.com" class="social-icon" aria-label="YouTube">
                            <img src="assets/svg/youtube.svg" alt="YouTube" />
                        </a>
                    </nav>
                </main>
            </div>
        `;

        document.body.appendChild(layer);
        menuOverlay = layer;

        const closeBtn = layer.querySelector('.btn-menu.btn-close');
        const menuLinks = layer.querySelectorAll('.menu-navigation .menu-item a');

        const applyActive = () => {
            try {
                const activeHref = localStorage.getItem('menuActiveHref');
                menuLinks.forEach((link) => {
                    const parent = link.closest('.menu-item');
                    if (parent) parent.classList.remove('active');
                    link.style.color = '';
                });
                if (activeHref) {
                    const activeLink = layer.querySelector(`.menu-navigation .menu-item a[href="${activeHref}"]`);
                    if (activeLink) {
                        const parent = activeLink.closest('.menu-item');
                        if (parent) parent.classList.add('active');
                        activeLink.style.color = getComputedStyle(document.documentElement).getPropertyValue('--rose') || 'var(--rose)';
                    }
                }
            } catch (e) {}
        };

        menuLinks.forEach((link) => {
            link.addEventListener('click', () => {
                try { localStorage.setItem('menuActiveHref', link.getAttribute('href') || ''); } catch (e) {}
                applyActive();
            });
        });
        applyActive();

        if (closeBtn) {
            closeBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                closeMenuOverlay();
            });
        }

        return layer;
    };

    const openMenuOverlay = () => {
        const layer = ensureMenuOverlay();
        layer.hidden = false;
        layer.setAttribute('aria-hidden', 'false');
        body.classList.remove('menu-closing');
        body.classList.add('hide-artists');
        requestAnimationFrame(() => body.classList.add('menu-open'));
    };

    const closeMenuOverlay = () => {
        if (!menuOverlay) return;
        body.classList.add('menu-closing');
        void body.offsetWidth;
        body.classList.remove('menu-open');
        const duration = readMenuDuration();
        setTimeout(() => {
            menuOverlay.setAttribute('aria-hidden', 'true');
            menuOverlay.hidden = true;
            body.classList.remove('menu-closing');
            body.classList.remove('hide-artists');
        }, Math.max(0, Math.round(duration + 60)));
    };

    // Animations d'apparition au scroll
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0, rootMargin: '20% 0px 0px 0px' });

    const bindReveals = () => {
        const nodes = Array.from(document.querySelectorAll(
            'header, header > *, main, main > section, main > article, main > div, .hero, body > section, body > div:not(.topbar):not(.bg-video):not(.menu-layer), .programmation-card, .artists-grid .artist-card, .scene-card, .price-card, .infos-block, .faq-item, footer'
        ));

        nodes.forEach((el, idx) => {
            if (el.dataset.revealBound) return;
            el.dataset.revealBound = '1';
            el.classList.add('reveal-item');
            el.style.setProperty('--reveal-delay', `${Math.min(idx * 40, 240)}ms`);

            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight * 0.98;
            const isProgramCard = el.classList.contains('programmation-card');

            if (inView || isProgramCard && rect.top < window.innerHeight * 1.05) {
                el.classList.add('is-visible');
            } else {
                io.observe(el);
            }
        });
    };

    bindReveals();

    // Menu navigation
    const menuBtn = document.querySelector('.btn-menu:not(.btn-close)');
    if (menuBtn) {
        menuBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            openMenuOverlay();
        });
    }

    window.addEventListener('pageshow', () => {
        document.body.classList.remove('hide-artists');
    });

    const closeBtn = document.querySelector('.btn-menu.btn-close');
    if (closeBtn && !document.querySelector('.menu-navigation')) {
        closeBtn.addEventListener('click', () => {
            document.referrer ? window.history.back() : window.location.href = 'index.html';
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('menu-open')) {
            closeMenuOverlay();
        }
    });

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