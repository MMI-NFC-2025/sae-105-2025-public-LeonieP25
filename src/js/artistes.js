/*
Fichier : artistes.js
URL d'action : /artistes.html
Rôle : recherche d'artistes dans le dropdown, surbrillance de la sélection, overlay de filtre assombri, et affichage solo des images au clic dans le menu déroulant.
*/


document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('artist-list');
    const items = list ? Array.from(list.querySelectorAll('li')) : [];
    const summary = document.getElementById('filter-summary-nom');
    const details = document.getElementById('filter-nom');
    const defaultSummary = summary ? summary.textContent.trim() : '';
    const cards = Array.from(document.querySelectorAll('.artist-card'));

    const setSummaryActive = active => summary && summary.classList.toggle('filter-summary--active', !!active);
    const clearSelection = () => items.forEach(li => li.querySelector('a')?.classList.remove('selected'));

    // Suppression de la logique liée à #artist-search

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

    if (details && list) {
        let searchRow = null;
        let searchInput = null;
        details.addEventListener('toggle', () => {
            if (details.open) {
                if (!searchRow) {
                    searchRow = document.createElement('li');
                    searchRow.style.paddingBottom = '4px';
                    searchRow.style.background = 'none';
                    searchRow.style.border = 'none';
                    searchRow.style.cursor = 'auto';
                    searchInput = document.createElement('input');
                    searchInput.type = 'search';
                    searchInput.placeholder = 'Rechercher un artiste';
                    searchInput.style.width = '100%';
                    searchInput.style.padding = '8px 10px';
                    searchInput.style.borderRadius = '8px';
                    searchInput.style.border = '1px solid #ccc';
                    searchInput.style.background = 'rgba(255,255,255,0.08)';
                    searchInput.style.color = 'var(--blanc)';
                    searchInput.style.fontSize = '1rem';
                    searchRow.appendChild(searchInput);
                    list.insertBefore(searchRow, list.firstChild);
                    searchInput.addEventListener('input', () => {
                        const q = searchInput.value.trim().toLowerCase();
                        Array.from(list.querySelectorAll('li')).forEach((li, idx) => {
                            if (li === searchRow) return;
                            const a = li.querySelector('a');
                            if (!a) return;
                            const match = a.textContent.trim().toLowerCase().includes(q);
                            li.style.display = match ? '' : 'none';
                        });
                    });
                }
                searchRow.style.display = '';
                searchInput.value = '';
                searchInput.focus();
            } else if (searchRow) {
                searchRow.style.display = 'none';
            }
        });
    }
});
