/* =========================================================================
   AIGen — Customer Studio Logic
   Role guard, panel switching, video/image generator mock flow,
   credit accounting, settings tabs, logout
   ========================================================================= */

(function () {
    'use strict';

    // ---------------------------------------------------------------------
    // Role guard — redirect to login if not customer
    // ---------------------------------------------------------------------
    if (!window.AIGenAuth || !window.AIGenAuth.requireRole('customer')) {
        return;
    }

    const session = window.AIGenAuth.getSession();
    let credits = session.credits || 240;

    // ---------------------------------------------------------------------
    // Config
    // ---------------------------------------------------------------------
    const COST_PER_GENERATION = 10;
    const GENERATION_DELAY_MS = 1500;
    const PICSUM_BASE = 'https://picsum.photos/seed';

    const PANEL_META = {
        video:   { title: 'Video Generator', sub: 'Cinematic clips from prompt' },
        image:   { title: 'Image Generator', sub: 'Photoreal, painterly, or vector' },
        setting: { title: 'Settings',        sub: 'Profile, plan, and billing' },
    };

    // ---------------------------------------------------------------------
    // Seed data (existing generations to populate the grid on first paint)
    // ---------------------------------------------------------------------
    const SEED_VIDEO = [
        { prompt: 'Neon city street at night, slow dolly forward', duration: '0:05' },
        { prompt: 'Aerial seascape at golden hour, slow pan', duration: '0:08' },
        { prompt: 'Studio portrait with light-painting, 60fps', duration: '0:03' },
        { prompt: 'Cyberpunk alley, rain, looping', duration: '0:12' },
    ];

    const SEED_IMAGE = [
        { prompt: 'Editorial fashion portrait, pastel grading' },
        { prompt: 'Watercolor mountain range at dawn' },
        { prompt: 'Architectural minimalism, brutalist façade' },
        { prompt: 'Botanical macro, dewdrops on leaf' },
        { prompt: 'Abstract geometric mesh, violet light' },
        { prompt: '85mm portrait, sharp focus, neon rim light' },
    ];

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------
    function uid() {
        return 'g-' + Math.random().toString(36).slice(2, 10);
    }

    function getCreditAmountEl() {
        return document.getElementById('credit-amount');
    }

    function setCredits(value) {
        credits = Math.max(0, value);
        const el = getCreditAmountEl();
        if (el) el.textContent = credits.toLocaleString();
        window.AIGenAuth.updateCredits(credits);
    }

    function buildVideoCard(prompt, duration, animDelay) {
        const id = uid();
        const card = document.createElement('article');
        card.className = 'output-card';
        card.dataset.type = 'video';
        if (animDelay) card.style.animationDelay = animDelay + 'ms';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = `${PICSUM_BASE}/${id}/640/800`;
        img.alt = prompt;

        const play = document.createElement('span');
        play.className = 'output-play';
        play.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l11 7-11 7V5z"/></svg>';

        const dur = document.createElement('span');
        dur.className = 'output-duration';
        dur.textContent = duration;

        const meta = document.createElement('div');
        meta.className = 'output-meta';
        const promptEl = document.createElement('p');
        promptEl.className = 'output-meta-prompt';
        promptEl.textContent = prompt;
        meta.appendChild(promptEl);

        card.appendChild(img);
        card.appendChild(play);
        card.appendChild(dur);
        card.appendChild(meta);

        return card;
    }

    function buildImageCard(prompt, animDelay) {
        const id = uid();
        const card = document.createElement('article');
        card.className = 'output-card';
        card.dataset.type = 'image';
        if (animDelay) card.style.animationDelay = animDelay + 'ms';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = `${PICSUM_BASE}/${id}/640/800`;
        img.alt = prompt;

        const meta = document.createElement('div');
        meta.className = 'output-meta';
        const promptEl = document.createElement('p');
        promptEl.className = 'output-meta-prompt';
        promptEl.textContent = prompt;
        meta.appendChild(promptEl);

        card.appendChild(img);
        card.appendChild(meta);

        return card;
    }

    function buildShimmerCard(label) {
        const card = document.createElement('div');
        card.className = 'output-card-loading';

        const spinner = document.createElement('div');
        spinner.className = 'output-card-loading-spinner';

        const text = document.createElement('span');
        text.textContent = label || 'Generating...';

        card.appendChild(spinner);
        card.appendChild(text);

        return card;
    }

    // ---------------------------------------------------------------------
    // Renderers
    // ---------------------------------------------------------------------
    function renderUserChip() {
        if (session.name)   document.getElementById('user-name').textContent   = session.name;
        if (session.avatar) document.getElementById('user-avatar').textContent = session.avatar;
        const planEl = document.getElementById('user-plan');
        if (planEl && session.plan) planEl.textContent = session.plan + ' plan';
    }

    function seedVideoOutput() {
        const grid = document.getElementById('video-output');
        if (!grid) return;
        grid.innerHTML = '';
        SEED_VIDEO.forEach(function (v, i) {
            grid.appendChild(buildVideoCard(v.prompt, v.duration, i * 60));
        });
    }

    function seedImageOutput() {
        const grid = document.getElementById('image-output');
        if (!grid) return;
        grid.innerHTML = '';
        SEED_IMAGE.forEach(function (v, i) {
            grid.appendChild(buildImageCard(v.prompt, i * 60));
        });
    }

    // ---------------------------------------------------------------------
    // Generation flows
    // ---------------------------------------------------------------------
    function generateVideo(event) {
        event.preventDefault();
        if (credits < COST_PER_GENERATION) {
            alert('Not enough credits. Please upgrade your plan.');
            return;
        }

        const prompt = document.getElementById('video-prompt').value.trim() || 'Untitled video generation';
        const duration = document.getElementById('video-duration').value;
        const grid = document.getElementById('video-output');
        const submitBtn = event.target.querySelector('button[type="submit"]');

        if (!grid) return;

        // Insert shimmer at top
        const shimmer = buildShimmerCard('Rendering ' + duration + 's clip...');
        grid.insertBefore(shimmer, grid.firstChild);

        setCredits(credits - COST_PER_GENERATION);
        if (submitBtn) submitBtn.disabled = true;

        setTimeout(function () {
            const card = buildVideoCard(prompt, '0:0' + duration);
            grid.replaceChild(card, shimmer);
            if (submitBtn) submitBtn.disabled = false;
        }, GENERATION_DELAY_MS);
    }

    function generateImage(event) {
        event.preventDefault();

        const batchInput = document.getElementById('image-batch');
        const batch = batchInput ? parseInt(batchInput.value, 10) || 1 : 1;
        const totalCost = COST_PER_GENERATION * batch;

        if (credits < totalCost) {
            alert('Not enough credits for a batch of ' + batch + '. Please upgrade your plan.');
            return;
        }

        const prompt = document.getElementById('image-prompt').value.trim() || 'Untitled image generation';
        const grid = document.getElementById('image-output');
        const submitBtn = event.target.querySelector('button[type="submit"]');

        if (!grid) return;

        // Insert N shimmers
        const shimmers = [];
        for (let i = 0; i < batch; i++) {
            const sh = buildShimmerCard('Rendering image ' + (i + 1) + ' of ' + batch + '...');
            grid.insertBefore(sh, grid.firstChild);
            shimmers.unshift(sh); // reverse so we replace in insertion order
        }

        setCredits(credits - totalCost);
        if (submitBtn) submitBtn.disabled = true;

        setTimeout(function () {
            shimmers.forEach(function (sh) {
                const card = buildImageCard(prompt);
                grid.replaceChild(card, sh);
            });
            if (submitBtn) submitBtn.disabled = false;
        }, GENERATION_DELAY_MS);
    }

    // ---------------------------------------------------------------------
    // Panel switching
    // ---------------------------------------------------------------------
    function switchPanel(target) {
        const panels = document.querySelectorAll('[data-panel]');
        const buttons = document.querySelectorAll('.nav-btn[data-target]');

        panels.forEach(function (p) {
            p.hidden = p.getAttribute('data-panel') !== target;
        });

        buttons.forEach(function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-target') === target);
        });

        const meta = PANEL_META[target];
        if (meta) {
            document.getElementById('page-title').textContent = meta.title;
            document.getElementById('page-sub').textContent   = meta.sub;
        }

        // Lazy-seed image output on first activation
        if (target === 'image' && !switchPanel.imageSeeded) {
            seedImageOutput();
            switchPanel.imageSeeded = true;
        }
    }

    // ---------------------------------------------------------------------
    // Settings tabs
    // ---------------------------------------------------------------------
    function setupSettingsTabs() {
        const buttons = document.querySelectorAll('.tab-btn[data-tab]');
        const panels = document.querySelectorAll('.tab-panel[data-tab-panel]');

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const target = btn.getAttribute('data-tab');
                buttons.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
                panels.forEach(function (p) {
                    p.classList.toggle('is-active', p.getAttribute('data-tab-panel') === target);
                });
            });
        });
    }

    // ---------------------------------------------------------------------
    // Init
    // ---------------------------------------------------------------------
    function init() {
        renderUserChip();
        setCredits(credits);
        seedVideoOutput();

        // Wire sidebar nav
        document.querySelectorAll('.nav-btn[data-target]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchPanel(btn.getAttribute('data-target'));
            });
        });

        // Wire generator forms
        const videoForm = document.getElementById('video-form');
        if (videoForm) videoForm.addEventListener('submit', generateVideo);

        const imageForm = document.getElementById('image-form');
        if (imageForm) imageForm.addEventListener('submit', generateImage);

        setupSettingsTabs();

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
