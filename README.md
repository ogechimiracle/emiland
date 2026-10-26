<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/806c3246-0967-48e1-b549-902f84d1db7c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

Vercel serves the Vite build as a static site and routes `/api/*` requests to the
Express function in `api/[...path].ts`. The rewrite also serves the SPA entry
point for routes such as `/admin` when they are opened directly.

Before deploying, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in the Vercel
project's environment variables. Local development continues to use `sqlite.db`
when no database URL is configured. Vercel's function filesystem is temporary;
uploads should be moved to persistent object storage before relying on them in
production.
