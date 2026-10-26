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

## Vercel database

Projects must be saved through the API to appear in every browser. Vercel does
not provide persistent local SQLite storage, so configure `TURSO_DATABASE_URL`
and `TURSO_AUTH_TOKEN` in the Vercel project environment variables. The local
`sqlite.db` is only for local development and is not shared with production.
