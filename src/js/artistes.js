/*
Fichier : artistes.js
URL d'action : /artistes.html
Rôle : recherche d'artistes dans le dropdown, surbrillance de la sélection, overlay de filtre assombri, et affichage solo des images au clic dans le menu déroulant.
*/


(function(){
    const search = document.getElementById('artist-search');
    const list = document.getElementById('artist-list');
    const items = list ? Array.from(list.querySelectorAll('li')) : [];
    const summary = document.getElementById('filter-summary-nom');
    const details = document.getElementById('filter-nom');
    const defaultSummary = summary ? (summary.textContent || '').trim() : '';
    const cards = Array.from(document.querySelectorAll('.artist-card'));

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

    if(details){
        details.addEventListener('toggle', ()=>{
            if(details.open){
                const input = details.querySelector('input');
                if(input) input.focus();
            }
        });
    }

    // --------------------------------------------------
    // Filtrage de la grille depuis le dropdown : affiche uniquement la carte sélectionnée
    // Second clic sur le même artiste => réinitialise et montre toute la grille
    // --------------------------------------------------
    const dropdownLinks = document.querySelectorAll('#artist-list a');
    function filterCardsByName(name){
        const target = (name || '').trim().toLowerCase();
        if(!cards.length){ return; }
        if(!target){
            cards.forEach(card => card.style.display = '');
            return;
        }
        let matched = false;
        cards.forEach(card => {
            const n = card.querySelector('.artist-name');
            const isMatch = n && (n.textContent || '').trim().toLowerCase() === target;
            card.style.display = isMatch ? '' : 'none';
            if(isMatch) matched = true;
        });
        if(!matched){
            cards.forEach(card => card.style.display = '');
        }
    }

    dropdownLinks.forEach(link => {
        link.addEventListener('click', (ev)=>{
            const href = link.getAttribute('href') || '';
            const isRealNav = href && href !== '#';
            const isModifiedClick = ev.ctrlKey || ev.metaKey || ev.button === 1;

            // Laisse la navigation native pour Ctrl/Cmd/Middle click
            if(isRealNav && isModifiedClick) return;

            ev.preventDefault();
            const name = (link.textContent || '').trim();

            const current = summary ? (summary.textContent || '').trim().toLowerCase() : '';
            const normalized = name.toLowerCase();

            // Second clic sur le même artiste : réinitialise l'affichage complet
            if(current === normalized){
                if(summary) summary.textContent = defaultSummary || 'NOM';
                filterCardsByName('');
                clearSelection();
                return;
            }

            // Met à jour le texte du summary avec le nom sélectionné
            if(summary) summary.textContent = name;

            // Ferme le details
            if(details){ details.open = false; }

            // Affiche uniquement la carte correspondante (ou tout si non trouvée)
            filterCardsByName(name);
        });
    });
})();
