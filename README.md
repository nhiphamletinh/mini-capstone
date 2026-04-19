# mini-capstone — PathwayAI

PathwayAI is a small Vite + React app that collects a student's profile (three tracks: Secondary, High School, University) and generates a personalized study‑abroad plan via a small local proxy to an LLM (Claude/Anthropic). The repo includes a development proxy (`server/index.js`) that keeps the LLM API key server‑side.

## What it contains
- `src/App.jsx` — the single‑file React UI and intake flow (question tree, prompt builders, renderer).
- `server/index.js` — Express proxy that builds the system + user prompt and forwards to the LLM. Supports `MOCK_CLAUDE` for offline testing.
- `.env.example` — template for `CLAUDE_API_KEY` and `PORT`.

## Quick start (development)

1. Install dependencies

```bash
npm install
```

2. Create a local `.env` from the example and add your Claude/Anthropic key (do NOT commit this file)

```bash
cp .env.example .env
# then edit .env and set CLAUDE_API_KEY
```

3. Start the backend proxy (mock mode available)

```bash
# Mock mode: returns a canned plan without calling the real API
MOCK_CLAUDE=true node server/index.js

# Real mode (requires CLAUDE_API_KEY in your environment)
node server/index.js
```

4. Start the frontend dev server

```bash
npm run dev
```

5. Open the app in your browser: http://localhost:5173

## Notes on usage
- The frontend POSTs the completed `profile` to `POST /api/generate` on the proxy. The proxy builds a `system` prompt and a `user` prompt and sends them to the LLM as:

```json
{
	"model": "claude-sonnet-4-20250514",
	"max_tokens": 2000,
	"system": "...",
	"messages": [{ "role": "user", "content": "..." }]
}
```

- `MOCK_CLAUDE=true` is useful for UI and integration testing without consuming API quota.
- The proxy keeps your `CLAUDE_API_KEY` server‑side so it is never exposed to the browser.

## Development tips
- If you see `EADDRINUSE` when starting the proxy, another process is using port 3000. Kill it (e.g. `lsof -ti:3000` → `kill <pid>`) and restart.
- If the upstream LLM rejects requests, check the `anthropic-version` header and your API key permissions.

## Running tests / CI
No automated tests are included; add unit tests for prompt builders and integration tests that run the proxy in `MOCK_CLAUDE` mode.
