# Pulse Plan Frontend

Next.js PWA for Pulse Plan.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

## PWA

`next-pwa` creates the service worker during production builds. Offline task actions are stored in IndexedDB using localForage and replayed when the browser returns online.

