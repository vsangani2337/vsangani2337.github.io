/*=========================================
  HERO PARTICLES  •  subtle, performant,
  motion-preference aware
=========================================*/

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (typeof tsParticles === 'undefined') return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var staticLayer = document.getElementById('particles-js');
        if (staticLayer) staticLayer.style.display = 'none';
        return;
    }

    var small = window.innerWidth < 768;
    var coarse = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;

    var result = tsParticles.load('particles-js', {
        background: {
            color: { value: 'transparent' }
        },
        fullScreen: { enable: false },
        detectRetina: true,
        pauseOnBlur: true,
        fpsLimit: small ? 40 : 60,
        particles: {
            number: {
                value: small ? 22 : 52,
                density: { enable: true, area: small ? 1100 : 820 }
            },
            color: {
                value: ['#4F46E5', '#06B6D4', '#8B5CF6']
            },
            shape: { type: 'circle' },
            opacity: {
                value: { min: 0.15, max: 0.45 }
            },
            size: {
                value: { min: 1, max: small ? 3.5 : 4.5 }
            },
            move: {
                enable: true,
                speed: small ? 0.6 : 0.9,
                direction: 'none',
                random: true,
                straight: false,
                outModes: { default: 'out' }
            },
            links: {
                enable: !small,
                distance: 160,
                color: '#6366F1',
                opacity: 0.16,
                width: 1
            }
        },
        interactivity: {
            events: {
                onHover: {
                    enable: !coarse,
                    mode: 'grab'
                },
                onClick: { enable: false }
            },
            modes: {
                grab: {
                    distance: 150,
                    links: { opacity: 0.35 }
                }
            }
        }
    });

    if (result && typeof result.catch === 'function') {
        result.catch(function () {
            /* Particles are decorative — never block the page if the CDN fails */
            var layer = document.getElementById('particles-js');
            if (layer) layer.style.display = 'none';
        });
    }
});
