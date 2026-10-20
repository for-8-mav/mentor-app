# Mentor · 学期计划 PWA

A small, offline-first semester planner. Vanilla HTML/CSS/JS; no build step.

## Run locally

```bash
python -m http.server 8000
```

Open <http://localhost:8000/>.

## Deploy

This folder is the GitHub Pages root. Push it to a public repo and enable Pages
(branch `main`, folder `/ (root)`). The app is served at
`https://<user>.github.io/<repo>/`.

## Data

- `data/plan.js` — plan content (edit this file).
- `localStorage` key `mentor.v1` — completion, reviews, and other user state.
- Export a JSON backup from Settings.

## Notes

- The service worker cache version is in `sw.js`; bump it after changes.
- iOS: add to Home Screen first, then enter data (the Safari tab and the
  Home Screen app use separate storage).
- This is a personal planning tool; it has no analytics, no external fonts,
  and no third-party scripts.
