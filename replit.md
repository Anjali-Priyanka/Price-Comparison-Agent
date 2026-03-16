# Price Agent Browser

## Overview

An AI-powered product price comparison tool that searches Amazon, Flipkart, and Croma to find the best deal for any product.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS (artifacts/price-agent-browser)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **HTML parsing**: jsdom (for scraping)
- **Build**: esbuild (CJS bundle)

## Structure

```text
workspace/
├── artifacts/
│   ├── api-server/             # Express API server
│   │   └── src/
│   │       ├── scrapers/       # Platform scrapers + AI agent orchestrator
│   │       │   ├── agent.ts    # Orchestrates all scrapers, finds best deal
│   │       │   ├── amazon.ts   # Amazon.in scraper
│   │       │   ├── flipkart.ts # Flipkart scraper
│   │       │   ├── croma.ts    # Croma scraper
│   │       │   └── types.ts    # Shared PlatformResult type
│   │       └── routes/
│   │           ├── compare.ts  # POST /api/compare, GET /api/history
│   │           └── health.ts   # GET /api/healthz
│   └── price-agent-browser/    # React + Vite frontend
│       └── src/
│           ├── components/     # ResultCard, SearchHero, HistorySection, PlatformIcon
│           ├── pages/          # home.tsx
│           └── App.tsx
├── lib/
│   ├── api-spec/               # OpenAPI spec + Orval codegen config
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas
│   └── db/
│       └── src/schema/
│           └── searches.ts     # searches table (stores search history)
└── pnpm-workspace.yaml
```

## API Endpoints

- `POST /api/compare` — body: `{ query: string }` → returns price comparison from all platforms
- `GET /api/history?limit=10` — returns recent searches
- `GET /api/healthz` — health check

## Features

1. User enters a product name or URL
2. Agent searches Amazon, Flipkart, and Croma in parallel
3. Extracts price, discount, rating, shipping, delivery, and links
4. Calculates effective price (price + shipping)
5. Highlights the best deal
6. Stores search history in PostgreSQL

## Running in Development

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/price-agent-browser run dev
```

## Database

PostgreSQL via Replit. Schema managed with Drizzle ORM.

```bash
# Push schema changes
pnpm --filter @workspace/db run push
```

## Notes

- Amazon scraping works reliably. Flipkart and Croma may return errors due to bot detection (429/403) — this is handled gracefully as partial results.
- Results from successful platforms are still displayed with the best deal highlighted.
