# GitHub Pages deployment

This project is set up to deploy automatically to GitHub Pages on every push to `main` (or `master`).

## What was added

- `vite.config.ts` now uses `base: "./"` so assets work correctly on GitHub Pages.
- `.github/workflows/deploy.yml` builds the app and deploys the `dist/` folder with GitHub Actions.

## Required GitHub settings

1. Open your repository on GitHub.
2. Go to **Settings** → **Pages**.
3. Set **Source** to **GitHub Actions**.

## How it works

- Push changes to `main` / `master`
- GitHub Actions runs `pnpm install`
- `pnpm build` creates the production build in `dist/`
- The build is deployed automatically to Pages

## Local development

```bash
pnpm install
pnpm dev
```

## Notes

If you later add Vue Router with history mode, you will need a 404 fallback strategy for Pages.
