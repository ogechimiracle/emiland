import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, client, initializeDatabase } from './src/db/index';
import * as schema from './src/db/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser('maison-terre-secret-key-2026'));

// Ensure uploads folder exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage for media uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for video & large images
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, AVIF, MP4, WebM.`));
    }
  },
});

// Session Management: Cryptographically signed token so authentication persists across server restarts
const SESSION_SECRET = process.env.SESSION_SECRET || 'maison-terre-secure-auth-secret-key-2026';

function generateSession(userId: string, email: string) {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const data = `${userId}:${email}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
  const token = `${Buffer.from(data).toString('base64url')}.${hmac}`;
  return { token, expiresAt };
}

function verifyAuth(req: express.Request): { userId: string; email: string } | null {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies?.session_token) {
    token = req.cookies.session_token;
  }

  if (!token || !token.includes('.')) return null;

  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const data = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const [userId, email, expiresAtStr] = data.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return null;
    }

    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return { userId, email };
    }
  } catch (err) {
    return null;
  }

  return null;
}

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = verifyAuth(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Owner authentication required' });
    return;
  }
  (req as any).user = user;
  next();
};

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const userResult = await client.execute({
      sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
      args: [email.toLowerCase().trim()],
    });

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = userResult.rows[0] as any;
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const { token, expiresAt } = generateSession(user.id, user.email);

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('session_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Auth: Current User
app.get('/api/auth/me', async (req, res) => {
  const auth = verifyAuth(req);
  if (!auth) {
    res.json({ authenticated: false, user: null });
    return;
  }

  const userResult = await client.execute({
    sql: 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    args: [auth.userId],
  });

  if (userResult.rows.length === 0) {
    res.json({ authenticated: false, user: null });
    return;
  }

  res.json({
    authenticated: true,
    user: userResult.rows[0],
  });
});

// Auth: Change Password
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = (req as any).user;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }

    const userResult = await client.execute({
      sql: 'SELECT password_hash FROM users WHERE id = ?',
      args: [user.userId],
    });

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, (userResult.rows[0] as any).password_hash);
    if (!isMatch) {
      res.status(400).json({ error: 'Current password incorrect' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();

    await client.execute({
      sql: 'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      args: [newHash, now, user.userId],
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update password' });
  }
});

// -------------------------------------------------------------
// PROJECTS API
// -------------------------------------------------------------

function formatProjectRow(row: any) {
  if (!row) return row;
  return {
    ...row,
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description || row.shortDescription || '',
    description: row.description || '',
    coverMediaUrl: row.cover_media_url || row.coverMediaUrl || '',
    categoryId: row.category_id || row.categoryId || '',
    location: row.location || '',
    completionDate: row.completion_date || row.completionDate || '',
    status: row.status || 'published',
    featured: row.featured === 1 || row.featured === true ? 1 : 0,
    mediaType: row.media_type || row.mediaType || 'image',
    videoUrl: row.video_url || row.videoUrl || '',
    clientName: row.client_name || row.clientName || '',
    squareFootage: row.square_footage || row.squareFootage || '',
    publishedAt: row.published_at || row.publishedAt || '',
    createdAt: row.created_at || row.createdAt || '',
    updatedAt: row.updated_at || row.updatedAt || '',
    category_name: row.category_name,
    category_slug: row.category_slug,
  };
}

// List Projects (Public sees published; authenticated owner can see all & drafts)
app.get('/api/projects', async (req, res) => {
  try {
    const isOwner = verifyAuth(req) !== null;
    const { category, search, status, featured } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const args: any[] = [];

    // Security: unauthenticated visitors only see published projects
    if (!isOwner) {
      query += ` AND p.status = 'published'`;
    } else if (status) {
      query += ` AND p.status = ?`;
      args.push(status);
    }

    if (category && category !== 'all') {
      query += ` AND (c.slug = ? OR p.category_id = ?)`;
      args.push(category, category);
    }

    if (featured === 'true' || featured === '1') {
      query += ` AND p.featured = 1`;
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ` AND (p.title LIKE ? OR p.short_description LIKE ? OR p.location LIKE ?)`;
      const term = `%${search.trim()}%`;
      args.push(term, term, term);
    }

    query += ` ORDER BY p.featured DESC, p.created_at DESC`;

    const result = await client.execute({ sql: query, args });
    const formatted = result.rows.map(formatProjectRow);
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch projects' });
  }
});

// Get Single Project by Slug or ID
app.get('/api/projects/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const isOwner = verifyAuth(req) !== null;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.slug = ? OR p.id = ?)
    `;
    const args: any[] = [slugOrId, slugOrId];

    if (!isOwner) {
      query += ` AND p.status = 'published'`;
    }

    query += ` LIMIT 1`;

    const result = await client.execute({ sql: query, args });
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const project = formatProjectRow(result.rows[0]);

    // Fetch media gallery items
    const mediaResult = await client.execute({
      sql: `SELECT * FROM media WHERE project_id = ? ORDER BY sort_order ASC, created_at ASC`,
      args: [project.id],
    });

    res.json({
      ...project,
      gallery: mediaResult.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch project' });
  }
});

// Create Project (Owner only)
app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const title = String(body.title || '').trim();
    if (!title) {
      res.status(400).json({ error: 'Project title is required' });
      return;
    }

    let slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const shortDescription = String(body.shortDescription || body.short_description || '').trim();
    const description = String(body.description || '').trim();
    const coverMediaUrl = String(body.coverMediaUrl || body.cover_media_url || '').trim() || '/src/assets/images/hero_interior_living_1792750666855.jpg';
    const categoryId = body.categoryId || body.category_id || null;
    const location = String(body.location || '').trim();
    const completionDate = String(body.completionDate || body.completion_date || '').trim();
    const status = body.status === 'draft' ? 'draft' : 'published';
    const featured = body.featured === 1 || body.featured === true || body.featured === '1' ? 1 : 0;
    const mediaType = body.mediaType || body.media_type || 'image';
    const videoUrl = String(body.videoUrl || body.video_url || '').trim();
    const clientName = String(body.clientName || body.client_name || '').trim();
    const squareFootage = String(body.squareFootage || body.square_footage || '').trim();
    const galleryUrls: string[] = Array.isArray(body.galleryUrls) ? body.galleryUrls : (Array.isArray(body.gallery_urls) ? body.gallery_urls : []);

    // Check slug uniqueness
    const slugCheck = await client.execute({
      sql: 'SELECT id FROM projects WHERE slug = ?',
      args: [slug],
    });
    if (slugCheck.rows.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const id = `proj_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    const publishedAt = status === 'published' ? now : null;

    // Verify categoryId exists, or set to null
    let validCatId: string | null = null;
    if (categoryId) {
      const catCheck = await client.execute({ sql: 'SELECT id FROM categories WHERE id = ?', args: [categoryId] });
      if (catCheck.rows.length > 0) validCatId = categoryId;
    }

    await client.execute({
      sql: `INSERT INTO projects (
        id, title, slug, short_description, description, cover_media_url,
        category_id, location, completion_date, status, featured, media_type,
        video_url, client_name, square_footage, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        title,
        slug,
        shortDescription || title,
        description || shortDescription || title,
        coverMediaUrl,
        validCatId,
        location,
        completionDate,
        status,
        featured,
        mediaType,
        videoUrl,
        clientName,
        squareFootage,
        publishedAt,
        now,
        now,
      ],
    });

    // Insert cover into media table
    await client.execute({
      sql: `INSERT INTO media (id, project_id, media_type, storage_key, original_filename, mime_type, size_bytes, alt_text, sort_order, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `med_${id}_cover`,
        id,
        mediaType === 'video' ? 'video' : 'image',
        coverMediaUrl,
        `${slug}-cover`,
        'image/jpeg',
        0,
        title,
        0,
        now,
      ],
    });

    // Insert additional gallery media if provided
    for (let i = 0; i < galleryUrls.length; i++) {
      const gUrl = galleryUrls[i];
      if (gUrl && gUrl !== coverMediaUrl) {
        const isVid = gUrl.endsWith('.mp4') || gUrl.endsWith('.webm') || gUrl.includes('youtube') || gUrl.includes('vimeo');
        await client.execute({
          sql: `INSERT INTO media (id, project_id, media_type, storage_key, original_filename, mime_type, size_bytes, alt_text, sort_order, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            `med_${id}_gal_${i}`,
            id,
            isVid ? 'video' : 'image',
            gUrl,
            `${slug}-gallery-${i + 1}`,
            isVid ? 'video/mp4' : 'image/jpeg',
            0,
            `${title} view ${i + 1}`,
            i + 1,
            now,
          ],
        });
      }
    }

    res.status(201).json({ success: true, id, slug });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project' });
  }
});

// Update Project (Owner only)
app.put('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const title = String(body.title || '').trim();
    if (!title) {
      res.status(400).json({ error: 'Project title is required' });
      return;
    }

    let slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Check slug uniqueness across other projects
    const slugCheck = await client.execute({
      sql: 'SELECT id FROM projects WHERE slug = ? AND id != ?',
      args: [slug, id],
    });
    if (slugCheck.rows.length > 0) {
      res.status(400).json({ error: 'Another project with this slug already exists.' });
      return;
    }

    const shortDescription = String(body.shortDescription || body.short_description || '').trim();
    const description = String(body.description || '').trim();
    const coverMediaUrl = String(body.coverMediaUrl || body.cover_media_url || '').trim() || '/src/assets/images/hero_interior_living_1792750666855.jpg';
    const categoryId = body.categoryId || body.category_id || null;
    const location = String(body.location || '').trim();
    const completionDate = String(body.completionDate || body.completion_date || '').trim();
    const status = body.status === 'draft' ? 'draft' : 'published';
    const featured = body.featured === 1 || body.featured === true || body.featured === '1' ? 1 : 0;
    const mediaType = body.mediaType || body.media_type || 'image';
    const videoUrl = String(body.videoUrl || body.video_url || '').trim();
    const clientName = String(body.clientName || body.client_name || '').trim();
    const squareFootage = String(body.squareFootage || body.square_footage || '').trim();
    const galleryUrls: string[] = Array.isArray(body.galleryUrls) ? body.galleryUrls : (Array.isArray(body.gallery_urls) ? body.gallery_urls : []);

    let validCatId: string | null = null;
    if (categoryId) {
      const catCheck = await client.execute({ sql: 'SELECT id FROM categories WHERE id = ?', args: [categoryId] });
      if (catCheck.rows.length > 0) validCatId = categoryId;
    }

    const now = new Date().toISOString();

    await client.execute({
      sql: `UPDATE projects SET
        title = ?, slug = ?, short_description = ?, description = ?,
        cover_media_url = ?, category_id = ?, location = ?, completion_date = ?,
        status = ?, featured = ?, media_type = ?, video_url = ?, client_name = ?,
        square_footage = ?, updated_at = ?
        WHERE id = ?`,
      args: [
        title,
        slug,
        shortDescription || title,
        description || shortDescription || title,
        coverMediaUrl,
        validCatId,
        location,
        completionDate,
        status,
        featured,
        mediaType,
        videoUrl,
        clientName,
        squareFootage,
        now,
        id,
      ],
    });

    // Update gallery media
    if (galleryUrls) {
      await client.execute({
        sql: 'DELETE FROM media WHERE project_id = ?',
        args: [id],
      });

      // Cover
      await client.execute({
        sql: `INSERT INTO media (id, project_id, media_type, storage_key, original_filename, mime_type, size_bytes, alt_text, sort_order, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `med_${id}_cover_${Date.now()}`,
          id,
          mediaType === 'video' ? 'video' : 'image',
          coverMediaUrl,
          `${slug}-cover`,
          'image/jpeg',
          0,
          title,
          0,
          now,
        ],
      });

      // Gallery items
      for (let i = 0; i < galleryUrls.length; i++) {
        const gUrl = galleryUrls[i];
        if (gUrl && gUrl !== coverMediaUrl) {
          const isVid = gUrl.endsWith('.mp4') || gUrl.endsWith('.webm') || gUrl.includes('youtube') || gUrl.includes('vimeo');
          await client.execute({
            sql: `INSERT INTO media (id, project_id, media_type, storage_key, original_filename, mime_type, size_bytes, alt_text, sort_order, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              `med_${id}_gal_${i}_${Date.now()}`,
              id,
              isVid ? 'video' : 'image',
              gUrl,
              `${slug}-view-${i + 1}`,
              isVid ? 'video/mp4' : 'image/jpeg',
              0,
              `${title} view ${i + 1}`,
              i + 1,
              now,
            ],
          });
        }
      }
    }

    res.json({ success: true, message: 'Project updated successfully', slug });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update project' });
  }
});

// Delete Project (Owner only)
app.delete('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await client.execute({
      sql: 'DELETE FROM media WHERE project_id = ?',
      args: [id],
    });
    await client.execute({
      sql: 'DELETE FROM projects WHERE id = ?',
      args: [id],
    });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete project' });
  }
});

// Quick Toggle Publish / Draft
app.patch('/api/projects/:id/publish', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status === 'published' ? 'published' : 'draft';
    const now = new Date().toISOString();

    await client.execute({
      sql: 'UPDATE projects SET status = ?, updated_at = ? WHERE id = ?',
      args: [newStatus, now, id],
    });
    res.json({ success: true, status: newStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

// Quick Toggle Featured
app.patch('/api/projects/:id/featured', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    const isFeatured = featured ? 1 : 0;
    const now = new Date().toISOString();

    await client.execute({
      sql: 'UPDATE projects SET featured = ?, updated_at = ? WHERE id = ?',
      args: [isFeatured, now, id],
    });
    res.json({ success: true, featured: isFeatured });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update featured' });
  }
});

// -------------------------------------------------------------
// MEDIA UPLOAD API
// -------------------------------------------------------------
app.post('/api/media/upload', requireAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// -------------------------------------------------------------
// CATEGORIES API
// -------------------------------------------------------------
app.get('/api/categories', async (_req, res) => {
  try {
    const result = await client.execute('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
});

app.post('/api/categories', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `cat_${Date.now()}`;
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO categories (id, name, slug, description, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [id, name.trim(), slug, description || '', 0, now, now],
    });

    res.status(201).json({ success: true, id, name, slug });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create category' });
  }
});

app.delete('/api/categories/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await client.execute({
      sql: 'DELETE FROM categories WHERE id = ?',
      args: [id],
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete category' });
  }
});

// -------------------------------------------------------------
// SITE SETTINGS API
// -------------------------------------------------------------
app.get('/api/settings', async (_req, res) => {
  try {
    const result = await client.execute('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    for (const row of result.rows as any[]) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch settings' });
  }
});

app.put('/api/settings', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ error: 'Invalid settings payload' });
      return;
    }

    const now = new Date().toISOString();
    for (const [key, value] of Object.entries(updates)) {
      if (key && value !== undefined && value !== null) {
        await client.execute({
          sql: `INSERT INTO site_settings (id, key, value, updated_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
          args: [`setting_${key}`, key, String(value), now],
        });
      }
    }

    const result = await client.execute('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    for (const row of result.rows as any[]) {
      settings[row.key] = row.value;
    }

    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update settings' });
  }
});

// -------------------------------------------------------------
// INQUIRIES & CONSULTATIONS API
// -------------------------------------------------------------
app.post('/api/inquiries', async (req, res) => {
  try {
    const inquirySchema = z.object({
      name: z.string().min(2, 'Please provide your full name'),
      email: z.string().email('Please enter a valid email address'),
      phone: z.string().optional(),
      service: z.string().min(2, 'Please select a service'),
      budgetRange: z.string().optional(),
      timeline: z.string().optional(),
      message: z.string().min(10, 'Please share some details about your spatial project'),
    });

    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid inquiry form' });
      return;
    }

    const data = parsed.data;
    const id = `inq_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO inquiries (id, name, email, phone, service, budget_range, timeline, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        data.name,
        data.email,
        data.phone || '',
        data.service,
        data.budgetRange || '',
        data.timeline || '',
        data.message,
        'unread',
        now,
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Consultation request received. Our studio will contact you within one business day.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit consultation request' });
  }
});

app.get('/api/inquiries', requireAuth, async (_req, res) => {
  try {
    const result = await client.execute('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch inquiries' });
  }
});

app.patch('/api/inquiries/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await client.execute({
      sql: 'UPDATE inquiries SET status = ? WHERE id = ?',
      args: [status, id],
    });
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

// -------------------------------------------------------------
// DASHBOARD STATS API
// -------------------------------------------------------------
app.get('/api/stats', requireAuth, async (_req, res) => {
  try {
    const totalProj = await client.execute('SELECT COUNT(*) as count FROM projects');
    const publishedProj = await client.execute("SELECT COUNT(*) as count FROM projects WHERE status = 'published'");
    const draftProj = await client.execute("SELECT COUNT(*) as count FROM projects WHERE status = 'draft'");
    const featuredProj = await client.execute('SELECT COUNT(*) as count FROM projects WHERE featured = 1');
    const unreadInquiries = await client.execute("SELECT COUNT(*) as count FROM inquiries WHERE status = 'unread'");
    const totalInquiries = await client.execute('SELECT COUNT(*) as count FROM inquiries');

    res.json({
      totalProjects: Number(totalProj.rows[0]?.count || 0),
      publishedProjects: Number(publishedProj.rows[0]?.count || 0),
      draftProjects: Number(draftProj.rows[0]?.count || 0),
      featuredProjects: Number(featuredProj.rows[0]?.count || 0),
      unreadInquiries: Number(unreadInquiries.rows[0]?.count || 0),
      totalInquiries: Number(totalInquiries.rows[0]?.count || 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

// -------------------------------------------------------------
// SERVER START & VITE MIDDLEWARE
// -------------------------------------------------------------
async function startServer() {
  await initializeDatabase();
  console.log('✅ SQLite Database initialized with Drizzle schemas.');

  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    // Production: serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development: integrate Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Maison Terre Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
