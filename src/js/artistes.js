/*
Fichier : artistes.js
URL d'action : /artistes.html
Rôle : Gère la recherche d'artistes par nom dans le dropdown,
       la coloration des éléments sélectionnés,
       l'overlay de filtre avec fond assombri,
       et l'affichage en mode solo des images d'artistes au clic dans le menu déroulant.
*/


(function(){
    const search = document.getElementById('artist-search');
    const list = document.getElementById('artist-list');
    const items = list ? Array.from(list.querySelectorAll('li')) : [];
    const summary = document.getElementById('filter-summary-nom');
    const details = document.getElementById('filter-nom');

    function setSummaryActive(active){
        if(!summary) return;
        summary.classList.toggle('filter-summary--active', !!active);
    }

    function clearSelection(){
        items.forEach(li => {
            const a = li.querySelector('a');
            if(a) a.classList.remove('selected');
        });
    }

    if(search){
        search.addEventListener('input', (e)=>{
            const q = (e.target.value || '').trim().toLowerCase();
            let any = false;
            items.forEach(li => {
                const text = (li.textContent || '').trim().toLowerCase();
                const match = q === '' || text.includes(q);
                li.style.display = match ? '' : 'none';
                if(match) any = true;
            });
            // Ouvre le details automatiquement pendant la recherche
            if(details){ details.open = any; }
            setSummaryActive(any || false);
        });
    }

    // Coloration de la sélection au clic (contour rose)
    items.forEach(li => {
        const a = li.querySelector('a');
        if(!a) return;
        a.addEventListener('click', (ev)=>{
            clearSelection();
            a.classList.add('selected');
            setSummaryActive(true);
            // Permet à la navigation du lien de se poursuivre
        });
    });

    // Comportement de l'overlay : garde la grille d'artistes visible mais atténuée,
    // affiche la liste de filtres en superposition et permet de fermer en cliquant à l'extérieur.
    const artistsGrid = document.querySelector('.artists-grid');
    const overlay = document.createElement('div');
    overlay.className = 'filter-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.display = 'none';
    overlay.addEventListener('click', ()=>{
        if(details) details.open = false;
    });
    // Ajoute l'overlay tôt pour que le CSS puisse le cibler ; il sera caché jusqu'à utilisation
    document.body.appendChild(overlay);

    if(details){
        details.addEventListener('toggle', ()=>{
            if(details.open){
                overlay.style.display = '';
                // Petit délai pour permettre la transition CSS
                setTimeout(()=> overlay.classList.add('visible'), 10);
                if(artistsGrid) artistsGrid.classList.add('dimmed');
                const input = details.querySelector('input');
                if(input) input.focus();
            } else {
                overlay.classList.remove('visible');
                setTimeout(()=> overlay.style.display = 'none', 220);
                if(artistsGrid) artistsGrid.classList.remove('dimmed');
            }
        });
    }

    // --------------------------------------------------
    // Comportement image solo depuis le dropdown (tous les artistes)
    // Quand on clique sur un nom d'artiste dans le dropdown (#artist-list a) :
    // - met à jour le texte du summary avec le nom de l'artiste (conservé)
    // - masque la liste déroulante (garde le summary visible)
    // - affiche une image plein écran centrée (ex: /assets/img/aazaroff.avif)
    // - permet de fermer avec le bouton ×, en cliquant à l'extérieur ou avec Escape
    // --------------------------------------------------
    function createSoloOverlay(src, alt){
        const existing = document.querySelector('.solo-overlay');
        if(existing) return existing;
        const overlayEl = document.createElement('div');
        overlayEl.className = 'solo-overlay';
        overlayEl.innerHTML = `
            <div class="solo-inner" role="dialog" aria-modal="true">
                <button class="solo-close" aria-label="Fermer">×</button>
                <img class="solo-image" src="${src}" alt="${alt||''}" />
            </div>`;
        document.body.appendChild(overlayEl);
        document.body.classList.add('no-scroll');

        const closeBtn = overlayEl.querySelector('.solo-close');
        function remove(){
            overlayEl.remove();
            document.body.classList.remove('no-scroll');
            document.removeEventListener('keydown', onKey);
            details.classList.remove('filter-solo-open');
        }
        function onKey(e){ if(e.key === 'Escape') remove(); }
        closeBtn.addEventListener('click', remove);
        overlayEl.addEventListener('click', (ev)=>{ if(ev.target === overlayEl) remove(); });
        document.addEventListener('keydown', onKey);
        return overlayEl;
    }

    const dropdownLinks = document.querySelectorAll('#artist-list a');
    function findCardByName(name){
        const cards = Array.from(document.querySelectorAll('.artist-card'));
        name = (name || '').trim().toLowerCase();
        return cards.find(c => {
            const n = c.querySelector('.artist-name');
            return n && (n.textContent || '').trim().toLowerCase() === name;
        });
    }

    dropdownLinks.forEach(link => {
        link.addEventListener('click', (ev)=>{
            ev.preventDefault();
            const name = (link.textContent || '').trim();

            // Si ce nom est déjà affiché dans le summary, ne rien faire (évite de rouvrir)
            const current = summary ? (summary.textContent || '').trim().toLowerCase() : '';
            if(current === name.toLowerCase()) return;

            // Met à jour le texte du summary avec le nom sélectionné
            if(summary) summary.textContent = name;

            // Ferme le details et marque l'état solo sur le filtre
            if(details){ details.open = false; details.classList.add('filter-solo-open'); }

            // Trouve la carte correspondante et son image
            const card = findCardByName(name);
            let imgPath = '';
            if(card){
                const img = card.querySelector('.artist-thumb img');
                if(img && img.src) imgPath = img.src;
            }

            // Fallback : tente de construire le nom de fichier depuis le nom (normalisation simple)
            if(!imgPath){
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'').replace(/\s+/g,'');
                imgPath = `/assets/img/${slug}off.avif`;
            }

            createSoloOverlay(imgPath, name);
        });
    });
})();
