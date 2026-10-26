import app, { ensureDbInitialized } from '../server-app';

export default async function handler(req: any, res: any) {
   try {
      await ensureDbInitialized();

      if (req.query?.route) {
         const routeParts = Array.isArray(req.query.route) ? req.query.route : [req.query.route];
         const subPath = '/' + routeParts.join('/');
         if (!req.url.includes(subPath)) {
            req.url = subPath;
         }
      }

      return app(req, res);
   } catch (err: any) {
      console.error('Vercel serverless route error:', err);
      res.status(500).json({ error: 'Server error: ' + (err?.message || String(err)) });
   }
}
