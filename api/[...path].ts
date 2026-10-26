import type { RequestHandler } from 'express';
import { app, initializeDatabase } from '../server';

let databaseReady: Promise<void> | undefined;

const handler: RequestHandler = async (req, res) => {
  try {
    if (!databaseReady) {
      databaseReady = initializeDatabase().catch((error: unknown) => {
        databaseReady = undefined;
        throw error;
      });
    }

    await databaseReady;
    app(req, res);
  } catch (error) {
    console.error('Vercel API initialization failed:', error);
    res.status(500).json({
      error: 'API initialization failed. Check the Vercel function logs and database environment variables.',
    });
  }
};

export default handler;
