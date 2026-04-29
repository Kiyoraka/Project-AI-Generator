/* =========================================================================
   AIGen — Mobile Admin
   Role guard, tab nav, mobile-tuned renderers (stat grid, activity,
   bar/donut charts, creators, orders), logout
   ========================================================================= */

(function () {
    'use strict';

    if (!window.AIGenAuth || !window.AIGenAuth.requireRole('admin')) return;
    const session = window.AIGenAuth.getSession();

    const STATS = [
        { label: 'Users',      value: '12.4k',  tone: 'violet',  trend: '+12.4%' },
        { label: 'Generations', value: '382k',  tone: 'cyan',    trend: '+28.7%' },
        { label: 'Revenue',    value: '$48k',   tone: 'emerald', trend: '+18.2%' },
        { label: 'Active',     value: '4.2k',   tone: 'fuchsia', trend: '+5.1%' },
    ];

    const ACTIVITY = [
        { user: 'alice@studio.io',    initials: 'AS', action: 'Generated · 2m',  status: 'paid' },
        { user: 'bobby.fx',           initials: 'BF', action: 'Subscribed · 8m', status: 'paid' },
        { user: 'cassia@labs.dev',    initials: 'CL', action: 'Generated · 14m', status: 'paid' },
        { user: 'devon@onsight.com',  initials: 'DO', action: 'Refunded · 32m',  status: 'refunded' },
        { user: 'echo.maker',         initials: 'EM', action: 'Generated · 41m', status: 'paid' },
        { user: 'finch@studio.io',    initials: 'FS', action: 'Cancelled · 1h',  status: 'pending' },
        { user: 'grace.r',            initials: 'GR', action: 'Subscribed · 1h', status: 'paid' },
        { user: 'haru@kyoto.dev',     initials: 'HK', action: 'Generated · 2h',  status: 'paid' },
    ];

    const REVENUE_BARS = [
        { label: 'M', value: 4200 }, { label: 'T', value: 5100 },
        { label: 'W', value: 6800 }, { label: 'T', value: 5400 },
        { label: 'F', value: 8200 }, { label: 'S', value: 9900 },
        { label: 'S', value: 8600 },
    ];

    const DONUT_SEGMENTS = [
        { label: 'Images', value: 58, color: 'var(--accent-violet)' },
        { label: 'Videos', value: 32, color: 'var(--accent-fuchsia)' },
        { label: 'Audio',  value: 10, color: 'var(--accent-cyan)' },
    ];

    const TOP_CREATORS = [
        { name: 'Aria Makino',    handle: '@aria.makes',  initials: 'AM', generations: 1842, revenue: '$248' },
        { name: 'Kenji Nakamura', handle: '@kenji.fx',    initials: 'KN', generations: 1604, revenue: '$199' },
        { name: 'Nora Vass',      handle: '@nora.studio', initials: 'NV', generations: 1289, revenue: '$87'  },
        { name: 'Yuri Solas',     handle: '@yuri.lab',    initials: 'YS', generations: 1107, revenue: '$87'  },
    ];

    const ORDERS = [
        { id: 'AIG-10421', customer: 'Alice Studio',   plan: 'Studio', amount: '$99.00', date: 'Apr 28', status: 'paid' },
        { id: 'AIG-10420', customer: 'Bobby FX',       plan: 'Pro',    amount: '$29.00', date: 'Apr 28', status: 'paid' },
        { id: 'AIG-10419', customer: 'Cassia Labs',    plan: 'Pro',    amount: '$29.00', date: 'Apr 28', status: 'paid' },
        { id: 'AIG-10418', customer: 'Devon Onsight',  plan: 'Pro',    amount: '$29.00', date: 'Apr 27', status: 'refunded' },
        { id: 'AIG-10417', customer: 'Echo Maker',     plan: 'Studio', amount: '$99.00', date: 'Apr 27', status: 'paid' },
        { id: 'AIG-10416', customer: 'Finch Studio',   plan: 'Studio', amount: '$99.00', date: 'Apr 26', status: 'pending' },
        { id: 'AIG-10415', customer: 'Grace Reyes',    plan: 'Studio', amount: '$99.00', date: 'Apr 26', status: 'paid' },
        { id: 'AIG-10414', customer: 'Haru Kyoto',     plan: 'Pro',    amount: '$29.00', date: 'Apr 25', status: 'paid' },
    ];

    const PANEL_META = {
        main:     { title: 'Main',    sub: 'Operations overview' },
        analysis: { title: 'Analyze', sub: 'Trends and breakdowns' },
        order:    { title: 'Orders',  sub: 'Subscriptions + credits' },
        me:       { title: 'Me',      sub: 'Account settings' },
    };

    function renderUser() {
        if (session.name)   document.getElementById('me-name').textContent = session.name;
        if (session.email)  document.getElementById('me-email').textContent = session.email;
        if (session.avatar) {
            document.getElementById('user-avatar').textContent = session.avatar;
            document.getElementById('me-avatar').textContent = session.avatar;
        }
    }

    function renderStats() {
        const container = document.getElementById('stat-stack');
        if (!container) return;
        container.innerHTML = STATS.map(function (s) {
            return `
                <article class="m-stat-card" data-tone="${s.tone}">
                    <p class="m-stat-label">${s.label}</p>
                    <p class="m-stat-value">${s.value}</p>
                    <p class="m-stat-trend">↑ ${s.trend}</p>
                </article>
            `;
        }).join('');
    }

    function renderActivity() {
        const container = document.getElementById('activity-list');
        if (!container) return;
        container.innerHTML = ACTIVITY.map(function (row) {
            return `
                <div class="m-activity-row">
                    <span class="m-activity-avatar">${row.initials}</span>
                    <div class="m-activity-info">
                        <p class="m-activity-user">${row.user}</p>
                        <p class="m-activity-meta">${row.action}</p>
                    </div>
                    <span class="pill status-${row.status} m-activity-status">${row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span>
                </div>
            `;
        }).join('');
    }

    function renderBarChart() {
        const container = document.getElementById('bar-chart');
        if (!container) return;
        const max = Math.max.apply(null, REVENUE_BARS.map(function (b) { return b.value; }));
        container.innerHTML = REVENUE_BARS.map(function (b) {
            const pct = Math.round((b.value / max) * 100);
            return `
                <div class="m-bar-col">
                    <div class="m-bar-track">
                        <div class="m-bar-fill" style="--h: ${pct}%; height: ${pct}%;"></div>
                    </div>
                    <span class="m-bar-label">${b.label}</span>
                </div>
            `;
        }).join('');
    }

    function renderDonut() {
        const svg = document.getElementById('donut-chart');
        const legend = document.getElementById('donut-legend');
        if (!svg || !legend) return;
        const radius = 50;
        const c = 2 * Math.PI * radius;
        let offset = 0;
        const arcs = DONUT_SEGMENTS.map(function (seg) {
            const length = (seg.value / 100) * c;
            const arc = `<circle class="donut-arc" cx="60" cy="60" r="${radius}" stroke="${seg.color}" stroke-dasharray="${length} ${c}" stroke-dashoffset="${-offset}" />`;
            offset += length;
            return arc;
        }).join('');
        svg.innerHTML = `<circle class="donut-bg" cx="60" cy="60" r="${radius}" />${arcs}`;
        legend.innerHTML = DONUT_SEGMENTS.map(function (seg) {
            return `
                <div class="donut-legend-item">
                    <span class="donut-legend-swatch" style="background: ${seg.color};"></span>
                    <span class="donut-legend-label">${seg.label}</span>
                    <span class="donut-legend-value">${seg.value}%</span>
                </div>
            `;
        }).join('');
    }

    function renderCreators() {
        const container = document.getElementById('creators-list');
        if (!container) return;
        container.innerHTML = TOP_CREATORS.map(function (c) {
            return `
                <div class="m-creator-row">
                    <span class="m-creator-avatar">${c.initials}</span>
                    <div class="m-creator-info">
                        <p class="m-creator-name">${c.name}</p>
                        <p class="m-creator-handle">${c.handle}</p>
                    </div>
                    <div class="m-creator-stats">
                        <p class="m-creator-revenue">${c.revenue}</p>
                        <p class="m-creator-gens">${c.generations.toLocaleString()} gens</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderOrders(filter) {
        const container = document.getElementById('order-list');
        if (!container) return;
        const list = filter && filter !== 'all'
            ? ORDERS.filter(function (o) { return o.status === filter; })
            : ORDERS;
        if (list.length === 0) {
            container.innerHTML = `<div class="m-order-card" style="justify-content: center; color: var(--text-tertiary);">No orders match this filter.</div>`;
            return;
        }
        container.innerHTML = list.map(function (o) {
            return `
                <div class="m-order-card">
                    <div class="m-order-info">
                        <p class="m-order-id">${o.id}</p>
                        <p class="m-order-customer">${o.customer}</p>
                        <p class="m-order-meta">${o.plan} · ${o.date}</p>
                    </div>
                    <div class="m-order-right">
                        <p class="m-order-amount">${o.amount}</p>
                        <span class="pill status-${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

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
        if (target === 'analysis' && !switchPanel.analysisRendered) {
            renderBarChart();
            renderDonut();
            renderCreators();
            switchPanel.analysisRendered = true;
        }
        if (target === 'order' && !switchPanel.orderRendered) {
            renderOrders('all');
            switchPanel.orderRendered = true;
        }
    }

    function setupOrderFilters() {
        const pills = document.querySelectorAll('.m-filter-row .pill[data-filter]');
        pills.forEach(function (p) {
            p.addEventListener('click', function () {
                pills.forEach(function (q) { q.classList.remove('is-active'); });
                p.classList.add('is-active');
                renderOrders(p.getAttribute('data-filter'));
            });
        });
    }

    function init() {
        renderUser();
        renderStats();
        renderActivity();

        document.querySelectorAll('.m-tab[data-target]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchPanel(btn.getAttribute('data-target'));
            });
        });

        setupOrderFilters();

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
