# Vivek Sangani — Portfolio

Personal portfolio site for **Vivek Sangani**, Computer Engineering student and software developer.
Static site — no build step, no framework.

## Features

- Single-page portfolio: Home · About · Skills · Projects · Experience · Achievements · Certifications · Education · Coding Profiles · Resume · Contact
- Dark / light theme with persistence and system-preference detection (no flash on load)
- Fully responsive: 320 → 1800px, mobile nav drawer with overlay and focus management
- Scroll reveal animations with stagger, disabled under `prefers-reduced-motion`
- Animated hero: typewriter role line, counters, floating badges, parallax
- Coding Profiles section: GitHub contribution calendar (real public data, lazy-loaded, session-cached,
  with loading + error states) and an interactive LeetCode card
- Project detail modal (click-outside / Escape / focus trap)
- Contact form with client-side validation that opens a prefilled `mailto:` draft
- Scroll progress bar, back-to-top button, magnetic buttons, custom cursor (pointer devices only)
- Subtle tsParticles background, paused for reduced motion
- Active nav state with `aria-current`, sticky header, dynamic footer year

## Structure

```
portfolio/
├── index.html            # The whole portfolio — Hero, About, Skills, Projects, Experience,
│                         # Achievements, Certifications, Education, Coding Profiles, Resume, Contact
├── resume.pdf
├── README.md
└── assets/
    ├── css/
    │   ├── variables.css     # Design tokens + [data-theme="dark"] overrides
    │   ├── style.css         # Layout and components (load 2nd)
    │   ├── animations.css    # Keyframes, reveal system (load 3rd)
    │   └── responsive.css    # Breakpoints (load 4th)
    ├── js/
    │   ├── theme.js          # Theme manager
    │   ├── animation.js      # Reveal / stagger observer
    │   ├── main.js           # Nav, modal, form, counters, cursor, magnetic
    │   ├── github-graph.js   # Contribution calendar (lazy fetch, cache, fallback)
    │   └── particles.js      # tsParticles config
    └── images/
        ├── profile-about.jpg
        ├── project-cashen.jpg
        └── project-pizza-man.png
```

CSS must load in the order shown above. `theme.js` runs before `main.js` so the correct theme
is applied on the first paint.

### GitHub contribution graph

`assets/js/github-graph.js` fetches public contribution data for **vsangani2337** from
`https://github-contributions-api.jogruber.de/v4/<user>` — a CORS-enabled, unauthenticated endpoint.
No token or private credential is ever shipped to the browser.

- The request only fires when the Coding Profiles section nears the viewport
- The response is cached in `sessionStorage` for 6 hours (no repeat requests while browsing)
- While loading: shimmer skeleton; on failure: a labelled error state with a link to the profile
- To use another data source, replace `ENDPOINT` / `load()` in `github-graph.js` — the renderer only
  needs `{ contributions: [{ date: "YYYY-MM-DD", count: N, level: 0-4 }] }`
- LeetCode statistics are intentionally **not** displayed (no reliable client-side source), so
  nothing on the page is estimated or fabricated

## Stack

HTML5 · CSS3 · Vanilla JavaScript · [Remix Icon](https://remixicon.com) ·
Google Fonts (Space Grotesk + Inter) · [tsParticles](https://particles.js.org)

## Run

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8080
# → http://localhost:8080
```

## Contact

- Email — [vsangani2337@gmail.com](mailto:vsangani2337@gmail.com)
- GitHub — [github.com/vsangani2337](https://github.com/vsangani2337)
- LinkedIn — [linkedin.com/in/vivek-sangani-b75138373](https://www.linkedin.com/in/vivek-sangani-b75138373/)

---

Built by Vivek Sangani.
