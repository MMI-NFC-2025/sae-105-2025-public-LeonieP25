/*
Fichier : artistes.js
URL d'action : /artistes.html
Rôle : recherche d'artistes dans le dropdown, surbrillance de la sélection, overlay de filtre assombri, et affichage solo des images au clic dans le menu déroulant.
*/


document.addEventListener('DOMContentLoaded', () => {
    const search = document.getElementById('artist-search');
    const list = document.getElementById('artist-list');
    const items = list ? Array.from(list.querySelectorAll('li')) : [];
    const summary = document.getElementById('filter-summary-nom');
    const details = document.getElementById('filter-nom');
    const defaultSummary = summary ? summary.textContent.trim() : '';
    const cards = Array.from(document.querySelectorAll('.artist-card'));

    const setSummaryActive = active => summary && summary.classList.toggle('filter-summary--active', !!active);
    const clearSelection = () => items.forEach(li => li.querySelector('a')?.classList.remove('selected'));

    if (search) {
        search.addEventListener('input', e => {
            const q = e.target.value.trim().toLowerCase();
            let any = false;
            items.forEach(li => {
                const match = q === '' || li.textContent.trim().toLowerCase().includes(q);
                li.style.display = match ? '' : 'none';
                if (match) any = true;
            });
            // Correction : le dropdown reste ouvert dès qu'il y a du texte dans la barre
            if (details) details.open = q.length > 0 || any;
            setSummaryActive(q.length > 0 || any);
        });
    }

    items.forEach(li => {
        const a = li.querySelector('a');
        if (!a) return;
        a.addEventListener('click', () => {
            clearSelection();
            a.classList.add('selected');
            setSummaryActive(true);
        });
    });

    if (details) {
        details.addEventListener('toggle', () => {
            if (details.open) details.querySelector('input')?.focus();
        });
    }

    const filterCardsByName = name => {
        const target = (name || '').trim().toLowerCase();
        if (!cards.length) return;
        if (!target) return cards.forEach(card => card.style.display = '');
        let matched = false;
        cards.forEach(card => {
            const n = card.querySelector('.artist-name');
            const isMatch = n && n.textContent.trim().toLowerCase() === target;
            card.style.display = isMatch ? '' : 'none';
            if (isMatch) matched = true;
        });
        if (!matched) cards.forEach(card => card.style.display = '');
    };

    document.querySelectorAll('#artist-list a').forEach(link => {
        link.addEventListener('click', ev => {
            const href = link.getAttribute('href') || '';
            if ((href && href !== '#') && (ev.ctrlKey || ev.metaKey || ev.button === 1)) return;
            ev.preventDefault();
            const name = link.textContent.trim();
            const current = summary ? summary.textContent.trim().toLowerCase() : '';
            const normalized = name.toLowerCase();
            if (current === normalized) {
                if (summary) summary.textContent = defaultSummary || 'NOM';
                filterCardsByName('');
                clearSelection();
                return;
            }
            if (summary) summary.textContent = name;
            if (details) details.open = false;
            filterCardsByName(name);
        });
    });
});
