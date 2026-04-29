/* =========================================================================
   AIGen — Auth Logic
   Hardcoded credentials, sessionStorage role storage, role-routed redirect,
   guard helper for protected pages, logout helper
   ========================================================================= */

(function (global) {
    'use strict';

    // ---------------------------------------------------------------------
    // Hardcoded demo credentials
    // ---------------------------------------------------------------------
    const CREDENTIALS = [
        {
            email:    'admin@gmail.com',
            password: 'admin123',
            role:     'admin',
            name:     'Admin User',
            avatar:   'AU',
        },
        {
            email:    'customer@gmail.com',
            password: 'admin123',
            role:     'customer',
            name:     'Alice Chen',
            avatar:   'AC',
            credits:  240,
            plan:     'Pro',
        },
    ];

    const ROLE_REDIRECTS = {
        admin:    'admin.html',
        customer: 'customer.html',
    };

    const STORAGE_KEYS = {
        ROLE:    'aigen.role',
        NAME:    'aigen.name',
        EMAIL:   'aigen.email',
        AVATAR:  'aigen.avatar',
        CREDITS: 'aigen.credits',
        PLAN:    'aigen.plan',
    };

    // ---------------------------------------------------------------------
    // Core helpers
    // ---------------------------------------------------------------------
    function attemptLogin(email, password) {
        const normalizedEmail = (email || '').trim().toLowerCase();
        return CREDENTIALS.find(function (c) {
            return c.email.toLowerCase() === normalizedEmail && c.password === password;
        }) || null;
    }

    function persistSession(user) {
        sessionStorage.setItem(STORAGE_KEYS.ROLE, user.role);
        sessionStorage.setItem(STORAGE_KEYS.NAME, user.name);
        sessionStorage.setItem(STORAGE_KEYS.EMAIL, user.email);
        sessionStorage.setItem(STORAGE_KEYS.AVATAR, user.avatar);
        if (user.credits !== undefined) {
            sessionStorage.setItem(STORAGE_KEYS.CREDITS, String(user.credits));
        }
        if (user.plan) {
            sessionStorage.setItem(STORAGE_KEYS.PLAN, user.plan);
        }
    }

    function getSession() {
        const role = sessionStorage.getItem(STORAGE_KEYS.ROLE);
        if (!role) return null;
        return {
            role:    role,
            name:    sessionStorage.getItem(STORAGE_KEYS.NAME),
            email:   sessionStorage.getItem(STORAGE_KEYS.EMAIL),
            avatar:  sessionStorage.getItem(STORAGE_KEYS.AVATAR),
            credits: parseInt(sessionStorage.getItem(STORAGE_KEYS.CREDITS), 10) || 0,
            plan:    sessionStorage.getItem(STORAGE_KEYS.PLAN) || 'Free',
        };
    }

    function clearSession() {
        Object.values(STORAGE_KEYS).forEach(function (key) {
            sessionStorage.removeItem(key);
        });
    }

    function requireRole(expected) {
        const role = sessionStorage.getItem(STORAGE_KEYS.ROLE);
        if (role !== expected) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    function logout() {
        clearSession();
        window.location.href = 'index.html';
    }

    function updateCredits(newValue) {
        sessionStorage.setItem(STORAGE_KEYS.CREDITS, String(Math.max(0, newValue)));
    }

    // ---------------------------------------------------------------------
    // Login form wiring (only runs on login.html)
    // ---------------------------------------------------------------------
    function initLoginForm() {
        const form = document.getElementById('login-form');
        if (!form) return;

        // If already authenticated, route immediately
        const existing = getSession();
        if (existing && ROLE_REDIRECTS[existing.role]) {
            window.location.href = ROLE_REDIRECTS[existing.role];
            return;
        }

        const emailInput = form.querySelector('#email');
        const passwordInput = form.querySelector('#password');
        const errorBox = document.getElementById('auth-error');
        const submitBtn = form.querySelector('.auth-submit');
        const demoButtons = document.querySelectorAll('.auth-demo[data-fill]');

        function showError(message) {
            if (!errorBox) return;
            errorBox.textContent = message;
            errorBox.hidden = false;
            // Re-trigger shake animation by toggling animation
            errorBox.style.animation = 'none';
            // eslint-disable-next-line no-unused-expressions
            errorBox.offsetHeight;
            errorBox.style.animation = '';
        }

        function clearError() {
            if (!errorBox) return;
            errorBox.hidden = true;
            errorBox.textContent = '';
        }

        function setLoading(isLoading) {
            if (!submitBtn) return;
            submitBtn.dataset.loading = isLoading ? 'true' : 'false';
            submitBtn.disabled = isLoading;
        }

        // Demo-fill buttons populate the form fields
        demoButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const which = btn.dataset.fill;
                const target = CREDENTIALS.find(function (c) { return c.role === which; });
                if (!target) return;
                emailInput.value = target.email;
                passwordInput.value = target.password;
                clearError();
                emailInput.focus();
            });
        });

        // Clear error message on input
        [emailInput, passwordInput].forEach(function (input) {
            if (input) input.addEventListener('input', clearError);
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                showError('Please enter both email and password.');
                return;
            }

            setLoading(true);
            clearError();

            // Simulate brief auth delay so the loading state is visible
            setTimeout(function () {
                const user = attemptLogin(email, password);
                if (!user) {
                    setLoading(false);
                    showError('Invalid email or password. Try the demo accounts below.');
                    passwordInput.value = '';
                    passwordInput.focus();
                    return;
                }

                persistSession(user);

                const dest = ROLE_REDIRECTS[user.role];
                if (dest) {
                    window.location.href = dest;
                } else {
                    setLoading(false);
                    showError('No dashboard configured for this role.');
                }
            }, 480);
        });
    }

    // ---------------------------------------------------------------------
    // Public API (attached to window so admin.js / customer.js can use)
    // ---------------------------------------------------------------------
    global.AIGenAuth = {
        getSession:    getSession,
        requireRole:   requireRole,
        logout:        logout,
        updateCredits: updateCredits,
    };

    // ---------------------------------------------------------------------
    // Auto-init on DOM ready (only matters on login.html)
    // ---------------------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoginForm);
    } else {
        initLoginForm();
    }
})(window);
