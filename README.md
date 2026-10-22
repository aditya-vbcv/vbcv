# VBCV Website

Website for **Vidya Bharati Chinmaya Vidyalaya**, Telco Colony, Jamshedpur — a CBSE affiliated
school (Affiliation No. 3430015).

A static, dependency-free site built with plain HTML, CSS and JavaScript.

**Live site:** https://aditya-vbcv.github.io/vbcv/

The root `index.html` forwards to `html/index.html`, since all pages live in `html/`.

## Pages

| Page | File | Description |
| --- | --- | --- |
| Home | `html/index.html` | Hero, about, stats, notice-board popup, infrastructure slider |
| Vision & Mission | `html/mvo.html` | Mission, vision and objectives |
| Chinmaya Vision Programme | `html/cvp.html` | The five pillars of the CVP |
| Messages | `html/leadership.html` | Messages from the Chairman, Principal and others |
| Staff & Faculty | `html/staff.html` | Teaching and non-teaching staff directory |

## Project structure

```
.
├── css/          # Stylesheets (variables → base → components)
├── html/         # Pages
├── images/       # Logo, leadership photos, infrastructure, slideshow
└── js/           # Navbar, slider, popup, counters, animations, staff filter
```

## Running locally

No build step is required. Either open `html/index.html` directly in a browser, or serve the
folder over HTTP so relative paths resolve exactly as they will in production:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/html/index.html
```

## Notes

- Stylesheet order matters: `variables.css` must load before `base.css`, and both before
  component styles.
- The pages use a small inline script to add a `js` class to `<html>`; scroll-reveal styles only
  hide content when that class is present, so the site still works without JavaScript.
- Images are the largest part of the repository (~33 MB). Consider compressing them before
  deploying if bandwidth matters.
