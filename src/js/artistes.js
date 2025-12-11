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

    // --------------------------------------------------
    // Dropdown -> solo image behaviour (Aazar only)
    // When clicking Aazar in the dropdown (#artist-list a):
    // - set the summary text to the artist name (kept)
    // - hide the dropdown list (keep the summary visible)
    // - show a centered full-size image (/assets/img/aazaroff.avif)
    // - allow closing with the × button, clicking outside or Escape
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

            // If this name is already shown in the summary, do nothing
            const current = summary ? (summary.textContent || '').trim().toLowerCase() : '';
            if(current === name.toLowerCase()) return;

            // Update summary text
            if(summary) summary.textContent = name;

            // close details and mark solo state on the filter
            if(details){ details.open = false; details.classList.add('filter-solo-open'); }

            // find matching card and its image
            const card = findCardByName(name);
            let imgPath = '';
            if(card){
                const img = card.querySelector('.artist-thumb img');
                if(img && img.src) imgPath = img.src;
            }

            // fallback: attempt to build filename from name (simple normalize)
            if(!imgPath){
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'').replace(/\s+/g,'');
                imgPath = `/assets/img/${slug}off.avif`;
            }

            createSoloOverlay(imgPath, name);
        });
    });
})();
