# Vue Launchpad Air Mode

Minimalistický launcher ve Vue 3 + Vite s jemnějším air-mode vzhledem.

## Co umí

- načítá aplikace ze statického CSV: `public/data/apps.csv`
- filtruje podle tagů a fulltextu
- simuluje provoz bez backendu
- zobrazuje detail v minimalistickém modalu
- je připravený pro GitHub Pages deploy po commitu

## Spuštění

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

Workflow je v `.github/workflows/deploy.yml`.

Nastavení repozitáře na GitHub Pages:
1. Pusť commit do `main`
2. V repozitáři nastav Pages na `GitHub Actions`
3. Workflow buildne projekt a publikuje `dist`

## Úprava dat

Všechna data jsou v `public/data/apps.csv`.

Sloupce:
- `id`
- `name`
- `desc`
- `url`
- `icon`
- `color`
- `tags`
- `status`
- `baseUsers`
- `baseLatency`
- `lastSeen`
- `featured`

`tags` jsou oddělené znakem `|`.
