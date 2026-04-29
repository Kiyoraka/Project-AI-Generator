/* =========================================================================
   AIGen — Device Route
   Auto-redirect between desktop and mobile based on UA + screen width,
   with localStorage override so user choice wins over auto-detect.
   Loaded synchronously in <head> of every page (desktop and mobile).
   ========================================================================= */

(function () {
    'use strict';

    const STORAGE_KEY = 'aigen.viewOverride';

    function isMobileDevice() {
        return matchMedia('(max-width: 768px)').matches
            || /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    }

    function currentFile() {
        const parts = location.pathname.split('/').filter(Boolean);
        const last = parts[parts.length - 1] || 'index.html';
        return last.includes('.') ? last : 'index.html';
    }

    function isOnMobileRoute() {
        return location.pathname.includes('/mobile/');
    }

    function redirectTo(target) {
        // Avoid redirect loops: only navigate if target differs from current
        if (location.pathname.endsWith(target) || location.href.endsWith(target)) return;
        location.replace(target);
    }

    function autoRoute() {
        const override = localStorage.getItem(STORAGE_KEY);
        const onMobileRoute = isOnMobileRoute();
        const file = currentFile();

        // User explicitly chose desktop, but landed on mobile route -> kick to desktop
        if (override === 'desktop' && onMobileRoute) {
            redirectTo('../' + file);
            return;
        }

        // User explicitly chose mobile, but landed on desktop route -> kick to mobile
        if (override === 'mobile' && !onMobileRoute) {
            redirectTo('mobile/' + file);
            return;
        }

        // No override and detected mobile -> auto-redirect to mobile route
        if (!override && isMobileDevice() && !onMobileRoute) {
            redirectTo('mobile/' + file);
            return;
        }
    }

    // Public API for manual switch links to call
    window.AIGenView = {
        switchToMobile: function () {
            localStorage.setItem(STORAGE_KEY, 'mobile');
            const file = currentFile();
            location.href = isOnMobileRoute() ? location.href : 'mobile/' + file;
        },
        switchToDesktop: function () {
            localStorage.setItem(STORAGE_KEY, 'desktop');
            const file = currentFile();
            location.href = isOnMobileRoute() ? '../' + file : location.href;
        },
        clearOverride: function () {
            localStorage.removeItem(STORAGE_KEY);
        },
        getOverride: function () {
            return localStorage.getItem(STORAGE_KEY);
        }
    };

    autoRoute();
})();
