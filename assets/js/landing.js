/* =========================================================================
   AIGen — Landing Page Logic
   Infinity scroll gallery + smooth anchor scrolling
   ========================================================================= */

(function () {
    'use strict';

    // ---------------------------------------------------------------------
    // Config
    // ---------------------------------------------------------------------
    const BATCH_SIZE = 12;
    const MAX_BATCHES = 8; // stop loading after ~96 cards (demo pacing)
    const PICSUM_BASE = 'https://picsum.photos/seed';

    // Aspect-ratio buckets for masonry variety
    const ASPECT_BUCKETS = [
        { w: 400, h: 500 },   // portrait
        { w: 400, h: 300 },   // landscape
        { w: 400, h: 600 },   // tall portrait
        { w: 400, h: 400 },   // square
        { w: 400, h: 250 },   // wide
        { w: 400, h: 550 },   // tall
    ];

    const VIDEO_CAPTIONS = [
        'Cinematic 4K · 12s clip',
        'Dolly zoom · neon noir',
        'Slow-motion portrait · 60fps',
        'Aerial seascape · golden hour',
        'Light-painting bloom · 8s',
        'Cyberpunk alley · loop',
    ];

    const IMAGE_CAPTIONS = [
        'Studio portrait · sharp light',
        'Editorial fashion · pastel',
        'Watercolor landscape',
        'Architectural minimalism',
        'Botanical macro · 4K',
        'Abstract geometric mesh',
    ];

    const AUTHORS = [
        '@nora.studio', '@kenji.fx', '@aria.makes', '@vesper',
        '@lumen.ai', '@cassia', '@nightowl', '@maev',
        '@oren.gen', '@yuri.lab', '@solas', '@quinn',
    ];

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------
    let batchCounter = 0;
    let cardCounter = 0;
    let isLoading = false;

    const grid = document.getElementById('gallery-grid');
    const loader = document.getElementById('gallery-loader');
    const sentinel = document.getElementById('gallery-sentinel');

    // ---------------------------------------------------------------------
    // Card builders
    // ---------------------------------------------------------------------
    function pickFrom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function buildCard(index) {
        const isVideo = Math.random() < 0.35;
        const aspect = ASPECT_BUCKETS[index % ASPECT_BUCKETS.length];
        const seed = `aigen-${cardCounter++}-${Math.floor(Math.random() * 9999)}`;
        const src = `${PICSUM_BASE}/${seed}/${aspect.w}/${aspect.h}`;

        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('role', 'figure');

        const tag = document.createElement('span');
        tag.className = 'gallery-tag ' + (isVideo ? 'gallery-tag-video' : 'gallery-tag-image');
        tag.textContent = isVideo ? 'Video' : 'Image';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = isVideo ? 'AI-generated video preview' : 'AI-generated image';
        img.src = src;
        img.width = aspect.w;
        img.height = aspect.h;

        const caption = document.createElement('div');
        caption.className = 'gallery-caption';

        const captionTitle = document.createElement('span');
        captionTitle.className = 'gallery-caption-title';
        captionTitle.textContent = isVideo ? pickFrom(VIDEO_CAPTIONS) : pickFrom(IMAGE_CAPTIONS);

        const captionAuthor = document.createElement('span');
        captionAuthor.className = 'gallery-caption-author';
        captionAuthor.textContent = pickFrom(AUTHORS);

        caption.appendChild(captionTitle);
        caption.appendChild(captionAuthor);

        item.appendChild(tag);
        item.appendChild(img);
        item.appendChild(caption);

        // Stagger entry animation across the batch
        item.style.animationDelay = ((index % BATCH_SIZE) * 40) + 'ms';

        return item;
    }

    function appendBatch() {
        if (!grid || isLoading || batchCounter >= MAX_BATCHES) {
            if (batchCounter >= MAX_BATCHES && loader) {
                loader.textContent = 'You have reached the end of the gallery.';
                loader.style.color = 'var(--text-tertiary)';
                loader.style.fontSize = 'var(--fs-sm)';
            }
            return;
        }

        isLoading = true;
        if (loader) loader.style.display = 'flex';

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < BATCH_SIZE; i++) {
            fragment.appendChild(buildCard(i));
        }
        grid.appendChild(fragment);

        batchCounter++;
        isLoading = false;
    }

    // ---------------------------------------------------------------------
    // Intersection Observer for infinity scroll
    // ---------------------------------------------------------------------
    function setupObserver() {
        if (!sentinel) return;

        if (!('IntersectionObserver' in window)) {
            // Fallback: load all batches on legacy browsers
            for (let i = 0; i < MAX_BATCHES; i++) appendBatch();
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    appendBatch();
                }
            });
        }, {
            root: null,
            rootMargin: '300px 0px',
            threshold: 0,
        });

        observer.observe(sentinel);
    }

    // ---------------------------------------------------------------------
    // Smooth anchor scroll (offset for sticky topbar)
    // ---------------------------------------------------------------------
    function setupSmoothAnchors() {
        const links = document.querySelectorAll('a[href^="#"]');
        const topbarHeight = 64;

        links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                const targetId = link.getAttribute('href');
                if (!targetId || targetId === '#') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                event.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - topbarHeight - 16;
                window.scrollTo({ top: top, behavior: 'smooth' });
            });
        });
    }

    // ---------------------------------------------------------------------
    // Topbar scroll state (subtle border on scroll)
    // ---------------------------------------------------------------------
    function setupTopbarShadow() {
        const topbar = document.querySelector('.topbar');
        if (!topbar) return;

        function update() {
            if (window.scrollY > 8) {
                topbar.classList.add('topbar-scrolled');
            } else {
                topbar.classList.remove('topbar-scrolled');
            }
        }

        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    // ---------------------------------------------------------------------
    // Init
    // ---------------------------------------------------------------------
    function init() {
        // Seed gallery with first batch immediately so users see content above the fold area
        appendBatch();

        setupObserver();
        setupSmoothAnchors();
        setupTopbarShadow();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
