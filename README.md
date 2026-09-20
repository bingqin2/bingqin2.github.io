# bingqin2.github.io

[![CI](https://github.com/bingqin2/bingqin2.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/bingqin2/bingqin2.github.io/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/bingqin2/bingqin2.github.io/actions/workflows/pages.yml/badge.svg)](https://github.com/bingqin2/bingqin2.github.io/actions/workflows/pages.yml)
[![Publish container image](https://github.com/bingqin2/bingqin2.github.io/actions/workflows/image.yml/badge.svg)](https://github.com/bingqin2/bingqin2.github.io/actions/workflows/image.yml)

Personal site of Bingqin Wang, live at [bingqin2.github.io](https://bingqin2.github.io). Plain HTML, CSS, and JavaScript with no framework and no build step. The same files are also packaged as a small nginx container image, with Kubernetes manifests to run it anywhere.

## Layout

| Path | What it is |
| --- | --- |
| `site/` | The static site. `index.html` holds all content: the bio for each persona is in the `<template>` elements, and the Experience, Projects, and Publications panels are plain HTML sections. |
| `site/assets/css/style.css` | Design tokens (`:root` for light, `html[data-theme="dark"]` for dark) and layout. |
| `site/assets/js/main.js` | Light/dark toggle (whole-page crossfade via the View Transitions API, with a CSS fallback), persona switch, quick-link panels, greeting bubble, click sparkles. |
| `site/assets/img/avatar-256.png`, `avatar-320.png`, `avatar.png` | The avatar (transparent PNG). The page loads the 256 or 320 px file through `srcset`; the 512 px file is the Open Graph preview. The hero shows it unmasked; the navbar crops it into a circle with CSS. |
| Inline SVG sprite at the top of `index.html` | The eleven icons (Font Awesome Free, CC BY 4.0, plus the Google Scholar mark from Simple Icons, CC0), so no icon font is downloaded. |
| `site/files/CV_English_Bingqin_Wang.pdf` | The public résumé (no phone number). |
| `Dockerfile`, `docker/nginx.conf`, `compose.yaml` | nginx image: unprivileged user, port 8080, gzip, cache and security headers, custom 404 page, `/healthz`. |
| `deploy/k8s/` | Kustomize manifests: a `base` (Deployment, Service, Ingress) and a `ci` overlay used by the workflow. |
| `.github/workflows/` | CI checks, GitHub Pages deployment, container image publishing. |

## Run it locally

Static files only:

```bash
python3 -m http.server 8000 --directory site
```

The container, exactly as it runs in production:

```bash
docker compose up --build
```

Then open http://localhost:8000 or http://localhost:8080.

## How it ships

- **GitHub Pages.** A push to `master` that touches `site/` runs `pages.yml`, which uploads `site/` as the Pages artifact and deploys it. Nothing is generated at deploy time.
- **Container image.** The same push runs `image.yml`, which builds a multi-arch image (amd64 and arm64) and pushes `ghcr.io/bingqin2/bingqin2.github.io` tagged `latest` and `sha-<commit>`.
- **Kubernetes.** `kubectl apply -k deploy/k8s/base` runs two replicas behind a ClusterIP Service and an Ingress (edit the host in `ingress.yaml`). The pod runs as non-root on a read-only root filesystem with all capabilities dropped, a seccomp profile, readiness and liveness probes on `/healthz`, and resource requests and limits.

## Checks on every push and pull request

`ci.yml` runs three jobs in parallel:

1. **HTML and links.** `html-validate` on every page and `lychee` on every internal link.
2. **Lighthouse.** Lighthouse CI against the static site: accessibility, best practices, and SEO must score at least 90, and performance warns below 85.
3. **Container and Kubernetes.** Builds the image and smoke tests it over HTTP, validates the rendered manifests with `kubeconform`, then deploys the image to a throwaway kind cluster and checks the site through the Service.

Dependabot keeps the actions and the nginx base image up to date.
