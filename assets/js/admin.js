/* =========================================================================
   AIGen — Admin Dashboard Logic
   Role guard, panel switching, mock data renderers (stats, activity,
   bar chart, donut chart, orders, top creators), filters, tabs, logout
   ========================================================================= */

(function () {
    'use strict';

    // ---------------------------------------------------------------------
    // Role guard — redirect to login if not admin
    // ---------------------------------------------------------------------
    if (!window.AIGenAuth || !window.AIGenAuth.requireRole('admin')) {
        return;
    }

    const session = window.AIGenAuth.getSession();

    // ---------------------------------------------------------------------
    // Mock data
    // ---------------------------------------------------------------------
    const STATS = [
        {
            label: 'Total Users',
            value: '12,481',
            tone:  'violet',
            trend: { dir: 'up', amount: '+12.4%', meta: 'vs last week' },
            icon:  '<path d="M14 7a4 4 0 11-8 0 4 4 0 018 0zM3 19a7 7 0 0114 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
        },
        {
            label: 'Generations (24h)',
            value: '382,914',
            tone:  'cyan',
            trend: { dir: 'up', amount: '+28.7%', meta: 'vs yesterday' },
            icon:  '<path d="M5 4l14 8-14 8V4z" fill="currentColor"/>',
        },
        {
            label: 'Revenue (MTD)',
            value: '$48,290',
            tone:  'emerald',
            trend: { dir: 'up', amount: '+18.2%', meta: 'vs last month' },
            icon:  '<path d="M5 17V8h10v9M9 8V5h6v3" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="10" cy="13" r="2" stroke="currentColor" stroke-width="1.6"/>',
        },
        {
            label: 'Active Subscriptions',
            value: '4,206',
            tone:  'fuchsia',
            trend: { dir: 'up', amount: '+5.1%', meta: 'this week' },
            icon:  '<path d="M4 6h12v8H4zM4 10h12M8 14v2M12 14v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
        },
    ];

    const ACTIVITY = [
        { user: 'alice@studio.io',     initials: 'AS', action: 'Generated',   resource: '4K cinematic clip',  when: '2 min ago',  status: 'paid' },
        { user: 'bobby.fx@gmail.com',  initials: 'BF', action: 'Subscribed',  resource: 'Pro plan',           when: '8 min ago',  status: 'paid' },
        { user: 'cassia@labs.dev',     initials: 'CL', action: 'Generated',   resource: 'Portrait series',    when: '14 min ago', status: 'paid' },
        { user: 'devon@onsight.com',   initials: 'DO', action: 'Refunded',    resource: 'Pro plan',           when: '32 min ago', status: 'refunded' },
        { user: 'echo.maker@aigen.ai', initials: 'EM', action: 'Generated',   resource: 'Looping animation',  when: '41 min ago', status: 'paid' },
        { user: 'finch@studio.io',     initials: 'FS', action: 'Cancelled',   resource: 'Studio plan',        when: '1 hr ago',   status: 'pending' },
        { user: 'grace.r@hello.world', initials: 'GR', action: 'Subscribed',  resource: 'Studio plan',        when: '1 hr ago',   status: 'paid' },
        { user: 'haru@kyoto.dev',      initials: 'HK', action: 'Generated',   resource: 'Image set (12)',     when: '2 hr ago',   status: 'paid' },
        { user: 'ira@solo.fm',         initials: 'IS', action: 'Upgraded',    resource: 'Free -> Pro',        when: '3 hr ago',   status: 'paid' },
        { user: 'june@ndelights.co',   initials: 'JN', action: 'Generated',   resource: 'Video clip (8s)',    when: '4 hr ago',   status: 'paid' },
        { user: 'kenji@maker.tools',   initials: 'KM', action: 'Generated',   resource: 'Hero illustration',  when: '5 hr ago',   status: 'paid' },
        { user: 'lumen@gallery.ai',    initials: 'LG', action: 'Failed',      resource: '4K render',          when: '6 hr ago',   status: 'failed' },
    ];

    const REVENUE_BARS = [
        { label: 'Mon', value: 4200 },
        { label: 'Tue', value: 5100 },
        { label: 'Wed', value: 6800 },
        { label: 'Thu', value: 5400 },
        { label: 'Fri', value: 8200 },
        { label: 'Sat', value: 9900 },
        { label: 'Sun', value: 8600 },
    ];

    const DONUT_SEGMENTS = [
        { label: 'Images', value: 58, color: 'var(--accent-violet)' },
        { label: 'Videos', value: 32, color: 'var(--accent-fuchsia)' },
        { label: 'Audio',  value: 10, color: 'var(--accent-cyan)' },
    ];

    const TOP_CREATORS = [
        { name: 'Aria Makino',   handle: '@aria.makes',  plan: 'Studio', generations: 1842, revenue: '$248' },
        { name: 'Kenji Nakamura', handle: '@kenji.fx',   plan: 'Studio', generations: 1604, revenue: '$199' },
        { name: 'Nora Vass',     handle: '@nora.studio', plan: 'Pro',    generations: 1289, revenue: '$87'  },
        { name: 'Yuri Solas',    handle: '@yuri.lab',    plan: 'Pro',    generations: 1107, revenue: '$87'  },
        { name: 'Quinn Vesper',  handle: '@vesper',      plan: 'Pro',    generations: 942,  revenue: '$87'  },
        { name: 'Lumen Cassia',  handle: '@lumen.ai',    plan: 'Free',   generations: 612,  revenue: '$0'   },
    ];

    const ORDERS = [
        { id: 'AIG-10421', customer: 'Alice Studio',   plan: 'Studio', amount: '$99.00', date: 'Apr 28, 2026', status: 'paid'     },
        { id: 'AIG-10420', customer: 'Bobby FX',       plan: 'Pro',    amount: '$29.00', date: 'Apr 28, 2026', status: 'paid'     },
        { id: 'AIG-10419', customer: 'Cassia Labs',    plan: 'Pro',    amount: '$29.00', date: 'Apr 28, 2026', status: 'paid'     },
        { id: 'AIG-10418', customer: 'Devon Onsight',  plan: 'Pro',    amount: '$29.00', date: 'Apr 27, 2026', status: 'refunded' },
        { id: 'AIG-10417', customer: 'Echo Maker',     plan: 'Studio', amount: '$99.00', date: 'Apr 27, 2026', status: 'paid'     },
        { id: 'AIG-10416', customer: 'Finch Studio',   plan: 'Studio', amount: '$99.00', date: 'Apr 26, 2026', status: 'pending'  },
        { id: 'AIG-10415', customer: 'Grace Reyes',    plan: 'Studio', amount: '$99.00', date: 'Apr 26, 2026', status: 'paid'     },
        { id: 'AIG-10414', customer: 'Haru Kyoto',     plan: 'Pro',    amount: '$29.00', date: 'Apr 25, 2026', status: 'paid'     },
        { id: 'AIG-10413', customer: 'Ira Solo',       plan: 'Pro',    amount: '$29.00', date: 'Apr 25, 2026', status: 'paid'     },
        { id: 'AIG-10412', customer: 'June Ndelights', plan: 'Pro',    amount: '$29.00', date: 'Apr 24, 2026', status: 'paid'     },
        { id: 'AIG-10411', customer: 'Kenji Maker',    plan: 'Studio', amount: '$99.00', date: 'Apr 23, 2026', status: 'paid'     },
        { id: 'AIG-10410', customer: 'Lumen Gallery',  plan: 'Pro',    amount: '$29.00', date: 'Apr 23, 2026', status: 'pending'  },
    ];

    const PANEL_META = {
        main:     { title: 'Main',     sub: 'Operations overview' },
        analysis: { title: 'Analysis', sub: 'Trends and breakdowns' },
        order:    { title: 'Order',    sub: 'Subscriptions and credit purchases' },
        setting:  { title: 'Setting',  sub: 'Platform configuration' },
    };

    // ---------------------------------------------------------------------
    // Renderers
    // ---------------------------------------------------------------------
    function renderUserChip() {
        if (session.name)   document.getElementById('user-name').textContent   = session.name;
        if (session.email)  document.getElementById('user-email').textContent  = session.email;
        if (session.avatar) document.getElementById('user-avatar').textContent = session.avatar;
    }

    function renderStats() {
        const grid = document.getElementById('stat-grid');
        if (!grid) return;
        grid.innerHTML = STATS.map(function (s) {
            return `
                <article class="stat-card" data-tone="${s.tone}">
                    <header class="stat-card-head">
                        <span class="stat-card-label">${s.label}</span>
                        <span class="stat-card-icon">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">${s.icon}</svg>
                        </span>
                    </header>
                    <p class="stat-card-value">${s.value}</p>
                    <p class="stat-card-trend ${s.trend.dir}">
                        <span class="stat-card-trend-arrow">${s.trend.dir === 'up' ? '↑' : s.trend.dir === 'down' ? '↓' : '→'}</span>
                        ${s.trend.amount}
                        <span class="stat-card-meta">${s.trend.meta}</span>
                    </p>
                </article>
            `;
        }).join('');
    }

    function renderActivity() {
        const tbody = document.getElementById('activity-rows');
        if (!tbody) return;
        tbody.innerHTML = ACTIVITY.map(function (row) {
            return `
                <tr>
                    <td>
                        <div class="user-cell">
                            <span class="user-cell-avatar">${row.initials}</span>
                            <span>${row.user}</span>
                        </div>
                    </td>
                    <td class="col-strong">${row.action}</td>
                    <td>${row.resource}</td>
                    <td>${row.when}</td>
                    <td><span class="pill status-${row.status}">${row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span></td>
                </tr>
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
                <div class="bar-col">
                    <span class="bar-value">$${(b.value / 1000).toFixed(1)}k</span>
                    <div class="bar-track">
                        <div class="bar-fill" style="--h: ${pct}%; height: ${pct}%;"></div>
                    </div>
                    <span class="bar-label">${b.label}</span>
                </div>
            `;
        }).join('');
    }

    function renderDonut() {
        const svg = document.getElementById('donut-chart');
        const legend = document.getElementById('donut-legend');
        if (!svg || !legend) return;

        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        let offset = 0;

        const arcs = DONUT_SEGMENTS.map(function (seg) {
            const length = (seg.value / 100) * circumference;
            const arc = `
                <circle class="donut-arc"
                        cx="60" cy="60" r="${radius}"
                        stroke="${seg.color}"
                        stroke-dasharray="${length} ${circumference}"
                        stroke-dashoffset="${-offset}" />
            `;
            offset += length;
            return arc;
        }).join('');

        svg.innerHTML = `
            <circle class="donut-bg" cx="60" cy="60" r="${radius}" />
            ${arcs}
        `;

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

    function renderTopCreators() {
        const tbody = document.getElementById('creators-rows');
        if (!tbody) return;
        tbody.innerHTML = TOP_CREATORS.map(function (c) {
            const initials = c.name.split(' ').map(function (n) { return n[0]; }).join('').slice(0, 2);
            const planClass = c.plan === 'Studio' ? 'pill-violet' : c.plan === 'Pro' ? 'pill-info' : 'pill';
            return `
                <tr>
                    <td>
                        <div class="user-cell">
                            <span class="user-cell-avatar">${initials}</span>
                            <div>
                                <div class="col-strong">${c.name}</div>
                                <div class="text-xs text-muted">${c.handle}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="pill ${planClass}">${c.plan}</span></td>
                    <td class="col-strong">${c.generations.toLocaleString()}</td>
                    <td class="order-amount">${c.revenue}</td>
                </tr>
            `;
        }).join('');
    }

    function renderOrders(filter) {
        const tbody = document.getElementById('order-rows');
        if (!tbody) return;
        const list = filter && filter !== 'all'
            ? ORDERS.filter(function (o) { return o.status === filter; })
            : ORDERS;
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-muted" style="text-align: center; padding: var(--space-7);">No orders match this filter.</td></tr>`;
            return;
        }
        tbody.innerHTML = list.map(function (o) {
            return `
                <tr>
                    <td><span class="order-id">${o.id}</span></td>
                    <td class="col-strong">${o.customer}</td>
                    <td>${o.plan}</td>
                    <td class="order-amount">${o.amount}</td>
                    <td>${o.date}</td>
                    <td><span class="pill status-${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
                </tr>
            `;
        }).join('');
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

        // Lazy-render heavy panels
        if (target === 'analysis' && !switchPanel.analysisRendered) {
            renderBarChart();
            renderDonut();
            renderTopCreators();
            switchPanel.analysisRendered = true;
        }
        if (target === 'order' && !switchPanel.orderRendered) {
            renderOrders('all');
            switchPanel.orderRendered = true;
        }
    }

    // ---------------------------------------------------------------------
    // Filter pills (orders)
    // ---------------------------------------------------------------------
    function setupOrderFilters() {
        const pills = document.querySelectorAll('.filter-row .pill[data-filter]');
        pills.forEach(function (p) {
            p.addEventListener('click', function () {
                pills.forEach(function (q) { q.classList.remove('is-active'); });
                p.classList.add('is-active');
                renderOrders(p.getAttribute('data-filter'));
            });
        });
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
        renderStats();
        renderActivity();

        // Wire sidebar nav
        document.querySelectorAll('.nav-btn[data-target]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchPanel(btn.getAttribute('data-target'));
            });
        });

        setupOrderFilters();
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
