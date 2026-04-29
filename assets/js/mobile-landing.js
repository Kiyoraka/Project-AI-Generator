/* =========================================================================
   AIGen — Mobile Landing
   2-col masonry gallery infinity scroll + pricing carousel dot sync
   ========================================================================= */

(function () {
    'use strict';

    const BATCH_SIZE = 8;
    const MAX_BATCHES = 6;
    const PICSUM_BASE = 'https://picsum.photos/seed';

    const ASPECT_BUCKETS = [
        { w: 320, h: 400 },
        { w: 320, h: 320 },
        { w: 320, h: 480 },
        { w: 320, h: 240 },
    ];

    const VIDEO_CAPTIONS = [
        'Cinematic 4K · 12s', 'Dolly zoom · neon noir',
        'Slow-motion · 60fps', 'Aerial · golden hour',
    ];

    const IMAGE_CAPTIONS = [
        'Studio portrait', 'Editorial pastel',
        'Watercolor landscape', 'Brutalist façade',
    ];

    let batchCounter = 0;
    let cardCounter = 0;
    let isLoading = false;

    const grid = document.getElementById('m-gallery-grid');
    const loader = document.getElementById('m-gallery-loader');
    const sentinel = document.getElementById('m-gallery-sentinel');

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function buildCard(index) {
        const isVideo = Math.random() < 0.35;
        const aspect = ASPECT_BUCKETS[index % ASPECT_BUCKETS.length];
        const seed = 'aigen-m-' + (cardCounter++) + '-' + Math.floor(Math.random() * 9999);
        const src = PICSUM_BASE + '/' + seed + '/' + aspect.w + '/' + aspect.h;

        const item = document.createElement('div');
        item.className = 'm-gallery-item';
        item.style.animationDelay = ((index % BATCH_SIZE) * 40) + 'ms';

        const tag = document.createElement('span');
        tag.className = 'm-gallery-tag ' + (isVideo ? 'm-gallery-tag-video' : 'm-gallery-tag-image');
        tag.textContent = isVideo ? 'Video' : 'Image';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = isVideo ? pick(VIDEO_CAPTIONS) : pick(IMAGE_CAPTIONS);
        img.src = src;

        item.appendChild(tag);
        item.appendChild(img);
        return item;
    }

    function appendBatch() {
        if (!grid || isLoading || batchCounter >= MAX_BATCHES) {
            if (batchCounter >= MAX_BATCHES && loader) {
                loader.textContent = 'You have reached the end.';
                loader.style.color = 'var(--text-tertiary)';
                loader.style.fontSize = 'var(--m-fs-xs)';
            }
            return;
        }
        isLoading = true;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < BATCH_SIZE; i++) {
            fragment.appendChild(buildCard(i));
        }
        grid.appendChild(fragment);
        batchCounter++;
        isLoading = false;
    }

    function setupObserver() {
        if (!sentinel) return;
        if (!('IntersectionObserver' in window)) {
            for (let i = 0; i < MAX_BATCHES; i++) appendBatch();
            return;
        }
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) appendBatch();
            });
        }, { root: null, rootMargin: '200px 0px', threshold: 0 });
        observer.observe(sentinel);
    }

    function setupSmoothAnchors() {
        const links = document.querySelectorAll('a[href^="#"]');
        const offset = 56 + 16;
        links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                const targetId = link.getAttribute('href');
                if (!targetId || targetId === '#') return;
                const target = document.querySelector(targetId);
                if (!target) return;
                event.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            });
        });
    }

    function setupPricingDots() {
        const carousel = document.querySelector('.m-pricing-carousel');
        const dots = document.querySelectorAll('.m-pricing-dots .m-dot');
        if (!carousel || dots.length === 0) return;

        function updateDots() {
            const cardWidth = carousel.scrollWidth / dots.length;
            const idx = Math.round(carousel.scrollLeft / cardWidth);
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === Math.min(idx, dots.length - 1));
            });
        }

        let scrollTimeout;
        carousel.addEventListener('scroll', function () {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateDots, 60);
        }, { passive: true });
    }

    function init() {
        appendBatch();
        setupObserver();
        setupSmoothAnchors();
        setupPricingDots();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
