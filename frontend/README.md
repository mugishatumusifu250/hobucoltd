# HOBUCO Frontend

This folder contains the React/Vite frontend. The original HOBUCO CSS files and static images are retained under `public/` and are referenced by the React components in `src/`.

## Install and run

```bash
npm install
npm run dev
```

The Vite development server runs on port `5173` and proxies `/api` requests to the backend at `http://localhost:3001`.

## Production build

```bash
npm run build
```

The resulting `dist/` folder is served by the sibling backend when the backend is started in production mode.
