# Kanban Project Manager

A single-board Kanban web app: five renameable columns, cards with a title and details, add/delete, and drag and drop.

Board state is saved to Upstash Redis when configured (see Deploy below), so it survives refreshes and syncs across devices. Without that configured, it falls back to in-memory dummy data that resets on refresh.

## Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

```bash
cd frontend
npm test
npx playwright install chromium
npm run test:e2e
```

## Deploy

1. Push this repo to GitHub and import it into [Vercel](https://vercel.com/new), setting the project root to `frontend`.
2. In the Vercel project, go to Storage, add the **Upstash** integration, and create a Redis database. This injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically.
3. Redeploy. The board now persists and is reachable from any device at your Vercel URL.

For local development against the same database, copy the two env vars into `frontend/.env.local` (see `frontend/.env.example`).
