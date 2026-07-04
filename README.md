# Shiftly — Weekly Timesheet & Pay Tracker

A installable Progressive Web App for logging shift start/end times, tracking weekly hours, and
automatically calculating monthly pay using a tiered hourly-rate table.

## Tech stack

- React + TypeScript
- Vite (single-file build via `vite-plugin-singlefile`)
- Tailwind CSS
- Framer Motion
- Service worker + Web App Manifest for offline/installable support

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The production build is a fully self-contained `dist/index.html` (JS and CSS inlined) plus a small
set of static PWA assets (`manifest.json`, `sw.js`, icons) copied from `public/`.

## Deploying to GitHub Pages

This repo includes a ready-to-use GitHub Actions workflow at
`.github/workflows/deploy.yml` that builds the app and publishes the `dist` folder to GitHub Pages
on every push to `main`.

**One-time setup:**

1. Push this repository to GitHub.
2. In your repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Push to the `main` branch (or run the workflow manually from the **Actions** tab).
5. After the workflow finishes, your site will be live at
   `https://<your-username>.github.io/<your-repo-name>/`.

All asset references in this project use **relative paths** (no leading `/`), so the app works
correctly whether it's hosted at the domain root or in a GitHub Pages project subpath — no extra
`base` configuration is required.

## PWA notes

- The manifest (`public/manifest.json`) and service worker (`public/sw.js`) enable "Add to Home
  Screen" / "Install App" prompts on desktop and mobile.
- The service worker uses a stale-while-revalidate strategy: it serves the cached app instantly and
  refreshes the cache in the background, so the app also works offline after the first visit.
- Icons live in `public/icons/`. Replace them with your own branding at any time — just keep the
  same filenames or update `manifest.json` and `index.html` accordingly.
