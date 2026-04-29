/* =========================================================================
   AIGen — Mobile Customer
   Role guard, 5-tab nav, Create FAB sheet modal, generator flow
   ========================================================================= */

(function () {
    'use strict';

    if (!window.AIGenAuth || !window.AIGenAuth.requireRole('customer')) return;
    const session = window.AIGenAuth.getSession();
    let credits = session.credits || 240;

    const COST = 10;
    const GEN_DELAY = 1500;
    const PICSUM = 'https://picsum.photos/seed';

    const SEED_RECENT = [
        { type: 'video', prompt: 'Neon city street', duration: '0:05' },
        { type: 'image', prompt: 'Studio portrait' },
        { type: 'video', prompt: 'Aerial seascape', duration: '0:08' },
        { type: 'image', prompt: 'Watercolor mountain' },
    ];

    const SEED_INSPIRE = [
        { type: 'video', duration: '0:12' }, { type: 'image' },
        { type: 'image' },                   { type: 'video', duration: '0:08' },
        { type: 'image' },                   { type: 'image' },
        { type: 'video', duration: '0:05' }, { type: 'image' },
        { type: 'image' },                   { type: 'video', duration: '0:10' },
    ];

    const SEED_LIBRARY = [
        { type: 'video', prompt: 'Neon city loop', duration: '0:08' },
        { type: 'image', prompt: 'Editorial pastel' },
        { type: 'video', prompt: 'Cinematic dolly', duration: '0:05' },
        { type: 'image', prompt: 'Watercolor scene' },
        { type: 'video', prompt: 'Aerial golden', duration: '0:12' },
        { type: 'image', prompt: 'Botanical macro' },
        { type: 'image', prompt: '85mm portrait' },
        { type: 'video', prompt: 'Light painting', duration: '0:03' },
    ];

    const PANEL_META = {
        home:    { title: 'Home',    sub: 'Welcome back, ' + (session.name ? session.name.split(' ')[0] : 'creator') },
        inspire: { title: 'Inspire', sub: 'Trending generations' },
        library: { title: 'Library', sub: 'Your creations' },
        me:      { title: 'Me',      sub: 'Account, plan, billing' },
    };

    let activeCreateType = 'video';
    let allLibraryItems = SEED_LIBRARY.slice();

    function uid() {
        return 'g-' + Math.random().toString(36).slice(2, 10);
    }

    function setCredits(value) {
        credits = Math.max(0, value);
        const el = document.getElementById('credit-amount');
        if (el) el.textContent = credits.toLocaleString();
        window.AIGenAuth.updateCredits(credits);
    }

    function buildCard(item, animDelay) {
        const id = uid();
        const card = document.createElement('article');
        card.className = 'm-output-card';
        card.dataset.type = item.type;
        if (animDelay) card.style.animationDelay = animDelay + 'ms';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = item.prompt || (item.type === 'video' ? 'AI video' : 'AI image');
        img.src = PICSUM + '/' + id + '/400/500';

        card.appendChild(img);

        if (item.type === 'video') {
            const play = document.createElement('span');
            play.className = 'm-output-play';
            play.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l11 7-11 7V5z"/></svg>';
            card.appendChild(play);

            if (item.duration) {
                const dur = document.createElement('span');
                dur.className = 'm-output-duration';
                dur.textContent = item.duration;
                card.appendChild(dur);
            }
        }

        return card;
    }

    function buildShimmer(label) {
        const card = document.createElement('div');
        card.className = 'm-output-loading';

        const spinner = document.createElement('div');
        spinner.className = 'm-output-loading-spinner';

        const text = document.createElement('span');
        text.textContent = label || 'Generating...';

        card.appendChild(spinner);
        card.appendChild(text);
        return card;
    }

    function renderUser() {
        if (session.name)   document.getElementById('me-name').textContent = session.name;
        if (session.avatar) {
            document.getElementById('user-avatar').textContent = session.avatar;
            document.getElementById('me-avatar').textContent = session.avatar;
        }
    }

    function renderHomeRecent() {
        const grid = document.getElementById('home-recent');
        if (!grid) return;
        grid.innerHTML = '';
        SEED_RECENT.forEach(function (item, i) {
            grid.appendChild(buildCard(item, i * 60));
        });
    }

    function renderInspire() {
        const grid = document.getElementById('inspire-grid');
        if (!grid) return;
        grid.innerHTML = '';
        SEED_INSPIRE.forEach(function (item, i) {
            grid.appendChild(buildCard(item, i * 40));
        });
    }

    function renderLibrary(filter) {
        const grid = document.getElementById('library-grid');
        if (!grid) return;
        const list = !filter || filter === 'all'
            ? allLibraryItems
            : allLibraryItems.filter(function (it) { return it.type === filter; });
        grid.innerHTML = '';
        list.forEach(function (item, i) {
            grid.appendChild(buildCard(item, i * 40));
        });
    }

    /* ----------------------------- Sheet modal ----------------------------- */
    const sheet = document.getElementById('create-sheet');
    const backdrop = document.getElementById('create-backdrop');

    function openSheet(type) {
        if (type) selectType(type);
        backdrop.classList.add('is-open');
        sheet.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeSheet() {
        backdrop.classList.remove('is-open');
        sheet.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function selectType(type) {
        activeCreateType = type;
        document.querySelectorAll('.m-type-btn').forEach(function (btn) {
            btn.classList.toggle('is-active', btn.getAttribute('data-type') === type);
        });
        const durationField = document.getElementById('create-duration-field');
        if (durationField) durationField.style.display = type === 'video' ? '' : 'none';
        const submitLabel = document.querySelector('.create-submit-label');
        if (submitLabel) submitLabel.textContent = type === 'video' ? 'Generate video' : 'Generate image';
    }

    function generate() {
        if (credits < COST) {
            alert('Not enough credits. Please upgrade.');
            return;
        }

        const prompt = document.getElementById('create-prompt').value.trim() || 'Untitled generation';
        const duration = document.getElementById('create-duration').value;
        const newItem = activeCreateType === 'video'
            ? { type: 'video', prompt: prompt, duration: '0:0' + duration }
            : { type: 'image', prompt: prompt };

        const submitBtn = document.getElementById('create-submit');
        submitBtn.disabled = true;

        // Add shimmer to library + show optimistic close
        allLibraryItems.unshift(newItem);
        const libraryGrid = document.getElementById('library-grid');
        if (libraryGrid) {
            const shimmer = buildShimmer('Rendering...');
            libraryGrid.insertBefore(shimmer, libraryGrid.firstChild);

            setTimeout(function () {
                libraryGrid.replaceChild(buildCard(newItem), shimmer);
                submitBtn.disabled = false;
            }, GEN_DELAY);
        } else {
            // If library not yet seeded, just close after delay
            setTimeout(function () { submitBtn.disabled = false; }, GEN_DELAY);
        }

        setCredits(credits - COST);
        closeSheet();
    }

    /* ----------------------------- Tab switching ----------------------------- */
    function switchPanel(target) {
        document.querySelectorAll('[data-panel]').forEach(function (p) {
            p.hidden = p.getAttribute('data-panel') !== target;
        });
        document.querySelectorAll('.m-tab[data-target]').forEach(function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-target') === target);
        });
        const meta = PANEL_META[target];
        if (meta) {
            document.getElementById('page-title').textContent = meta.title;
            document.getElementById('page-sub').textContent = meta.sub;
        }
        if (target === 'inspire' && !switchPanel.inspireRendered) {
            renderInspire();
            switchPanel.inspireRendered = true;
        }
        if (target === 'library' && !switchPanel.libraryRendered) {
            renderLibrary('all');
            switchPanel.libraryRendered = true;
        }
    }

    function setupLibraryFilters() {
        const pills = document.querySelectorAll('.m-filter-row .pill[data-lib-filter]');
        pills.forEach(function (p) {
            p.addEventListener('click', function () {
                pills.forEach(function (q) { q.classList.remove('is-active'); });
                p.classList.add('is-active');
                renderLibrary(p.getAttribute('data-lib-filter'));
            });
        });
    }

    function init() {
        renderUser();
        setCredits(credits);
        renderHomeRecent();

        // Tab nav
        document.querySelectorAll('.m-tab[data-target]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchPanel(btn.getAttribute('data-target'));
            });
        });

        // Create FAB opens sheet
        document.getElementById('create-fab').addEventListener('click', function () {
            openSheet();
        });

        // Shortcut cards on Home open sheet pre-typed
        document.querySelectorAll('.m-shortcut-card[data-quick]').forEach(function (card) {
            card.addEventListener('click', function () {
                openSheet(card.getAttribute('data-quick'));
            });
        });

        // Type segment in sheet
        document.querySelectorAll('.m-type-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                selectType(btn.getAttribute('data-type'));
            });
        });

        // Sheet close: backdrop click or X button
        backdrop.addEventListener('click', closeSheet);
        document.getElementById('create-close').addEventListener('click', closeSheet);

        // Submit
        document.getElementById('create-submit').addEventListener('click', generate);

        // Library filter
        setupLibraryFilters();

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                window.AIGenAuth.logout();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
