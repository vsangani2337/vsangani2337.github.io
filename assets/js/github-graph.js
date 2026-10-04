/*=========================================
  GITHUB CONTRIBUTION GRAPH  •  sole owner
  - lazy-loads when the Coding Profiles section nears the viewport
  - fetches public contribution data (no token, no credentials)
  - caches the payload for the session (no repeat requests)
  - falls back to a clearly labelled error state on failure

  DATA SOURCE
  ENDPOINT returns: { contributions: [{ date, count, level }] }
  To use your own source, replace ENDPOINT (or fetch a static
  file such as "assets/data/contributions.json") inside load().
  Nothing here fabricates data — if nothing is fetched, nothing
  is drawn.
=========================================*/

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var host = document.getElementById('github-graph');
    if (!host) return;

    /* -------------------------------------------------
       CONFIG
    ------------------------------------------------- */
    var ENDPOINT = 'https://github-contributions-api.jogruber.de/v4/';
    var WEEKS = 53;
    var DAY_MS = 86400000;
    var CACHE_KEY = 'gh-graph:v1:';
    var CACHE_TTL = 6 * 60 * 60 * 1000; /* 6 hours */
    var TIMEOUT_MS = 9000;
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    var username = host.getAttribute('data-username') || 'vsangani2337';
    var profileUrl = 'https://github.com/' + username;

    /* -------------------------------------------------
       DATES (local time, normalised to avoid DST drift)
    ------------------------------------------------- */
    function startOfDay(d) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    function addDays(d, n) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    }

    function iso(d) {
        var m = d.getMonth() + 1;
        var day = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
    }

    function pretty(d) {
        return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
    }

    var today = startOfDay(new Date());
    var rangeEnd = addDays(today, 6 - today.getDay());     /* Saturday of the current week */
    var rangeStart = addDays(rangeEnd, -(WEEKS * 7 - 1));  /* the Sunday 53 weeks earlier  */

    /* -------------------------------------------------
       DOM HELPERS
    ------------------------------------------------- */
    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function icon(name) {
        var node = document.createElement('i');
        node.className = name;
        node.setAttribute('aria-hidden', 'true');
        return node;
    }

    var tip = null;
    var cellsBox = null;

    function buildStructure() {
        host.innerHTML = '';
        host.classList.add('is-loading');
        host.classList.remove('is-error');

        var scroll = el('div', 'gh-scroll');
        var inner = el('div', 'gh-inner');

        var months = el('div', 'gh-months');
        months.setAttribute('aria-hidden', 'true');

        var body = el('div', 'gh-body');

        var days = el('div', 'gh-days');
        days.setAttribute('aria-hidden', 'true');
        for (var d = 0; d < 7; d++) {
            var slot = el('div', 'gh-day');
            if (d % 2 === 1) slot.textContent = DAY_NAMES[d];
            days.appendChild(slot);
        }

        cellsBox = el('div', 'gh-cells');

        tip = el('div', 'gh-tip');
        tip.setAttribute('role', 'tooltip');
        tip.hidden = true;
        cellsBox.appendChild(tip);

        body.appendChild(days);
        body.appendChild(cellsBox);
        inner.appendChild(months);
        inner.appendChild(body);
        scroll.appendChild(inner);
        host.appendChild(scroll);

        wireTooltip();
        return { months: months, cells: cellsBox };
    }

    function fillSkeleton() {
        if (!cellsBox) return;
        for (var i = 0; i < WEEKS * 7; i++) {
            cellsBox.insertBefore(el('span', 'gh-cell'), tip);
        }
    }

    /* -------------------------------------------------
       TOOLTIP
    ------------------------------------------------- */
    function hideTip() {
        if (tip) tip.hidden = true;
    }

    function showTip(cell) {
        if (!tip || !cellsBox) return;
        var label = cell.getAttribute('data-label');
        if (!label) {
            hideTip();
            return;
        }

        tip.textContent = label;
        tip.hidden = false;
        tip.classList.remove('is-below');

        var x = cell.offsetLeft + cell.offsetWidth / 2;
        var y = cell.offsetTop;
        var below = y < 26;
        if (below) tip.classList.add('is-below');

        var half = tip.offsetWidth / 2 + 2;
        var min = half;
        var max = cellsBox.offsetWidth - half;
        var clamped = Math.min(Math.max(x, min), Math.max(min, max));

        tip.style.left = clamped + 'px';
        tip.style.top = (below ? y + cell.offsetHeight : y) + 'px';
    }

    function wireTooltip() {
        if (!cellsBox) return;

        function handle(event) {
            var target = event.target;
            if (target && target.classList && target.classList.contains('gh-cell')) {
                showTip(target);
            } else {
                hideTip();
            }
        }

        cellsBox.addEventListener('pointerover', handle);
        cellsBox.addEventListener('pointerdown', handle);
        cellsBox.addEventListener('pointerleave', hideTip);
        cellsBox.addEventListener('pointercancel', hideTip);
    }

    /* -------------------------------------------------
       RENDER
    ------------------------------------------------- */
    function levelOf(rec, max) {
        var level = null;
        if (typeof rec.level === 'number') level = rec.level;
        else if (typeof rec.intensity === 'number') level = rec.intensity;

        if (level === null) {
            if (!rec.count) return 0;
            if (!max) return 1;
            return Math.max(1, Math.min(4, Math.ceil((rec.count / max) * 4)));
        }
        return Math.max(0, Math.min(4, Math.round(level)));
    }

    function render(payload) {
        var parts = buildStructure();
        var list = (payload && payload.contributions) || [];

        var map = Object.create(null);
        var max = 0;
        var i;
        for (i = 0; i < list.length; i++) {
            var rec = list[i];
            if (!rec || !rec.date) continue;
            map[rec.date] = rec;
            if (typeof rec.count === 'number' && rec.count > max) max = rec.count;
        }

        var frag = document.createDocumentFragment();
        var total = 0;
        var prevMonth = -1;
        var lastLabel = -1;

        for (var w = 0; w < WEEKS; w++) {
            var colDate = addDays(rangeStart, w * 7);

            var month = colDate.getMonth();
            if (month !== prevMonth) {
                var place = (lastLabel === -1 || w - lastLabel >= 3);
                if (w === 0 && colDate.getDate() > 7) place = false;
                if (place) {
                    var label = el('span', 'gh-month', MONTHS[month]);
                    label.style.gridColumn = (w + 1) + ' / span 4';
                    parts.months.appendChild(label);
                    lastLabel = w;
                }
                prevMonth = month;
            }

            for (var d = 0; d < 7; d++) {
                var date = addDays(colDate, d);
                var future = date > today;
                var key = iso(date);
                var record = map[key];
                var count = record && typeof record.count === 'number' ? record.count : 0;
                var level = record ? levelOf(record, max) : 0;

                if (!future) total += count;

                var cell = el('span', 'gh-cell' + (future ? ' is-future' : ''));
                cell.setAttribute('data-level', String(level));
                if (!future) {
                    cell.setAttribute('data-count', String(count));
                    cell.setAttribute('data-date', key);
                    cell.setAttribute('data-label',
                        count + (count === 1 ? ' contribution' : ' contributions') + ' on ' + pretty(date));
                }
                frag.appendChild(cell);
            }
        }

        parts.cells.classList.remove('is-loading');
        parts.cells.appendChild(frag);
        host.classList.remove('is-loading');

        host.setAttribute('aria-label',
            'GitHub contribution calendar for @' + username + ': ' + total +
            (total === 1 ? ' contribution' : ' contributions') + ' in the last year, from ' +
            pretty(rangeStart) + ' to ' + pretty(today) + '.');

        var summary = document.getElementById('gh-summary');
        if (summary) {
            summary.textContent = total + (total === 1 ? ' contribution' : ' contributions') +
                ' in the last year';
            summary.hidden = false;
        }
    }

    function renderError() {
        host.classList.remove('is-loading');
        host.classList.add('is-error');
        host.innerHTML = '';

        var box = el('div', 'gh-error');
        box.setAttribute('role', 'status');

        var head = el('p', 'gh-error-title');
        head.appendChild(icon('ri-error-warning-line'));
        head.appendChild(document.createTextNode(' Live GitHub activity could not be loaded right now.'));

        var note = el('p', 'gh-error-note',
            'The calendar reads public contribution data from a third-party GitHub activity endpoint — ' +
            'no token, login or stored credentials are involved. The full calendar always lives on the ' +
            'profile itself.');

        var link = document.createElement('a');
        link.className = 'link-inline';
        link.href = profileUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.appendChild(document.createTextNode('Open GitHub profile '));
        link.appendChild(icon('ri-arrow-right-line'));

        box.appendChild(head);
        box.appendChild(note);
        box.appendChild(link);
        host.appendChild(box);

        host.setAttribute('aria-label',
            'GitHub contribution calendar for @' + username + ' could not be loaded. ' +
            'Open the GitHub profile to view activity.');
    }

    /* -------------------------------------------------
       DATA
    ------------------------------------------------- */
    function readCache() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY + username);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed || !parsed.t || !parsed.data) return null;
            if (Date.now() - parsed.t > CACHE_TTL) return null;
            return parsed.data;
        } catch (e) {
            return null;
        }
    }

    function writeCache(data) {
        try {
            sessionStorage.setItem(CACHE_KEY + username,
                JSON.stringify({ t: Date.now(), data: data }));
        } catch (e) { /* quota / private mode — the graph still works for this visit */ }
    }

    function fetchWithTimeout(url) {
        var controller = typeof AbortController === 'function' ? new AbortController() : null;
        var timer = null;

        var options = { headers: { Accept: 'application/json' } };
        if (controller) {
            options.signal = controller.signal;
            timer = window.setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
        }

        return fetch(url, options).then(function (response) {
            if (timer) window.clearTimeout(timer);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        }, function (error) {
            if (timer) window.clearTimeout(timer);
            throw error;
        });
    }

    function load() {
        var cached = readCache();
        if (cached) {
            render(cached);
            return;
        }

        fetchWithTimeout(ENDPOINT + encodeURIComponent(username))
            .then(function (data) {
                if (!data || !Array.isArray(data.contributions)) throw new Error('Unexpected payload');
                writeCache(data);
                render(data);
            })
            .catch(function () {
                renderError();
            });
    }

    /* -------------------------------------------------
       LAZY START — only request when the section is close
    ------------------------------------------------- */
    function start() {
        var cached = readCache();
        if (cached) {
            render(cached);
            return;
        }

        buildStructure();
        fillSkeleton();

        if (!('IntersectionObserver' in window)) {
            load();
            return;
        }

        var target = host.closest('section') || host;
        var observer = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    observer.disconnect();
                    load();
                    return;
                }
            }
        }, { rootMargin: '500px 0px' });

        observer.observe(target);
    }

    start();
});
