/*=========================================
  THEME MANAGER  •  single owner of dark/light
  Initial value is applied by the inline
  <head> script; this file only wires the
  control, persistence and icon state.
=========================================*/

(function () {
    'use strict';

    var root = document.documentElement;
    var STORAGE_KEY = 'portfolio-theme';
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    var systemDark = window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    function readStored() {
        try {
            var value = localStorage.getItem(STORAGE_KEY);
            return (value === 'dark' || value === 'light') ? value : null;
        } catch (e) {
            return null;
        }
    }

    function writeStored(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (e) { /* private mode — theme still applies for this visit */ }
    }

    function paint(theme) {
        var dark = theme === 'dark';
        root.setAttribute('data-theme', theme);

        var icon = toggle.querySelector('i');
        if (icon) icon.className = dark ? 'ri-sun-line' : 'ri-moon-line';

        toggle.setAttribute('aria-pressed', String(dark));
        toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');

        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', dark ? '#070b16' : '#f5f7fb');
    }

    /* Sync icon / aria with whatever the head script applied */
    paint(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    toggle.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        paint(next);
        writeStored(next);
    });

    /* Follow the OS only while the visitor has not chosen manually */
    if (systemDark && typeof systemDark.addEventListener === 'function') {
        systemDark.addEventListener('change', function (event) {
            if (readStored()) return;
            paint(event.matches ? 'dark' : 'light');
        });
    }
})();
