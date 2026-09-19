# bingqin2.github.io

Personal site of Bingqin Wang. Plain HTML, CSS, and JavaScript with no build step; GitHub Pages serves the repository root as static files (`.nojekyll` disables Jekyll).

- `index.html` holds all content: the bio for each persona is in the `<template>` elements, and the Experience, Projects, and Publications panels are plain HTML sections.
- `assets/css/style.css` holds the design tokens (`:root` for light, `html[data-theme="dark"]` for dark).
- `assets/js/main.js` handles the light/dark toggle (a whole-page crossfade via the View Transitions API, with a CSS fallback), persona switch, quick-link panels, greeting bubble, and click sparkles.
- `assets/img/avatar.svg` is a placeholder monogram. Replace it with a square photo or illustration and update the two `<img>` tags in `index.html`.
- `files/CV_English_Bingqin_Wang.pdf` is the public resume (no phone number).

Preview locally with `python3 -m http.server 8000` and open http://localhost:8000.
