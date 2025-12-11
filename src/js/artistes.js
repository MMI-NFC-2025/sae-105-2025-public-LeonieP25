// URL visible : /artistes.html
// Comportement : recherche par nom et coloration des éléments sélectionnés


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
            // open details when searching
            if(details){ details.open = any; }
            setSummaryActive(any || false);
        });
    }

    // Click selection coloring
    items.forEach(li => {
        const a = li.querySelector('a');
        if(!a) return;
        a.addEventListener('click', (ev)=>{
            clearSelection();
            a.classList.add('selected');
            setSummaryActive(true);
            // allow link navigation to proceed
        });
    });
})();
