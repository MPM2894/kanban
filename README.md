# Kanban Project Manager

A single-board Kanban web app: five renameable columns, cards with a title and details, add/delete, and drag and drop. State lives in memory and resets on refresh.

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
