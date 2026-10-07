/*=========================================
  GITHUB REPOSITORIES  •  Vivek Sangani Portfolio
  - Fetches all public repos from GitHub API
  - Renders them in a grid with lazy loading
  - Caches for session to avoid rate limits
=========================================*/

(function () {
    'use strict';

    var host = document.getElementById('repos-grid');
    if (!host) return;

    var CONFIG = {
        username: 'vsangani2337',
        apiBase: 'https://api.github.com',
        perPage: 100,
        cacheKey: 'gh-repos:v1:',
        cacheTTL: 30 * 60 * 1000
    };

    var EXCLUDED_REPOS = [
        'vsangani2337',
        'vsangani2337.github.io'
    ];

    function readCache() {
        try {
            var raw = sessionStorage.getItem(CONFIG.cacheKey + CONFIG.username);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed || !parsed.t || !parsed.data) return null;
            if (Date.now() - parsed.t > CONFIG.cacheTTL) return null;
            return parsed.data;
        } catch (e) {
            return null;
        }
    }

    function writeCache(data) {
        try {
            sessionStorage.setItem(CONFIG.cacheKey + CONFIG.username,
                JSON.stringify({ t: Date.now(), data: data }));
        } catch (e) { }
    }

    function fetchWithTimeout(url, options) {
        var controller = typeof AbortController === 'function' ? new AbortController() : null;
        var timer = null;

        var fetchOptions = Object.assign({}, options, {
            headers: Object.assign({
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }, options?.headers)
        });

        if (controller) {
            fetchOptions.signal = controller.signal;
            timer = window.setTimeout(function () { controller.abort(); }, 10000);
        }

        return fetch(url, fetchOptions).then(function (response) {
            if (timer) window.clearTimeout(timer);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        }, function (error) {
            if (timer) window.clearTimeout(timer);
            throw error;
        });
    }

    function fetchAllRepos() {
        var allRepos = [];
        var page = 1;

        function fetchPage() {
            var url = CONFIG.apiBase + '/users/' + CONFIG.username + '/repos' +
                '?per_page=' + CONFIG.perPage +
                '&page=' + page +
                '&sort=updated' +
                '&direction=desc' +
                '&type=public';

            return fetchWithTimeout(url).then(function (repos) {
                if (!repos.length) return allRepos;

                var filtered = repos.filter(function (repo) {
                    return !repo.fork &&
                        !repo.private &&
                        EXCLUDED_REPOS.indexOf(repo.name) === -1;
                });

                allRepos = allRepos.concat(filtered);

                if (repos.length === CONFIG.perPage) {
                    page++;
                    return fetchPage();
                }

                return allRepos;
            });
        }

        return fetchPage();
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return String(num);
    }

    function formatDate(dateStr) {
        var date = new Date(dateStr);
        var options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function getLanguageColor(language) {
        var colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#2b7489',
            'Python': '#3572A5',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'Dart': '#00B4AB',
            'Vue': '#41b883',
            'React': '#61dafb',
            'Node.js': '#339933',
            'Express': '#000000',
            'PostgreSQL': '#336791',
            'MongoDB': '#47A248',
            'SQL': '#e38c00',
            'Docker': '#2496ED',
            'Shell': '#89e051'
        };
        return colors[language] || '#8b949e';
    }

    function createRepoCard(repo) {
        var article = document.createElement('article');
        article.className = 'repo-card reveal';
        article.setAttribute('role', 'listitem');

        var language = repo.language || 'Code';
        var langColor = getLanguageColor(language);
        var updatedDate = formatDate(repo.updated_at);
        var description = repo.description || 'No description provided.';

        article.innerHTML =
            '<div class="repo-header">' +
            '  <h3 class="repo-name"><a href="' + repo.html_url + '" target="_blank" rel="noopener noreferrer">' + repo.name + '</a></h3>' +
            '  <span class="repo-visibility" aria-label="Public repository"><i class="ri-global-line" aria-hidden="true"></i> Public</span>' +
            '</div>' +
            '<p class="repo-description">' + description + '</p>' +
            '<div class="repo-meta">' +
            '  <span class="repo-language" style="--lang-color: ' + langColor + '">' +
            '    <span class="lang-dot" aria-hidden="true"></span>' +
            '    ' + language +
            '  </span>' +
            '  <span class="repo-stars" aria-label="' + repo.stargazers_count + ' stars">' +
            '    <i class="ri-star-line" aria-hidden="true"></i> ' + formatNumber(repo.stargazers_count) +
            '  </span>' +
            '  <span class="repo-forks" aria-label="' + repo.forks_count + ' forks">' +
            '    <i class="ri-git-branch-line" aria-hidden="true"></i> ' + formatNumber(repo.forks_count) +
            '  </span>' +
            '  <time class="repo-updated" datetime="' + repo.updated_at + '">' +
            '    <i class="ri-history-line" aria-hidden="true"></i> Updated ' + updatedDate +
            '  </time>' +
            '</div>' +
            '<div class="repo-topics" id="topics-' + repo.id + '"></div>' +
            '<div class="repo-footer">' +
            '  <a class="btn btn-ghost btn-sm" href="' + repo.html_url + '" target="_blank" rel="noopener noreferrer">' +
            '    <i class="ri-github-fill" aria-hidden="true"></i> View on GitHub' +
            '  </a>' +
            '</div>';

        var topicsContainer = article.querySelector('#topics-' + repo.id);
        if (repo.topics && repo.topics.length) {
            var topicsHtml = repo.topics.slice(0, 5).map(function (topic) {
                return '<span class="topic-tag">' + topic + '</span>';
            }).join('');
            if (repo.topics.length > 5) {
                topicsHtml += '<span class="topic-tag more">+' + (repo.topics.length - 5) + '</span>';
            }
            topicsContainer.innerHTML = topicsHtml;
        }

        return article;
    }

    function renderError(message) {
        host.innerHTML = '';
        var errorDiv = document.createElement('div');
        errorDiv.className = 'repos-error';
        errorDiv.innerHTML =
            '<i class="ri-error-warning-line" aria-hidden="true"></i>' +
            '<p>' + message + '</p>' +
            '<a class="btn btn-outline" href="https://github.com/' + CONFIG.username + '?tab=repositories" target="_blank" rel="noopener noreferrer">' +
            'View on GitHub <i class="ri-arrow-right-line" aria-hidden="true"></i>' +
            '</a>';
        host.appendChild(errorDiv);
    }

    function renderEmpty() {
        host.innerHTML = '';
        var emptyDiv = document.createElement('div');
        emptyDiv.className = 'repos-empty';
        emptyDiv.innerHTML =
            '<i class="ri-folder-line" aria-hidden="true"></i>' +
            '<p>No public repositories found.</p>';
        host.appendChild(emptyDiv);
    }

    function renderRepos(repos) {
        host.innerHTML = '';

        if (!repos.length) {
            renderEmpty();
            return;
        }

        var fragment = document.createDocumentFragment();
        repos.forEach(function (repo) {
            fragment.appendChild(createRepoCard(repo));
        });
        host.appendChild(fragment);

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '100px', threshold: 0.1 });

            host.querySelectorAll('.repo-card').forEach(function (card) {
                observer.observe(card);
            });
        } else {
            host.querySelectorAll('.repo-card').forEach(function (card) {
                card.classList.add('is-visible');
            });
        }
    }

    function load() {
        var cached = readCache();
        if (cached) {
            renderRepos(cached);
            return;
        }

        fetchAllRepos()
            .then(function (repos) {
                writeCache(repos);
                renderRepos(repos);
            })
            .catch(function (error) {
                console.error('Failed to fetch repos:', error);
                renderError('Could not load repositories. Please try again later or visit GitHub directly.');
            });
    }

    if ('IntersectionObserver' in window) {
        var section = host.closest('section') || host;
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    observer.disconnect();
                    load();
                }
            });
        }, { rootMargin: '200px' });
        observer.observe(section);
    } else {
        load();
    }
})();