/*=========================================
  MAIN INTERACTIONS  •  Vivek Sangani Portfolio
  Navigation · scroll UI · counters · modal ·
  form · cursor · parallax · typed hero line
=========================================*/

(function () {
    'use strict';

    var reducedMotion = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : { matches: false };
    var finePointer = window.matchMedia
        ? window.matchMedia('(pointer: fine)')
        : { matches: false };

    /* -------------------------------------------------
       Footer year
    ------------------------------------------------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* -------------------------------------------------
       Header / scroll progress / back to top
    ------------------------------------------------- */
    var header = document.getElementById('site-header');
    var progressBar = document.getElementById('scroll-bar');
    var backToTop = document.getElementById('back-to-top');
    var scrollTicking = false;

    function renderScrollState() {
        var y = window.scrollY || window.pageYOffset || 0;
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;

        if (header) header.classList.toggle('is-scrolled', y > 6);
        if (progressBar) progressBar.style.width = (max > 0 ? Math.min((y / max) * 100, 100) : 0) + '%';
        if (backToTop) backToTop.classList.toggle('is-visible', y > 480);

        scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(renderScrollState);
    }, { passive: true });

    window.addEventListener('resize', renderScrollState, { passive: true });
    renderScrollState();

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        });
    }

    /* -------------------------------------------------
       Mobile navigation
    ------------------------------------------------- */
    var menuBtn = document.getElementById('menu-btn');
    var navbar = document.getElementById('navbar');
    var overlay = document.getElementById('nav-overlay');

    function setMenu(open) {
        if (!navbar || !menuBtn) return;
        navbar.classList.toggle('is-open', open);
        if (overlay) overlay.classList.toggle('is-open', open);
        document.body.classList.toggle('no-scroll', open);

        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        var icon = menuBtn.querySelector('i');
        if (icon) icon.className = open ? 'ri-close-line' : 'ri-menu-3-line';
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', function () {
            setMenu(!navbar.classList.contains('is-open'));
        });
    }

    if (overlay) overlay.addEventListener('click', function () { setMenu(false); });

    if (navbar) {
        navbar.addEventListener('click', function (event) {
            if (event.target.closest('a')) setMenu(false);
        });
    }

    window.addEventListener('resize', function () {
        if (window.innerWidth > 1080) setMenu(false);
    }, { passive: true });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && navbar && navbar.classList.contains('is-open')) {
            setMenu(false);
            menuBtn.focus();
        }
    });

    /* -------------------------------------------------
       Active section indicator
    ------------------------------------------------- */
    (function initActiveNav() {
        if (!navbar || !('IntersectionObserver' in window)) return;

        var links = Array.prototype.slice.call(navbar.querySelectorAll('a[href^="#"]'));
        var map = new Map();

        links.forEach(function (link) {
            var id = link.getAttribute('href').slice(1);
            var section = id ? document.getElementById(id) : null;
            if (section) map.set(section, link);
        });

        if (!map.size) return;

        function setActive(active) {
            links.forEach(function (link) {
                var isActive = link === active;
                link.classList.toggle('active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setActive(map.get(entry.target));
            });
        }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

        map.forEach(function (link, section) { observer.observe(section); });
    })();

    /* -------------------------------------------------
       Animated counters
    ------------------------------------------------- */
    (function initCounters() {
        var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
        if (!counters.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var el = entry.target;
                observer.unobserve(el);

                var to = parseFloat(el.dataset.count);
                var from = parseFloat(el.dataset.from || '0');
                var decimals = parseInt(el.dataset.decimals || '0', 10);
                var suffix = el.dataset.suffix || '';
                var duration = 1400;
                var start = null;

                function format(value) {
                    return value.toFixed(decimals) + suffix;
                }

                function step(now) {
                    if (start === null) start = now;
                    var progress = Math.min((now - start) / duration, 1);
                    var eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = format(from + (to - from) * eased);
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        el.textContent = format(to);
                    }
                }

                el.textContent = format(from);
                window.requestAnimationFrame(step);
            });
        }, { threshold: 0.5 });

        counters.forEach(function (el) { observer.observe(el); });
    })();

    /* -------------------------------------------------
       Typed hero line
    ------------------------------------------------- */
    (function initTyped() {
        var target = document.getElementById('typed-text');
        if (!target) return;

        var phrases = [
            'Computer Engineering Student',
            'Software Developer',
            'Full Stack Developer',
            'Competitive Programmer'
        ];

        if (reducedMotion.matches) {
            target.textContent = phrases[0];
            return;
        }

        var phraseIndex = 0;
        var charIndex = 0;
        var deleting = false;

        function tick() {
            var phrase = phrases[phraseIndex];

            if (!deleting) {
                charIndex += 1;
                target.textContent = phrase.slice(0, charIndex);
                if (charIndex === phrase.length) {
                    deleting = true;
                    window.setTimeout(tick, 1900);
                    return;
                }
                window.setTimeout(tick, 62);
            } else {
                charIndex -= 1;
                target.textContent = phrase.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    window.setTimeout(tick, 320);
                    return;
                }
                window.setTimeout(tick, 26);
            }
        }

        window.setTimeout(tick, 700);
    })();

    /* -------------------------------------------------
       Project modal
    ------------------------------------------------- */
    var PROJECTS = {
        cashen: {
            title: 'Cashen',
            meta: ['Personal Project', 'Full-stack Web Application'],
            alt: 'Cashen expense management application',
            image: 'assets/images/project-cashen.jpg',
            desc: 'Full-stack budget management web application to track expenses, manage budgets and provide ' +
                'financial insights — built end to end with Node.js, Express.js and PostgreSQL.',
            tech: ['Node.js', 'Express.js', 'PostgreSQL', 'HTML', 'CSS', 'JavaScript'],
            features: [
                'Expense tracking with smart categorisation',
                'Budget management with budget alerts',
                'Interactive dashboard with data visualisation',
                'Financial insights and real-time analytics',
                'RESTful CRUD APIs',
                'Secure authentication',
                'Responsive UI'
            ],
            contribution: 'End-to-end development: data modelling, the RESTful CRUD API layer, authentication, and ' +
                'the responsive dashboard with budget insights and visualisation.',
            links: [
                {
                    label: 'View on GitHub',
                    href: 'https://github.com/vsangani2337/Cashen-App',
                    icon: 'ri-github-fill',
                    primary: true
                }
            ]
        },
        'pizza-man': {
            title: 'Pizza Man',
            image: 'assets/images/project-pizza-man.png',
            meta: ['Internship Project', 'Oasis Infobyte · AICTE OIB-SIP', 'May 2026 – Jun 2026'],
            alt: 'Pizza Man pizza delivery application',
            icon: 'ri-shopping-cart-2-line',
            label: 'Pizza Man',
            desc: 'Pizza delivery platform with customer and admin roles, a custom pizza builder, cart, order ' +
                'management and test-mode payments — developed during the AICTE OIB-SIP internship at Oasis Infobyte.',
            tech: ['React.js (Vite)', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'Razorpay'],
            features: [
                'Customer and Admin roles with JWT authentication',
                'Role-based access control',
                'Custom pizza builder and cart',
                'Order management workflow',
                'Razorpay payment integration in test mode',
                'Inventory management with automatic stock deduction',
                'Low-stock email alerts',
                'REST APIs with API and integration testing'
            ],
            contribution: 'Built the REST API layer, implemented JWT authentication with role-based access control, ' +
                'wired the React (Vite) front end to those APIs, added inventory handling with automatic stock ' +
                'deduction and low-stock alerts, and validated the order-to-inventory workflow through API testing, ' +
                'integration testing and debugging.',
            links: [
                {
                    label: 'View on GitHub',
                    href: 'https://github.com/vsangani2337/pizza-man',
                    icon: 'ri-github-fill',
                    primary: true
                }
            ]
        }
    };

    (function initModal() {
        var modal = document.getElementById('project-modal');
        if (!modal) return;

        var media = document.getElementById('modal-media');
        var metaBox = document.getElementById('modal-meta');
        var title = document.getElementById('modal-title');
        var desc = document.getElementById('modal-desc');
        var tech = document.getElementById('modal-tech');
        var features = document.getElementById('modal-features');
        var contribution = document.getElementById('modal-contribution');
        var links = document.getElementById('modal-links');
        var lastFocused = null;

        function fill(list, items) {
            list.innerHTML = '';
            items.forEach(function (text) {
                var li = document.createElement('li');
                li.textContent = text;
                list.appendChild(li);
            });
        }

        function open(id) {
            var project = PROJECTS[id];
            if (!project) return;

            lastFocused = document.activeElement;

            /* Media */
            media.className = 'modal-media' + (project.image ? '' : ' is-placeholder');
            media.innerHTML = '';
            if (project.image) {
                var img = document.createElement('img');
                img.src = project.image;
                img.alt = project.alt || project.title;
                img.loading = 'lazy';
                media.appendChild(img);
            } else {
                var inner = document.createElement('div');
                inner.className = 'placeholder-inner';
                inner.innerHTML = '<i class="' + (project.icon || 'ri-window-line') +
                    '" aria-hidden="true"></i><span></span>';
                inner.querySelector('span').textContent = project.label || project.title;
                media.appendChild(inner);
            }

            /* Text */
            fill(metaBox, project.meta);
            metaBox.querySelectorAll('li').forEach(function (li, i) {
                li.className = 'tag' + (i > 0 ? ' is-alt' : '');
            });
            title.textContent = project.title;
            desc.textContent = project.desc;
            fill(tech, project.tech);
            fill(features, project.features);
            contribution.textContent = project.contribution;

            /* Links */
            links.innerHTML = '';
            if (project.links.length) {
                project.links.forEach(function (link) {
                    var a = document.createElement('a');
                    a.href = link.href;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.className = 'btn btn-sm ' + (link.primary ? 'btn-primary' : 'btn-ghost');
                    a.innerHTML = '<i class="' + link.icon + '" aria-hidden="true"></i>';
                    a.appendChild(document.createTextNode(' ' + link.label));
                    links.appendChild(a);
                });
            } else {
                var note = document.createElement('p');
                note.className = 'form-note';
                note.innerHTML = '<i class="ri-information-line" aria-hidden="true"></i>';
                note.appendChild(document.createTextNode(
                    ' This was built during an internship — the source repository is managed by the host organisation.'
                ));
                links.appendChild(note);
            }

            modal.hidden = false;
            document.body.classList.add('no-scroll');
            modal.querySelector('.modal-close').focus();
        }

        function close() {
            if (modal.hidden) return;
            modal.hidden = true;
            document.body.classList.remove('no-scroll');
            if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        }

        document.addEventListener('click', function (event) {
            var trigger = event.target.closest('[data-open-project]');
            if (trigger) {
                open(trigger.getAttribute('data-open-project'));
                return;
            }

            var closer = event.target.closest('[data-close-modal]');
            if (closer) {
                close();
                return;
            }

            /* Clicking a project card body also opens details */
            var card = event.target.closest('.project-card');
            if (card && card.dataset.project && !event.target.closest('a, button')) {
                open(card.dataset.project);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (modal.hidden) return;

            if (event.key === 'Escape') {
                close();
                return;
            }

            if (event.key !== 'Tab') return;

            /* Simple focus trap */
            var focusables = modal.querySelectorAll('a[href], button:not([disabled])');
            if (!focusables.length) return;
            var first = focusables[0];
            var last = focusables[focusables.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    })();

    /* -------------------------------------------------
       Contact form — client-side validation + mailto
    ------------------------------------------------- */
    (function initContactForm() {
        var form = document.getElementById('contact-form');
        if (!form) return;

        var status = document.getElementById('form-status');
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        var EMAIL = 'vsangani2337@gmail.com';

        var rules = {
            'cf-name': function (value) {
                if (!value.trim()) return 'Please enter your name.';
                if (value.trim().length < 2) return 'Name must be at least 2 characters.';
                return '';
            },
            'cf-email': function (value) {
                if (!value.trim()) return 'Please enter your email address.';
                if (!emailPattern.test(value.trim())) return 'Please enter a valid email address.';
                return '';
            },
            'cf-message': function (value) {
                if (!value.trim()) return 'Please write a message.';
                if (value.trim().length < 10) return 'Message must be at least 10 characters.';
                return '';
            }
        };

        function showError(input, message) {
            var field = input.closest('.field');
            var slot = field.querySelector('.field-error');
            field.classList.toggle('has-error', Boolean(message));
            input.setAttribute('aria-invalid', message ? 'true' : 'false');
            if (slot) slot.textContent = message;
        }

        function validate(input) {
            var rule = rules[input.id];
            if (!rule) return true;
            var message = rule(input.value);
            showError(input, message);
            return !message;
        }

        Object.keys(rules).forEach(function (id) {
            var input = document.getElementById(id);
            if (!input) return;
            input.addEventListener('blur', function () { validate(input); });
            input.addEventListener('input', function () {
                if (input.closest('.field').classList.contains('has-error')) validate(input);
            });
        });

        function setStatus(type, message) {
            if (!status) return;
            status.className = 'form-status is-visible ' + (type === 'success' ? 'is-success' : 'is-error');
            status.innerHTML = '<i class="' +
                (type === 'success' ? 'ri-check-line' : 'ri-error-warning-line') +
                '" aria-hidden="true"></i>';
            status.appendChild(document.createTextNode(' ' + message));
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var inputs = Object.keys(rules).map(function (id) { return document.getElementById(id); });
            var firstInvalid = null;
            var valid = true;

            inputs.forEach(function (input) {
                if (!input) return;
                if (!validate(input)) {
                    valid = false;
                    if (!firstInvalid) firstInvalid = input;
                }
            });

            if (!valid) {
                setStatus('error', 'Please fix the highlighted fields and try again.');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            var name = document.getElementById('cf-name').value.trim();
            var email = document.getElementById('cf-email').value.trim();
            var message = document.getElementById('cf-message').value.trim();

            var subject = encodeURIComponent('Portfolio enquiry from ' + name);
            var body = encodeURIComponent(
                message + '\n\n—\n' + name + '\n' + email
            );

            setStatus('success', 'Opening your email app with the message pre-filled. If nothing happens, write to ' +
                EMAIL + ' directly.');

            window.location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + body;
        });
    })();

    /* -------------------------------------------------
       Custom cursor (desktop, fine pointer only)
    ------------------------------------------------- */
    (function initCursor() {
        if (!finePointer.matches || reducedMotion.matches) return;

        var dot = document.querySelector('.cursor-dot');
        var ring = document.querySelector('.cursor-ring');
        if (!dot || !ring) return;

        document.documentElement.classList.add('has-cursor');

        var mouseX = window.innerWidth / 2;
        var mouseY = window.innerHeight / 2;
        var ringX = mouseX;
        var ringY = mouseY;
        var running = false;

        function loop() {
            ringX += (mouseX - ringX) * 0.16;
            ringY += (mouseY - ringY) * 0.16;
            ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
            if (Math.abs(mouseX - ringX) > 0.4 || Math.abs(mouseY - ringY) > 0.4) {
                window.requestAnimationFrame(loop);
            } else {
                running = false;
            }
        }

        window.addEventListener('mousemove', function (event) {
            mouseX = event.clientX;
            mouseY = event.clientY;
            dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
            if (!running) {
                running = true;
                window.requestAnimationFrame(loop);
            }
        }, { passive: true });

        document.addEventListener('mouseover', function (event) {
            var hot = event.target.closest('a, button, .project-card, .profile-card, .skill-tags li, .project-tags li, input, textarea');
            document.documentElement.classList.toggle('cursor-hot', Boolean(hot));
        });

        document.addEventListener('mouseleave', function () {
            document.documentElement.classList.remove('has-cursor');
        });

        document.addEventListener('mouseenter', function () {
            document.documentElement.classList.add('has-cursor');
        });
    })();

    /* -------------------------------------------------
       Hero parallax
    ------------------------------------------------- */
    (function initParallax() {
        var visual = document.getElementById('hero-visual');
        if (!visual || !finePointer.matches || reducedMotion.matches) return;
        if (window.innerWidth <= 992) return;

        var targetX = 0;
        var targetY = 0;
        var currentX = 0;
        var currentY = 0;
        var frame = null;

        function animate() {
            currentX += (targetX - currentX) * 0.07;
            currentY += (targetY - currentY) * 0.07;
            visual.style.transform = 'translate3d(' + currentX.toFixed(2) + 'px,' + currentY.toFixed(2) + 'px,0)';

            if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
                frame = window.requestAnimationFrame(animate);
            } else {
                frame = null;
            }
        }

        window.addEventListener('mousemove', function (event) {
            var nx = event.clientX / window.innerWidth - 0.5;
            var ny = event.clientY / window.innerHeight - 0.5;
            targetX = nx * -24;
            targetY = ny * -18;
            if (!frame) frame = window.requestAnimationFrame(animate);
        }, { passive: true });
    })();

    /* -------------------------------------------------
       Magnetic buttons
    ------------------------------------------------- */
    (function initMagnetic() {
        if (!finePointer.matches || reducedMotion.matches) return;

        Array.prototype.forEach.call(document.querySelectorAll('.btn'), function (button) {
            button.addEventListener('mousemove', function (event) {
                var rect = button.getBoundingClientRect();
                var x = event.clientX - rect.left - rect.width / 2;
                var y = event.clientY - rect.top - rect.height / 2;
                button.style.transform = 'translate(' + (x * 0.14).toFixed(2) + 'px,' +
                    (y * 0.24).toFixed(2) + 'px)';
            });

            button.addEventListener('mouseleave', function () {
                button.style.transform = '';
            });
        });
    })();

    /* -------------------------------------------------
       Broken image fallback
    ------------------------------------------------- */
    document.addEventListener('error', function (event) {
        var img = event.target;
        if (!img || img.tagName !== 'IMG') return;
        img.style.display = 'none';
    }, true);

})();
