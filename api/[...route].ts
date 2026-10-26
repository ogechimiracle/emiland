import app, { ensureDbInitialized } from '../server-app';

export default async function handler(req: any, res: any) {
  try {
    await ensureDbInitialized();

    if (req.url === '/api/index' || req.url === '/api' || req.url === '/') {
      if (req.originalUrl && req.originalUrl.startsWith('/api') && req.originalUrl !== req.url) {
        req.url = req.originalUrl;
      }
    }

    if (req.query?.route) {
      const parts = Array.isArray(req.query.route) ? req.query.route : [req.query.route];
      req.url = '/api/' + parts.join('/');
    }

    return app(req, res);
  } catch (err: any) {
    console.error('Vercel serverless catch-all error:', err);
    res.status(500).json({ error: 'Server error: ' + (err?.message || String(err)) });
  }
}
