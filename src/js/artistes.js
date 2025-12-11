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

    // Overlay behaviour: keep the artists grid visible but dimmed,
    // show the filter list as an overlay and allow clicking outside to close.
    const artistsGrid = document.querySelector('.artists-grid');
    const overlay = document.createElement('div');
    overlay.className = 'filter-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.display = 'none';
    overlay.addEventListener('click', ()=>{
        if(details) details.open = false;
    });
    // append early so CSS can target it; it will be hidden until needed
    document.body.appendChild(overlay);

    if(details){
        details.addEventListener('toggle', ()=>{
            if(details.open){
                overlay.style.display = '';
                // small delay to allow CSS transition
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
})();
