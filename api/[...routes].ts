import app, { ensureDbInitialized } from '../server-app';

export default async function handler(req: any, res: any) {
   try {
      await ensureDbInitialized();

      if (req.query?.routes) {
         const routeParts = Array.isArray(req.query.routes) ? req.query.routes : [req.query.routes];
         const apiPath = `/api/${routeParts.join('/')}`;
         if (!req.url.startsWith(apiPath)) {
            const queryIndex = req.url.indexOf('?');
            const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
            req.url = `${apiPath}${query}`;
         }
      }

      return app(req, res);
   } catch (err: any) {
      console.error('Vercel serverless route error:', err);
      res.status(500).json({ error: 'Server error: ' + (err?.message || String(err)) });
   }
}
