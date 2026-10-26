import app, { ensureDbInitialized } from '../server-app';

export default async function handler(req: any, res: any) {
   try {
      await ensureDbInitialized();
      return app(req, res);
   } catch (err: any) {
      console.error('Vercel serverless initialization error:', err);
      res.status(500).json({ error: 'Server error: ' + (err?.message || String(err)) });
   }
}
