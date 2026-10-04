/*=========================================
  SCROLL REVEAL  •  sole owner of .reveal
  Staggers siblings, reveals on intersect,
  then removes the reveal class so component
  hover transforms are never blocked.
=========================================*/

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var elements = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!elements.length) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || reduced) {
        elements.forEach(function (el) {
            el.classList.add('is-visible');
            el.classList.remove('reveal');
        });
        return;
    }

    /* Stagger children that share a parent */
    var groups = new Map();
    elements.forEach(function (el) {
        var key = el.parentElement;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(el);
    });

    groups.forEach(function (list) {
        if (list.length < 2) return;
        list.forEach(function (el, i) {
            el.style.setProperty('--d', Math.min(i * 0.085, 0.5) + 's');
        });
    });

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            var el = entry.target;
            revealObserver.unobserve(el);
            el.classList.add('is-visible');

            /* Drop the reveal hook once the transition has finished */
            var delay = parseFloat(getComputedStyle(el).transitionDelay) || 0;
            window.setTimeout(function () {
                el.classList.remove('reveal');
                el.style.removeProperty('--d');
            }, delay * 1000 + 900);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -45px 0px'
    });

    elements.forEach(function (el) {
        revealObserver.observe(el);
    });
});
