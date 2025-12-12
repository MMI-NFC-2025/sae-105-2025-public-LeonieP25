/*
URL d'action : /artistes.html
Actions :
- Ajoute une barre de recherche dans le menu déroulant des artistes.
- Permet de filtrer la liste des artistes en direct selon ce que l'utilisateur tape.
- Si la barre est vide, tous les artistes sont affichés.
- La ligne de recherche reste toujours visible.
- Gère la sélection visuelle d'un artiste dans la liste.
*/


document.addEventListener('DOMContentLoaded', function() {
    // Récupère la liste des artistes et le menu déroulant
    var list = document.getElementById('artist-list');
    var details = document.getElementById('filter-nom');
    var summary = document.getElementById('filter-summary-nom');
    var items = list ? Array.from(list.querySelectorAll('li')) : [];

    // Ajoute la barre de recherche dynamiquement quand on ouvre le menu
    if (details && list) {
        var searchRow = null;
        var searchInput = null;
        details.addEventListener('toggle', function() {
            if (details.open) {
                if (!searchRow) {
                    searchRow = document.createElement('li');
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
                    // Filtrage en direct
                    searchInput.addEventListener('input', function() {
                        var q = searchInput.value.trim().toLowerCase();
                        Array.from(list.querySelectorAll('li')).forEach(function(li) {
                            if (li === searchRow) {
                                li.style.display = '';
                                return;
                            }
                            var a = li.querySelector('a');
                            if (!a) return;
                            if (q === '') {
                                li.style.display = '';
                            } else {
                                li.style.display = a.textContent.trim().toLowerCase().includes(q) ? '' : 'none';
                            }
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

    // Sélection visuelle d'un artiste
    items.forEach(function(li) {
        var a = li.querySelector('a');
        if (!a) return;
        a.addEventListener('click', function() {
            items.forEach(function(l) { l.querySelector('a')?.classList.remove('selected'); });
            a.classList.add('selected');
        });
    });
});
