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
    var list = document.getElementById('artist-list');
    var searchInput = document.getElementById('artist-search');
    if (searchInput && list) {
        searchInput.addEventListener('input', function() {
            var q = searchInput.value.trim().toLowerCase();
            Array.from(list.querySelectorAll('li')).forEach(function(li) {
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

    // Sélection visuelle d'un artiste
    var items = list ? Array.from(list.querySelectorAll('li')) : [];
    items.forEach(function(li) {
        var a = li.querySelector('a');
        if (!a) return;
        a.addEventListener('click', function() {
            items.forEach(function(l) { l.querySelector('a')?.classList.remove('selected'); });
            a.classList.add('selected');
        });
    });
});
